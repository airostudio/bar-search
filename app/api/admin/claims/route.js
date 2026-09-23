import { NextResponse } from "next/server";
import { isAdminRequest } from "../../../../lib/adminAuth";
import { listPendingClaims } from "../../../../lib/ownerStore";
import { withErrorHandling } from "../../../../lib/apiError";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (request) => {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const claims = await listPendingClaims();
  return NextResponse.json({ claims });
});
