import { NextResponse } from "next/server";
import { reweightArrival } from "@/lib/api/order";
import { ApiError } from "@/lib/api/http";
import type { ReweightArrivalPayload } from "@/lib/types/order";

function getBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}

function readAwbNumbers(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => String(entry).trim())
    .filter((entry) => entry.length > 0);
}

/** Proxies POST /api/Order/ReweightArrival */
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

  const awbNo = readAwbNumbers(body.awbNo);

  if (awbNo.length === 0) {
    return NextResponse.json({ message: "Please provide at least one AWB" }, { status: 400 });
  }

  const warehouseId = Number(body.warehouseId);
  const pickupRiderId = Number(body.pickupRiderId);
  const weight = Number(body.weight);

  const payload: ReweightArrivalPayload = {
    warehouseId: Number.isFinite(warehouseId) ? warehouseId : 0,
    pickupRiderId: Number.isFinite(pickupRiderId) ? pickupRiderId : 0,
    weight: Number.isFinite(weight) ? weight : 0,
    awbNo,
  };

  try {
    const { message, result } = await reweightArrival(payload, token);
    return NextResponse.json({ success: true, message, data: result });
  } catch (error) {
    if (error instanceof ApiError) {
      const details = error.body as { message?: string } | undefined;
      return NextResponse.json(
        { message: details?.message ?? error.message, details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : "Failed to reweight arrival";
    return NextResponse.json({ message }, { status: 500 });
  }
}
