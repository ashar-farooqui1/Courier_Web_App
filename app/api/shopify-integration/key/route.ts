import { NextResponse } from "next/server";
import { createShopifyConnectionKey } from "@/lib/api/shopify-integration";
import { errorResponse, getBearerToken } from "@/app/api/shopify-integration/shared";

/** Proxies POST /api/ShopifyIntegration/ConnectionKey — the key is returned only once. */
export async function POST(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  try {
    const result = await createShopifyConnectionKey(token);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error, "Failed to create connection key");
  }
}
