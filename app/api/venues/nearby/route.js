import { NextResponse } from "next/server";
import {
  nearbySampleVenues,
  nearbyCommunityVenues,
  searchNearbyLiveVenues,
  searchLiveVenues,
  sortVenues,
} from "../../../../lib/search";
import { mapsSearchUrl, mapsEmbedUrl, socialLinks, areaMapEmbedUrl } from "../../../../lib/links";
import { CATEGORY_BY_ID } from "../../../../lib/categories";
import { COUNTRY_NAME } from "../../../../lib/countries";
import { attachOwnerData } from "../../../../lib/ownerStore";
import { withErrorHandling } from "../../../../lib/apiError";

export const dynamic = "force-dynamic";

// "Find me a better bar" — alternatives near the venue the user is currently
// looking at (excluding it), optionally filtered to a chosen vibe/category.
export const GET = withErrorHandling(async (request) => {
  const sp = request.nextUrl.searchParams;
  const params = {
    lat: sp.has("lat") ? parseFloat(sp.get("lat")) : null,
    lng: sp.has("lng") ? parseFloat(sp.get("lng")) : null,
    excludeId: sp.get("excludeId") || "",
    category: sp.get("category") || "",
    includeAdult: sp.get("adult") === "1",
    city: sp.get("city") || "",
    country: sp.get("country") || "",
  };

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  let venues;
  let source = "demo";

  if (apiKey) {
    try {
      if (params.lat != null && params.lng != null) {
        venues = await searchNearbyLiveVenues(apiKey, params);
      } else if (params.city || params.country) {
        venues = await searchLiveVenues(apiKey, {
          q: "",
          country: params.country,
          city: params.city,
          categories: params.category ? [params.category] : ["bar"],
          includeAdult: params.includeAdult,
          minRating: 0,
          sort: "rating",
        });
      }
      if (venues) source = "live";
    } catch (err) {
      console.error("Live nearby search failed, falling back to demo data:", err);
    }
  }
  if (!venues) venues = nearbySampleVenues(params);

  let community = [];
  try {
    community = await nearbyCommunityVenues(params);
  } catch (err) {
    console.error("Community nearby search failed:", err);
  }

  let merged = sortVenues([...venues, ...community], "rating");
  if (params.excludeId) merged = merged.filter((v) => String(v.id) !== String(params.excludeId));
  merged = merged.slice(0, 8);

  let results = merged.map((venue) => ({
    ...venue,
    mapsUrl: venue.googleMapsUri || mapsSearchUrl(venue),
    mapsEmbedUrl: mapsEmbedUrl(venue),
    socials: socialLinks(venue),
  }));

  try {
    results = await attachOwnerData(results);
  } catch (err) {
    console.error("Failed to attach owner data:", err);
  }

  const cat = CATEGORY_BY_ID[params.category];
  const areaQuery = `${cat ? cat.placesQuery : "bar"} near me`;
  const mapUrl = areaMapEmbedUrl({
    lat: params.lat,
    lng: params.lng,
    query: areaQuery,
    city: params.city,
    country: params.country ? COUNTRY_NAME[params.country] || params.country : "",
  });

  return NextResponse.json({ source, results, areaMapEmbedUrl: mapUrl });
});
