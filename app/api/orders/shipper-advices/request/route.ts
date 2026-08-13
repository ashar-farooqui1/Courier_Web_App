import { NextResponse } from "next/server";
import { submitShipperAdviceRequest } from "@/lib/api/order";
import { ApiError } from "@/lib/api/http";
import { parseApiErrorMessage } from "@/lib/api/errors";
import { readAppRequestContext, resolveWriteClientId } from "@/lib/api/app-request-context";

function getBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}

/** Proxies POST /api/Order/SubmitShipperAdviceRequest */
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

  const requestedStatus = typeof body.requestedStatus === "string" ? body.requestedStatus.trim() : "";
  if (!requestedStatus) {
    return NextResponse.json({ message: "Requested status is required" }, { status: 400 });
  }

  const remarks = typeof body.remarks === "string" ? body.remarks.trim() : "";
  if (!remarks) {
    return NextResponse.json({ message: "Remarks are required" }, { status: 400 });
  }

  const requestedClientId = Number(body.clientId);

  const ctx = readAppRequestContext(request);
  const scoped = resolveWriteClientId(ctx, requestedClientId);

  if (scoped.error) {
    return NextResponse.json({ message: scoped.error }, { status: scoped.status ?? 403 });
  }

  try {
    const message = await submitShipperAdviceRequest(
      { shipperAdviceId, clientId: scoped.clientId, requestedStatus, remarks },
      token
    );
    return NextResponse.json({ success: true, message });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: parseApiErrorMessage(error.body, error.message), details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : "Failed to submit shipper advice request";
    return NextResponse.json({ message }, { status: 500 });
  }
}
