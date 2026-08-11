import { NextResponse } from "next/server";
import { updateReturnDocumentStatus } from "@/lib/api/order";
import { ApiError } from "@/lib/api/http";
import type { UpdateReturnDocumentStatusPayload } from "@/lib/types/return-document";

function getBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}

/** Proxies POST /api/Order/UpdateReturnDocumentStatus */
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

  const returnDocumentId = Number(body.returnDocumentId);
  const status = String(body.status ?? "").trim();

  if (!Number.isInteger(returnDocumentId) || returnDocumentId < 1) {
    return NextResponse.json({ message: "Invalid return document ID" }, { status: 400 });
  }

  if (!status) {
    return NextResponse.json({ message: "Status is required" }, { status: 400 });
  }

  const payload: UpdateReturnDocumentStatusPayload = { returnDocumentId, status };

  try {
    const message = await updateReturnDocumentStatus(payload, token);
    return NextResponse.json({ success: true, message });
  } catch (error) {
    if (error instanceof ApiError) {
      const details = error.body as { message?: string } | undefined;
      return NextResponse.json(
        { message: details?.message ?? error.message, details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : "Failed to update return document status";
    return NextResponse.json({ message }, { status: 500 });
  }
}
