import { NextResponse } from "next/server";
import { removeOrderFromDeliverySheet } from "@/lib/api/order";
import { ApiError } from "@/lib/api/http";
import type { RemoveOrderFromDeliverySheetPayload } from "@/lib/types/order";

function getBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}

/** Proxies POST /api/Order/RemoveOrderFromDeliverySheet */
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

  const awbNo = String(body.awbNo ?? "").trim();
  const deliverySheetId = Number(body.deliverySheetId);

  if (!awbNo) {
    return NextResponse.json({ message: "AWB is required" }, { status: 400 });
  }

  if (!Number.isInteger(deliverySheetId) || deliverySheetId < 1) {
    return NextResponse.json({ message: "Invalid delivery sheet ID" }, { status: 400 });
  }

  const payload: RemoveOrderFromDeliverySheetPayload = { awbNo, deliverySheetId };

  try {
    const message = await removeOrderFromDeliverySheet(payload, token);
    return NextResponse.json({ success: true, message });
  } catch (error) {
    if (error instanceof ApiError) {
      const details = error.body as { message?: string } | undefined;
      return NextResponse.json(
        { message: details?.message ?? error.message, details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : "Failed to remove order from delivery sheet";
    return NextResponse.json({ message }, { status: 500 });
  }
}
