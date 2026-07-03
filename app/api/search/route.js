import { NextResponse } from "next/server";
import { searchSampleVenues, searchLiveVenues, searchCommunityVenues, sortVenues } from "../../../lib/search";
import { mapsSearchUrl, mapsEmbedUrl, socialLinks } from "../../../lib/links";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const sp = request.nextUrl.searchParams;
  const params = {
    q: sp.get("q") || "",
    country: sp.get("country") || "",
    city: sp.get("city") || "",
    categories: (sp.get("categories") || "").split(",").filter(Boolean),
    includeAdult: sp.get("adult") === "1",
    minRating: parseFloat(sp.get("minRating")) || 0,
    sort: sp.get("sort") || "rating",
  };

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  let venues;
  let source = "demo";

  if (apiKey) {
    try {
      venues = await searchLiveVenues(apiKey, params);
      source = "live";
    } catch (err) {
      console.error("Live search failed, falling back to demo data:", err);
    }
  }
  if (!venues) venues = searchSampleVenues(params);

  let community = [];
  try {
    community = await searchCommunityVenues(params);
  } catch (err) {
    console.error("Community venue search failed:", err);
  }

  const merged = sortVenues([...venues, ...community], params.sort);

  const results = merged.map((venue) => ({
    ...venue,
    mapsUrl: venue.googleMapsUri || mapsSearchUrl(venue),
    mapsEmbedUrl: mapsEmbedUrl(venue),
    socials: socialLinks(venue),
  }));

  return NextResponse.json({ source, count: results.length, results });
}
