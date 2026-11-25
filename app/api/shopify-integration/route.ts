import { NextResponse } from "next/server";
import { getShopifyConnections } from "@/lib/api/shopify-integration";
import { errorResponse, getBearerToken } from "@/app/api/shopify-integration/shared";

/** Proxies GET /api/ShopifyIntegration/Connections */
export async function GET(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  try {
    return NextResponse.json(await getShopifyConnections(token));
  } catch (error) {
    return errorResponse(error, "Failed to load Shopify connections");
  }
}
