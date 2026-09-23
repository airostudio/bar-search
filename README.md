# myvibe.bar 🌍 — Global Bar & Nightlife Search

A marketing homepage (`/`) plus a full-search website (`/search`) for bars and nightlife
venues in **every country** — pubs, cocktail bars, nightclubs, karaoke, rooftop and beach
bars, plus age-gated adult categories (gentlemen's clubs, hostess bars, host bars,
cabarets, adult lounges).

## Features

- **Full search** (`/search`) — free-text keyword, country (all 273 ISO
  countries/territories), city, multi-select categories, minimum rating, and sorting.
- **Google Maps** — every venue has an embedded map (no API key needed for the embed)
  plus an "open in Google Maps" link.
- **Live worldwide data** — set a Google Places API key and every search hits the
  Google Places API (New) for real venues in any country. Without a key the site runs
  on a bundled demo dataset (~55 venues across 40+ countries) so it's fully browsable
  out of the box.
- **"Find me a better bar"** — every venue card has a button that opens a vibe picker
  (reusing the category taxonomy), then shows other bars nearby with a Google Maps
  embed. Picking one geolocates you, shows walking directions, and offers a ride
  (Uber worldwide, plus the locally dominant app — Grab, Careem, Ola, DiDi, etc. — where
  we know it).
- **Social & search-engine lookups** — every venue card has one-click buttons that open
  live results for that venue on Instagram, Facebook, TikTok, Google, Bing, DuckDuckGo,
  and Yandex.
- **18+ age gate** — adult venue categories are hidden behind an age confirmation,
  remembered per browser.
- **Community submissions** — a public `/submit` form lets anyone propose a venue
  that's missing. Submissions queue at `/admin` (password-protected) for approval before
  they appear in search results.
- **Bar-owner accounts** — owners sign up (`/owner/signup`), claim their venue, and once
  a claim is approved at `/admin` they can post specials and correct their info
  (`/owner/dashboard`) — both show up in public search results immediately.

## Why links instead of scrapers?

