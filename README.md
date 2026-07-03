# BarAtlas 🌍 — Global Bar & Nightlife Search

A full-search website for bars and nightlife venues in **every country** — pubs, cocktail
bars, nightclubs, karaoke, rooftop and beach bars, plus age-gated adult categories
(gentlemen's clubs, hostess bars, host bars, cabarets, adult lounges).

## Features

- **Full search** — free-text keyword, country (all 273 ISO countries/territories),
  city, multi-select categories, minimum rating, and sorting.
- **Google Maps** — every venue has an embedded map (no API key needed for the embed)
  plus an "open in Google Maps" link.
- **Live worldwide data** — set a Google Places API key and every search hits the
  Google Places API (New) for real venues in any country. Without a key the site runs
  on a bundled demo dataset (~55 venues across 40+ countries) so it's fully browsable
  out of the box.
- **Social & search-engine lookups** — every venue card has one-click buttons that open
  live results for that venue on Instagram, Facebook, TikTok, Google, Bing, DuckDuckGo,
  and Yandex.
- **18+ age gate** — adult venue categories are hidden behind an age confirmation,
  remembered per browser.

## Why links instead of scrapers?

Automated scraping of Instagram and Facebook violates Meta's Terms of Service, is
blocked technically (login walls, aggressive rate limiting, IP bans), and has been
litigated by Meta. Search engines similarly prohibit automated scraping of results.
BarAtlas therefore uses:

1. the **Google Places API** — the legal, supported way to get worldwide venue data
   (names, addresses, coordinates, ratings, websites, phone numbers, open-now status), and
2. **deep links** that drop the user directly into each platform's own live search for
   the venue — same information, zero ToS risk, always up to date.

If you need social-media data in bulk, use licensed providers (e.g. Meta's official
Graph API for pages you manage, or commercial data vendors) — the `lib/links.js`
module is the single place to extend.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

Runs immediately on demo data.

## Enable live worldwide search

1. Create an API key at https://console.cloud.google.com/apis/credentials
2. Enable **Places API (New)** for the project.
3. Copy `.env.example` to `.env` and set:

   ```
   GOOGLE_PLACES_API_KEY=your-key-here
   ```

4. Restart the server. The results badge switches from **Demo data** to
   **Live data · Google Places**.

Note: the Places API is a paid Google service with a monthly free tier; each search
issues one request per selected category.

## Project layout

```
app/
  page.jsx             # search UI (filters, chips, age gate, results grid)
  layout.jsx           # root layout + metadata
  globals.css          # dark nightlife theme
  api/search/route.js  # search endpoint: live Places API or demo fallback
components/
  VenueCard.jsx        # venue card with on-demand map embed + social links
  AgeGate.jsx          # 18+ confirmation modal
lib/
  search.js            # filtering/sorting + Places API (New) client
  categories.js        # venue taxonomy (adult categories flagged)
  countries.js         # AUTO-GENERATED full ISO country list
  sampleVenues.js      # demo dataset (fictional venues, real city coordinates)
  links.js             # Google Maps + social/search-engine link builders
scripts/
  generate-countries.mjs  # regenerates lib/countries.js (npm run generate:countries)
```

## Deploying

Standard Next.js app — deploys as-is to Vercel, Netlify, or any Node host
(`npm run build && npm start`). Set `GOOGLE_PLACES_API_KEY` in the host's environment
variables.

## Legal notes

- The demo dataset is fictional and for illustration only.
- Adult-venue listings are informational; verify local laws and licensing.
- Google Maps/Places usage is subject to Google's terms of service.
