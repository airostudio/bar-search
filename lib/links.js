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
