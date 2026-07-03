import { SAMPLE_VENUES } from "./sampleVenues";
import { CATEGORY_BY_ID, ADULT_CATEGORY_IDS } from "./categories";
import { COUNTRY_NAME } from "./countries";

const norm = (s) =>
  (s || "").toString().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

export function isAdultCategory(categoryId) {
  return ADULT_CATEGORY_IDS.has(categoryId);
}

function decorate(venue) {
  const cat = CATEGORY_BY_ID[venue.category];
  return {
    ...venue,
    country: COUNTRY_NAME[venue.countryCode] || venue.countryCode,
    categoryLabel: cat ? cat.label : venue.category,
    categoryIcon: cat ? cat.icon : "🍸",
    adult: venue.adult ?? Boolean(cat?.adult),
  };
}

export function searchSampleVenues({ q, country, city, categories, includeAdult, minRating, sort }) {
  const nq = norm(q);
  const ncity = norm(city);
  const wanted = categories && categories.length ? new Set(categories) : null;

  let results = SAMPLE_VENUES.map(decorate).filter((venue) => {
    if (!includeAdult && venue.adult) return false;
    if (country && venue.countryCode !== country) return false;
    if (ncity && !norm(venue.city).includes(ncity)) return false;
    if (wanted && !wanted.has(venue.category)) return false;
    if (minRating && (venue.rating || 0) < minRating) return false;
    if (nq) {
      const haystack = norm(
        `${venue.name} ${venue.city} ${venue.country} ${venue.categoryLabel} ${venue.description}`
      );
      if (!haystack.includes(nq)) return false;
    }
    return true;
  });

  if (sort === "name") results.sort((a, b) => a.name.localeCompare(b.name));
  else results.sort((a, b) => (b.rating || 0) - (a.rating || 0)); // default: rating

  return results;
}

// ---------------------------------------------------------------------------
// Live search — Google Places API (New) Text Search. Enabled when
// GOOGLE_PLACES_API_KEY is set. Covers every country with real venues.
// ---------------------------------------------------------------------------

const PLACES_ENDPOINT = "https://places.googleapis.com/v1/places:searchText";
const PLACES_FIELDS = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.websiteUri",
  "places.googleMapsUri",
  "places.internationalPhoneNumber",
  "places.currentOpeningHours.openNow",
].join(",");

const PRICE_LEVEL_MAP = {
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

function buildTextQuery({ q, country, city, categoryId }) {
  const cat = CATEGORY_BY_ID[categoryId];
  const parts = [q, cat ? cat.placesQuery : "bar"];
  const place = [city, country ? COUNTRY_NAME[country] : ""].filter(Boolean).join(", ");
  if (place) parts.push(`in ${place}`);
  return parts.filter(Boolean).join(" ");
}

async function placesTextSearch(apiKey, params) {
  const body = { textQuery: buildTextQuery(params), pageSize: 20 };
  if (params.country) body.regionCode = params.country;
  if (params.minRating) body.minRating = params.minRating;

  const res = await fetch(PLACES_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": PLACES_FIELDS,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Places API ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data = await res.json();
  return (data.places || []).map((p) => decorate({
    id: p.id,
    name: p.displayName?.text || "Unnamed venue",
    category: params.categoryId,
    city: params.city || "",
    countryCode: params.country || "",
    address: p.formattedAddress,
    lat: p.location?.latitude,
    lng: p.location?.longitude,
    rating: p.rating,
    ratingCount: p.userRatingCount,
    price: PRICE_LEVEL_MAP[p.priceLevel],
    website: p.websiteUri,
    googleMapsUri: p.googleMapsUri,
    phone: p.internationalPhoneNumber,
    openNow: p.currentOpeningHours?.openNow,
    demo: false,
  }));
}

export async function searchLiveVenues(apiKey, { q, country, city, categories, includeAdult, minRating, sort }) {
  let cats = categories && categories.length ? categories : ["bar"];
  if (!includeAdult) cats = cats.filter((c) => !ADULT_CATEGORY_IDS.has(c));
  if (!cats.length) return [];

  // One Places query per selected category, merged and deduped by place id.
  const batches = await Promise.all(
    cats.map((categoryId) =>
      placesTextSearch(apiKey, { q, country, city, categoryId, minRating }).catch((err) => {
        console.error(`Places search failed for category ${categoryId}:`, err.message);
        return [];
      })
    )
  );

  const seen = new Map();
  for (const venue of batches.flat()) {
    if (!seen.has(venue.id)) seen.set(venue.id, venue);
  }
  const results = [...seen.values()];
  if (sort === "name") results.sort((a, b) => a.name.localeCompare(b.name));
  else results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  return results;
}
