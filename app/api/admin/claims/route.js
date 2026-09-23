import { NextResponse } from "next/server";
import { isAdminRequest } from "../../../../lib/adminAuth";
import { listPendingClaims } from "../../../../lib/ownerStore";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const claims = await listPendingClaims();
  return NextResponse.json({ claims });
}
