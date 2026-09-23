// Builds outbound lookup links for a venue: Google Maps plus one-click
// searches on Instagram, Facebook, TikTok, and the major search engines.
//
// Note: these are deep links into each platform's own search — NOT scrapers.
// Automated scraping of Instagram/Facebook violates Meta's Terms of Service
// and is technically blocked (login walls, rate limiting), so this site links
// users straight to live results on each platform instead.

export function mapsSearchUrl(venue) {
  if (venue.lat != null && venue.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${venue.name} ${venue.city || ""} ${venue.country || ""}`
  )}`;
}

export function mapsEmbedUrl(venue) {
  // The classic output=embed iframe works without an API key.
  if (venue.lat != null && venue.lng != null) {
    return `https://maps.google.com/maps?q=${venue.lat},${venue.lng}&z=16&output=embed`;
  }
  return `https://maps.google.com/maps?q=${encodeURIComponent(
    `${venue.name} ${venue.city || ""} ${venue.country || ""}`
  )}&z=15&output=embed`;
}

// A live Google Maps search around an area (not a specific venue) — used by
// the "find me a better bar" flow to show other venues on the map. Centers
// on lat/lng when known, otherwise biases the text search to the city/country.
export function areaMapEmbedUrl({ lat, lng, query, city, country }) {
  if (lat != null && lng != null) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&ll=${lat},${lng}&z=14&output=embed`;
  }
  const place = [city, country].filter(Boolean).join(", ");
  if (!place) return null;
  return `https://maps.google.com/maps?q=${encodeURIComponent(`${query} in ${place}`)}&z=13&output=embed`;
}

// Walking directions from the user's (geolocated) position to a venue.
// The classic saddr/daddr/output=embed trick works for directions too, no
// API key needed — dirflg=w requests the walking route.
export function walkingDirectionsEmbedUrl({ originLat, originLng, destLat, destLng }) {
  if (originLat == null || originLng == null || destLat == null || destLng == null) return null;
  return `https://maps.google.com/maps?saddr=${originLat},${originLng}&daddr=${destLat},${destLng}&dirflg=w&output=embed`;
}

// Opens real Google Maps (app or web) with walking directions. Omitting
// origin lets Google Maps itself fall back to "my location" when the link
// is opened directly, so this stays useful even without our own geolocation.
export function walkingDirectionsUrl({ originLat, originLng, destLat, destLng }) {
  const sp = new URLSearchParams({ api: "1", destination: `${destLat},${destLng}`, travelmode: "walking" });
  if (originLat != null && originLng != null) sp.set("origin", `${originLat},${originLng}`);
  return `https://www.google.com/maps/dir/?${sp}`;
}

export function socialLinks(venue) {
  const q = `${venue.name} ${venue.city || ""}`.trim();
  const enc = encodeURIComponent(q);
  return [
    { id: "instagram", label: "Instagram", url: `https://www.instagram.com/explore/search/keyword/?q=${enc}` },
    { id: "facebook",  label: "Facebook",  url: `https://www.facebook.com/search/pages/?q=${enc}` },
    { id: "tiktok",    label: "TikTok",    url: `https://www.tiktok.com/search?q=${enc}` },
    { id: "google",    label: "Google",    url: `https://www.google.com/search?q=${enc}` },
    { id: "bing",      label: "Bing",      url: `https://www.bing.com/search?q=${enc}` },
    { id: "ddg",       label: "DuckDuckGo", url: `https://duckduckgo.com/?q=${enc}` },
    { id: "yandex",    label: "Yandex",    url: `https://yandex.com/search/?text=${enc}` },
  ];
}
