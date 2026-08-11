import { NextResponse } from "next/server";
import { generateReturnDocumentById } from "@/lib/api/order";
import { ApiError } from "@/lib/api/http";

function getBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}

/** Proxies GET /api/Order/GenerateReturnDocumentById?returnDocumentId= */
export async function GET(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const returnDocumentId = Number(searchParams.get("returnDocumentId"));

  if (!Number.isInteger(returnDocumentId) || returnDocumentId < 1) {
    return NextResponse.json({ message: "Invalid return document id" }, { status: 400 });
  }

  try {
    const { blob, filename } = await generateReturnDocumentById(returnDocumentId, token);
    const buffer = await blob.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": blob.type || "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      const details = error.body as { message?: string } | undefined;
      return NextResponse.json(
        { message: details?.message ?? error.message, details: error.body },
        { status: error.status }
      );
    }

    const message = error instanceof Error ? error.message : "Failed to generate return document";
    return NextResponse.json({ message }, { status: 500 });
  }
}
