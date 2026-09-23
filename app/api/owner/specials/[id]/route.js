import { NextResponse } from "next/server";
import { ownerFromRequest } from "../../../../../lib/ownerAuth";
import { deleteSpecial } from "../../../../../lib/ownerStore";

export async function DELETE(request, { params }) {
  const owner = ownerFromRequest(request);
  if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Scoped to owner_id in the query itself, so an owner can only delete their own specials.
  await deleteSpecial(params.id, owner.id);
  return NextResponse.json({ ok: true });
}
