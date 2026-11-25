import { NextResponse } from "next/server";
import { revokeShopifyConnection } from "@/lib/api/shopify-integration";
import { errorResponse, getBearerToken } from "@/app/api/shopify-integration/shared";

type RouteContext = { params: Promise<{ connectionId: string }> };

/** Proxies POST /api/ShopifyIntegration/Connections/{id}/Revoke */
export async function POST(request: Request, context: RouteContext) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  const { connectionId } = await context.params;
  const id = Number(connectionId);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ message: "Invalid connection ID" }, { status: 400 });
  }

  try {
    const message = await revokeShopifyConnection(token, id);
    return NextResponse.json({ success: true, message });
  } catch (error) {
    return errorResponse(error, "Failed to revoke connection");
  }
}
