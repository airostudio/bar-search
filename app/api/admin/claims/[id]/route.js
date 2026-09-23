import { NextResponse } from "next/server";
import { isAdminRequest } from "../../../../../lib/adminAuth";
import { setClaimStatus } from "../../../../../lib/ownerStore";
import { withErrorHandling } from "../../../../../lib/apiError";

export const PATCH = withErrorHandling(async (request, { params }) => {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { action } = await request.json().catch(() => ({}));
  const { id } = params;

  if (action === "approve") {
    const ok = await setClaimStatus(id, "approved");
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (action === "reject") {
    await setClaimStatus(id, "rejected");
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
});
