import { NextResponse } from "next/server";
import { ownerFromRequest } from "../../../../lib/ownerAuth";
import { createSpecial, isVenueApprovedForOwner, listSpecialsForVenue } from "../../../../lib/ownerStore";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const owner = ownerFromRequest(request);
  if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const venueId = request.nextUrl.searchParams.get("venueId");
  if (!venueId) return NextResponse.json({ error: "venueId is required." }, { status: 400 });

  const approved = await isVenueApprovedForOwner(venueId, owner.id);
  if (!approved) return NextResponse.json({ error: "You don't have an approved claim on this venue." }, { status: 403 });

  const specials = await listSpecialsForVenue(venueId);
  return NextResponse.json({ specials });
}

export async function POST(request) {
  const owner = ownerFromRequest(request);
  if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { venueId, title, description, startsAt, endsAt } = await request.json().catch(() => ({}));
  if (!venueId || !title) {
    return NextResponse.json({ error: "venueId and title are required." }, { status: 400 });
  }
  if (String(title).length > 120 || (description && String(description).length > 300)) {
    return NextResponse.json({ error: "Title or description is too long." }, { status: 400 });
  }

  const approved = await isVenueApprovedForOwner(venueId, owner.id);
  if (!approved) return NextResponse.json({ error: "You don't have an approved claim on this venue." }, { status: 403 });

  await createSpecial({ venueId, ownerId: owner.id, title, description, startsAt, endsAt });
  return NextResponse.json({ ok: true });
}
