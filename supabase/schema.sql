-- BarAtlas community venue submissions.
-- Run this once in the Supabase SQL Editor for a new project
-- (Project -> SQL Editor -> New query -> paste -> Run).

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
-- bypasses RLS by design — never expose that key to the browser.
alter table public.venues enable row level security;
