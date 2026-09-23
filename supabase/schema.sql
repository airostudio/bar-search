-- Findah.bar data — venue submissions, bar-owner claims, specials, and
-- owner-corrected info. Run this once in the Supabase SQL Editor for a new
-- project (Project -> SQL Editor -> New query -> paste -> Run). Safe to
-- re-run: every statement is idempotent.
--
-- Bar-owner accounts use Supabase Auth (auth.users) directly — created via
-- the Admin API server-side (see lib/supabaseClient.js), so no separate
-- profiles table or email-confirmation flow is needed for this app.

create table if not exists public.venues (
  id uuid primary key,
  name text not null,
  category text not null,
  country_code text not null,
  city text not null,
  address text,
  description text,
  lat double precision,
  lng double precision,
  status text not null default 'pending' check (status in ('pending', 'approved')),
  source text not null default 'community',
  submitted_at timestamptz not null default now()
);

create index if not exists venues_status_idx on public.venues (status);
create index if not exists venues_country_idx on public.venues (country_code);

-- Row Level Security is enabled with NO policies defined, so the table is
-- fully locked down for anonymous/public API access. The app talks to
-- Supabase using the service_role key from a server-only API route, which
-- bypasses RLS by design — never expose that key to the browser. Every
-- table below follows the same pattern, for the same reason.
alter table public.venues enable row level security;

-- A bar owner's claim on a venue. venue_id is a plain string, not a foreign
-- key, because a venue can come from the demo dataset, a live Google
-- Places result, or the venues table above — three different id spaces.
-- venue_name/city/country_code are a snapshot at claim time for display,
-- since a demo/live venue can't always be re-looked-up later.
create table if not exists public.venue_claims (
  id uuid primary key,
  venue_id text not null,
  venue_name text not null,
  venue_city text,
  venue_country_code text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
create index if not exists venue_claims_owner_idx on public.venue_claims (owner_id);
create index if not exists venue_claims_venue_idx on public.venue_claims (venue_id);
create index if not exists venue_claims_status_idx on public.venue_claims (status);
alter table public.venue_claims enable row level security;

-- Specials an owner posts for a venue they have an APPROVED claim on
-- (enforced in the app, not by RLS — see lib/ownerStore.js).
create table if not exists public.venue_specials (
  id uuid primary key,
  venue_id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  starts_at date,
  ends_at date,
  created_at timestamptz not null default now()
);
create index if not exists venue_specials_venue_idx on public.venue_specials (venue_id);
alter table public.venue_specials enable row level security;

-- Owner-corrected "other info" that overlays onto a venue's base data
-- (from the demo dataset or live Places) wherever it's set.
create table if not exists public.venue_overrides (
  venue_id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  description text,
  phone text,
  website text,
  hours_text text,
  updated_at timestamptz not null default now()
);
alter table public.venue_overrides enable row level security;
