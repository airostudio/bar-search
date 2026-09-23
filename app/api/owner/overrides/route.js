import { NextResponse } from "next/server";
import { ownerFromRequest } from "../../../../lib/ownerAuth";
import { getOverride, isVenueApprovedForOwner, upsertOverride } from "../../../../lib/ownerStore";
import { withErrorHandling } from "../../../../lib/apiError";

export const dynamic = "force-dynamic";

const MAX_LEN = { description: 400, phone: 40, website: 200, hoursText: 200 };

export const GET = withErrorHandling(async (request) => {
  const owner = ownerFromRequest(request);
  if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const venueId = request.nextUrl.searchParams.get("venueId");
  if (!venueId) return NextResponse.json({ error: "venueId is required." }, { status: 400 });

  const approved = await isVenueApprovedForOwner(venueId, owner.id);
  if (!approved) return NextResponse.json({ error: "You don't have an approved claim on this venue." }, { status: 403 });

  const override = await getOverride(venueId);
  return NextResponse.json({ override });
});

export const PUT = withErrorHandling(async (request) => {
  const owner = ownerFromRequest(request);
  if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { venueId, description, phone, website, hoursText } = await request.json().catch(() => ({}));
  if (!venueId) return NextResponse.json({ error: "venueId is required." }, { status: 400 });
  for (const [field, value] of Object.entries({ description, phone, website, hoursText })) {
    if (value && String(value).length > MAX_LEN[field]) {
      return NextResponse.json({ error: `${field} is too long.` }, { status: 400 });
    }
  }

  const approved = await isVenueApprovedForOwner(venueId, owner.id);
  if (!approved) return NextResponse.json({ error: "You don't have an approved claim on this venue." }, { status: 403 });

  await upsertOverride({ venueId, ownerId: owner.id, description, phone, website, hoursText });
  return NextResponse.json({ ok: true });
});
