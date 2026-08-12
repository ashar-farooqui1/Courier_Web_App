import { NextResponse } from "next/server";
import { approveShipperAdvice } from "@/lib/api/order";
import { ApiError } from "@/lib/api/http";
import { parseApiErrorMessage } from "@/lib/api/errors";
import { readAppRequestContext } from "@/lib/api/app-request-context";
import { isAdminRole } from "@/lib/auth/role";

function getBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}

/** Proxies POST /api/Order/ApproveShipperAdvice */
export async function POST(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const shipperAdviceId = Number(body.shipperAdviceId);
  if (!Number.isInteger(shipperAdviceId) || shipperAdviceId < 1) {
    return NextResponse.json({ message: "Invalid shipper advice ID" }, { status: 400 });
  }

  const ctx = readAppRequestContext(request);
  const adminId = isAdminRole(ctx.role) ? ctx.userId : 0;

  try {
    const message = await approveShipperAdvice({ shipperAdviceId, adminId }, token);
    return NextResponse.json({ success: true, message });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: parseApiErrorMessage(error.body, error.message), details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : "Failed to approve shipper advice";
    return NextResponse.json({ message }, { status: 500 });
  }
}
