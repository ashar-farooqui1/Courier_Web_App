import { NextResponse } from "next/server";
import { createReturnDocument } from "@/lib/api/order";
import { ApiError } from "@/lib/api/http";
import type { CreateReturnDocumentPayload } from "@/lib/types/order";

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

/** Proxies POST /api/Order/CreateReturnDocument */
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

  const riderId = Number(body.riderId);
  const adminId = Number(body.adminId);
  const warehouseId = Number(body.warehouseId);
  const returnDocumentDate = String(body.returnDocumentDate ?? "").trim();

  if (!Number.isInteger(riderId) || riderId < 1) {
    return NextResponse.json({ message: "Please select a rider" }, { status: 400 });
  }

  if (!returnDocumentDate) {
    return NextResponse.json({ message: "Return document date is required" }, { status: 400 });
  }

  const payload: CreateReturnDocumentPayload = {
    awbNo,
    riderId,
    adminId: Number.isFinite(adminId) ? adminId : 0,
    warehouseId: Number.isFinite(warehouseId) ? warehouseId : 0,
    returnDocumentDate,
  };

  try {
    const { message, data } = await createReturnDocument(payload, token);
    return NextResponse.json({ success: true, message, data });
  } catch (error) {
    if (error instanceof ApiError) {
      const details = error.body as { message?: string } | undefined;
      return NextResponse.json(
        { message: details?.message ?? error.message, details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : "Failed to create return document";
    return NextResponse.json({ message }, { status: 500 });
  }
}