Automated scraping of Instagram, Facebook, and Google Maps/Search violates each
platform's Terms of Service, is blocked technically (login walls, rate limiting, IP
bans, CAPTCHAs), and has been the subject of active legal enforcement by these
companies. It's also fragile — a scraper breaks every time the target site's markup
changes. myvibe.bar therefore uses three legitimate mechanisms instead:

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
   every restart/redeploy (fine for trying it out, not for real use).

   **Recommended: Supabase** (Postgres — a real, inspectable database):

   1. Create a free project at https://supabase.com.
   2. Open its **SQL Editor** and run the contents of `supabase/schema.sql`
      (creates the `venues` table with Row Level Security enabled and no public
      policies, so it's unreachable except via the server-side key below).
   3. Copy the **Project URL** and **`service_role`** secret key from
      Project Settings → API, and set:

      ```
      SUPABASE_URL=https://your-project.supabase.co
      SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
      ```

   The `service_role` key bypasses Row Level Security and must stay server-side —
   it's only ever read inside API route handlers (`lib/store.js`), never sent to
   the browser. Don't reuse it in any client component.

   **Alternative: Upstash Redis** (used only if the Supabase vars above aren't set):

   ```
   KV_REST_API_URL=...
   KV_REST_API_TOKEN=...
   ```

   Easiest path on Vercel: **Storage** tab → add the **Upstash for Redis** integration
   → it injects these automatically. Or create a free database directly at
   https://console.upstash.com and copy its REST URL/token.

The `/admin` page shows which storage backend is active (Supabase, Redis, or
in-memory) and a warning banner if nothing persistent is configured.

Submissions are rate-limited (5 per IP per hour) and include a honeypot field, but for
a public-facing deployment expecting real traffic, consider adding a CAPTCHA (e.g.
Cloudflare Turnstile) in front of `/api/venues/submit` as well.

## Enable bar-owner accounts

Requires Supabase (see above) plus one more variable:

```
SESSION_SECRET=<any long random string, e.g. `openssl rand -hex 32`>
```

This signs the owner's session cookie — the same approach as `ADMIN_PASSWORD`/`/admin`,
just carrying a user id instead of a yes/no flag. Without it, `/owner/signup` and
`/owner/login` return a clear "not configured" error.

Owner accounts are Supabase Auth users, created server-side through the
[Admin API](https://supabase.com/docs/reference/javascript/auth-admin-createuser) with
`email_confirm: true` — so signup logs the owner in immediately, no "check your email"
step, and no Supabase Auth settings need changing. The app never hands the browser a
Supabase access token or the anon key; every subsequent request goes through our own
API routes using the service_role key, authorized by our own session cookie.

How it fits together:

1. An owner signs up, then searches for their venue and clicks **Claim this venue**
   (`/owner/dashboard`) — this creates a `pending` row in `venue_claims`.
2. You approve or reject the claim at `/admin` (a new "Pending venue claims" section
   alongside the existing venue-submission queue).
3. Once approved, the owner can post **specials** (title, description, optional date
   range) and correct their venue's description/phone/website/hours from their
   dashboard — both are stored in `venue_specials` / `venue_overrides` and merged onto
   the venue the next time anyone searches (`/api/search`, `/api/venues/nearby`), along
   with a "✓ Verified by owner" badge.

## Project layout

```
app/
  page.jsx                       # landing page (what we offer, how it works, sponsors)
  search/page.jsx                # search UI (filters, chips, age gate, results grid)
  submit/page.jsx                # public "add a venue" form
  admin/page.jsx                 # password-protected moderation queue (venues + claims)
  owner/signup/page.jsx          # bar-owner signup
  owner/login/page.jsx           # bar-owner login
  owner/dashboard/page.jsx       # claim a venue; manage specials + info once approved
  layout.jsx                     # root layout + metadata
  globals.css                    # dark nightlife theme
  api/search/route.js            # search endpoint: live Places + demo + community, merged
  api/venues/nearby/route.js     # "find me a better bar" nearby-alternatives endpoint
  api/venues/submit/route.js     # public venue submission endpoint (rate-limited)
  api/venues/pending/route.js    # admin: list pending submissions
  api/venues/[id]/route.js       # admin: approve/reject a submission
  api/admin/login/route.js       # admin session login/logout
  api/admin/claims/route.js      # admin: list pending venue claims
  api/admin/claims/[id]/route.js # admin: approve/reject a claim
  api/owner/signup/route.js      # owner signup (Supabase Auth Admin API) + session cookie
  api/owner/login/route.js       # owner login/logout
  api/owner/me/route.js          # current owner session
  api/owner/claims/route.js      # owner: list own claims / submit a new claim
  api/owner/specials/route.js    # owner: list/add specials for an approved venue
  api/owner/specials/[id]/route.js # owner: delete a special
  api/owner/overrides/route.js   # owner: get/save "other info" for an approved venue
components/
  NavBar.jsx           # shared site nav, shows owner login state
  VenueCard.jsx        # venue card: map embed, social links, specials, claimed badge
  NearbyFinder.jsx     # "find me a better bar" vibe picker + nearby results
  GetThere.jsx         # geolocated walking directions + ride-share links
  OwnerVenuePanel.jsx  # owner dashboard: per-venue specials + info editor
  AgeGate.jsx          # 18+ confirmation modal
lib/
  search.js            # filtering/sorting + Places API (New) client + nearby search
  store.js             # community submission storage: Supabase, else Redis, else in-memory
  ownerStore.js         # venue claims / specials / overrides (Supabase only)
  ownerAuth.js          # signed owner session cookie (mirrors adminAuth.js)
  adminAuth.js          # signed admin session cookie (no extra auth dependency)
  supabaseClient.js     # shared Supabase REST (PostgREST) + Auth (GoTrue) request helpers
  rideshare.js          # country -> ride-hailing app mapping + deep-link builders
  categories.js        # venue taxonomy (adult categories flagged)
  countries.js         # AUTO-GENERATED full ISO country list
  sampleVenues.js      # demo dataset (fictional venues, real city coordinates)
  links.js             # Google Maps + social/search-engine link builders
scripts/
  generate-countries.mjs  # regenerates lib/countries.js (npm run generate:countries)
supabase/
  schema.sql           # venues / venue_claims / venue_specials / venue_overrides tables
```

## Deploying

Standard Next.js app — deploys as-is to Vercel, Netlify, or any Node host
(`npm run build && npm start`). Set `GOOGLE_PLACES_API_KEY`, `ADMIN_PASSWORD`, and
(recommended) `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SESSION_SECRET` in the
host's environment variables.

## Legal notes

- The demo dataset is fictional and for illustration only.
- Adult-venue listings are informational; verify local laws and licensing.
- Google Maps/Places usage is subject to Google's terms of service.
- You are responsible for moderating community submissions before approving them.
