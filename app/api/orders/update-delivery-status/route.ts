import { NextResponse } from "next/server";
import { updateOrderDeliveryStatus } from "@/lib/api/order";
import { ApiError } from "@/lib/api/http";
import type { UpdateOrderDeliveryStatusPayload } from "@/lib/types/debriefing";

function getBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}

/** Proxies POST /api/Order/UpdateOrderDeliveryStatus */
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

  const deliverySheetId = Number(body.deliverySheetId);
  const awbNo = String(body.awbNo ?? "").trim();
  const status = String(body.status ?? "").trim();
  const reason = String(body.reason ?? "");

  if (!Number.isInteger(deliverySheetId) || deliverySheetId < 1) {
    return NextResponse.json({ message: "Invalid delivery sheet ID" }, { status: 400 });
  }

  if (!awbNo) {
    return NextResponse.json({ message: "AWB is required" }, { status: 400 });
  }

  if (!status) {
    return NextResponse.json({ message: "Status is required" }, { status: 400 });
  }

  const payload: UpdateOrderDeliveryStatusPayload = { deliverySheetId, awbNo, status, reason };

  try {
    const message = await updateOrderDeliveryStatus(payload, token);
    return NextResponse.json({ success: true, message });
  } catch (error) {
    if (error instanceof ApiError) {
      const details = error.body as { message?: string } | undefined;
      return NextResponse.json(
        { message: details?.message ?? error.message, details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : "Failed to update order delivery status";
    return NextResponse.json({ message }, { status: 500 });
  }
}
