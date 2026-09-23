import { NextResponse } from "next/server";
import { ownerFromRequest } from "../../../../lib/ownerAuth";
import { withErrorHandling } from "../../../../lib/apiError";

export const GET = withErrorHandling(async (request) => {
  const owner = ownerFromRequest(request);
  if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ email: owner.email });
});
