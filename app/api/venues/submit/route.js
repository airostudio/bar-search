import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { store } from "../../../../lib/store";
import { CATEGORY_BY_ID } from "../../../../lib/categories";
import { COUNTRY_NAME } from "../../../../lib/countries";

const MAX_LEN = { name: 120, city: 80, address: 200, description: 400 };

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const ok = await store.rateLimitOk(ip);
  if (!ok) {
    return NextResponse.json({ error: "Too many submissions from this address. Try again later." }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: real users never see or fill this field; bots usually fill everything.
  if (body.website_url) {
    return NextResponse.json({ ok: true, id: null });
  }

  const name = String(body.name || "").trim();
  const category = String(body.category || "").trim();
  const countryCode = String(body.countryCode || "").trim().toUpperCase();
  const city = String(body.city || "").trim();
  const address = String(body.address || "").trim();
  const description = String(body.description || "").trim();
  const lat = body.lat !== undefined && body.lat !== null && body.lat !== "" ? Number(body.lat) : null;
  const lng = body.lng !== undefined && body.lng !== null && body.lng !== "" ? Number(body.lng) : null;

  if (!name || name.length > MAX_LEN.name) {
    return NextResponse.json({ error: "Venue name is required (max 120 characters)." }, { status: 400 });
  }
  if (!CATEGORY_BY_ID[category]) {
    return NextResponse.json({ error: "Unknown category." }, { status: 400 });
  }
  if (!COUNTRY_NAME[countryCode]) {
    return NextResponse.json({ error: "Unknown country." }, { status: 400 });
  }
  if (!city || city.length > MAX_LEN.city) {
    return NextResponse.json({ error: "City is required (max 80 characters)." }, { status: 400 });
  }
  if (address.length > MAX_LEN.address || description.length > MAX_LEN.description) {
    return NextResponse.json({ error: "One or more fields exceed the maximum length." }, { status: 400 });
  }
  if (lat !== null && (Number.isNaN(lat) || lat < -90 || lat > 90)) {
    return NextResponse.json({ error: "Latitude must be between -90 and 90." }, { status: 400 });
  }
  if (lng !== null && (Number.isNaN(lng) || lng < -180 || lng > 180)) {
    return NextResponse.json({ error: "Longitude must be between -180 and 180." }, { status: 400 });
  }

  const venue = {
    id: crypto.randomUUID(),
    name,
    category,
    countryCode,
    city,
    address: address || undefined,
    description: description || undefined,
    lat,
    lng,
    submittedAt: Date.now(),
    source: "community",
  };

  await store.submit(venue);
  return NextResponse.json({ ok: true, id: venue.id });
}
