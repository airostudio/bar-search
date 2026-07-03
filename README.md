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
- **Community submissions** — a public `/submit` form lets anyone propose a venue
  that's missing. Submissions queue at `/admin` (password-protected) for approval before
  they appear in search results.

## Why links instead of scrapers?

Automated scraping of Instagram, Facebook, and Google Maps/Search violates each
platform's Terms of Service, is blocked technically (login walls, rate limiting, IP
bans, CAPTCHAs), and has been the subject of active legal enforcement by these
companies. It's also fragile — a scraper breaks every time the target site's markup
changes. BarAtlas therefore uses three legitimate mechanisms instead:

1. **Google Places API** (New) — the official, licensed way to get worldwide venue
   data (names, addresses, coordinates, ratings, websites, phone numbers, open-now
   status). This *is* Google Maps' own database, kept current automatically — every
   search is a live query, so there's nothing to scrape or refresh manually.
2. **Community submissions** — the `/submit` + `/admin` flow above covers venues that
   aren't on Google Maps yet, or that you want to hand-curate, without touching anyone
   else's platform.
3. **Deep links** — one-click buttons that drop the user directly into each platform's
   own live search for a venue — same information, zero ToS risk, always up to date.

If you need social-media data in bulk, use licensed providers (e.g. Meta's official
Graph API for pages you manage, or commercial data vendors) — `lib/links.js` is the
single place to extend.

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

## Enable community submissions (recommended for production)

The `/submit` form and `/admin` queue work out of the box locally, but need two things
for production use:

1. **`ADMIN_PASSWORD`** — required to log into `/admin`. Without it, `/admin` refuses
   all logins (submissions still queue up, you just can't approve them yet).
2. **Persistent storage** — without it, submissions live in server memory and vanish on
   every restart/redeploy (fine for trying it out, not for real use). Add:

   ```
   KV_REST_API_URL=...
   KV_REST_API_TOKEN=...
   ```

   Easiest path on Vercel: **Storage** tab → add the **Upstash for Redis** integration
   → it injects these automatically. Or create a free database directly at
   https://console.upstash.com and copy its REST URL/token.

The `/admin` page shows a warning banner if persistent storage isn't configured, so
it's obvious when submissions are only living in memory.

Submissions are rate-limited (5 per IP per hour) and include a honeypot field, but for
a public-facing deployment expecting real traffic, consider adding a CAPTCHA (e.g.
Cloudflare Turnstile) in front of `/api/venues/submit` as well.

## Project layout

```
app/
  page.jsx                    # search UI (filters, chips, age gate, results grid)
  submit/page.jsx             # public "add a venue" form
  admin/page.jsx              # password-protected moderation queue
  layout.jsx                  # root layout + metadata
  globals.css                 # dark nightlife theme
  api/search/route.js         # search endpoint: live Places + demo + community, merged
  api/venues/submit/route.js  # public venue submission endpoint (rate-limited)
  api/venues/pending/route.js # admin: list pending submissions
  api/venues/[id]/route.js    # admin: approve/reject a submission
  api/admin/login/route.js    # admin session login/logout
components/
  VenueCard.jsx        # venue card with on-demand map embed + social links
  AgeGate.jsx          # 18+ confirmation modal
lib/
  search.js            # filtering/sorting + Places API (New) client + community merge
  store.js             # persistent (Upstash Redis) or in-memory submission storage
  adminAuth.js          # signed admin session cookie (no extra auth dependency)
  categories.js        # venue taxonomy (adult categories flagged)
  countries.js         # AUTO-GENERATED full ISO country list
  sampleVenues.js      # demo dataset (fictional venues, real city coordinates)
  links.js             # Google Maps + social/search-engine link builders
scripts/
  generate-countries.mjs  # regenerates lib/countries.js (npm run generate:countries)
```

## Deploying

Standard Next.js app — deploys as-is to Vercel, Netlify, or any Node host
(`npm run build && npm start`). Set `GOOGLE_PLACES_API_KEY`, `ADMIN_PASSWORD`, and
(recommended) `KV_REST_API_URL` / `KV_REST_API_TOKEN` in the host's environment
variables.

## Legal notes

- The demo dataset is fictional and for illustration only.
- Adult-venue listings are informational; verify local laws and licensing.
- Google Maps/Places usage is subject to Google's terms of service.
- You are responsible for moderating community submissions before approving them.
