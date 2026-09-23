import { NextResponse } from "next/server";
import { ownerFromRequest } from "../../../../lib/ownerAuth";
import { createClaim, isOwnerStoreConfigured, listClaimsForOwner } from "../../../../lib/ownerStore";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const owner = ownerFromRequest(request);
  if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const claims = await listClaimsForOwner(owner.id);
  return NextResponse.json({ claims });
}

export async function POST(request) {
  const owner = ownerFromRequest(request);
  if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isOwnerStoreConfigured()) {
    return NextResponse.json({ error: "Bar owner accounts aren't configured on this deployment yet." }, { status: 503 });
  }

  const { venueId, venueName, venueCity, venueCountryCode } = await request.json().catch(() => ({}));
  if (!venueId || !venueName) {
    return NextResponse.json({ error: "venueId and venueName are required." }, { status: 400 });
  }

  await createClaim({ venueId: String(venueId), venueName: String(venueName), venueCity, venueCountryCode, ownerId: owner.id });
  return NextResponse.json({ ok: true });
}
