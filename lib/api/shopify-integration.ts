import { API_ROUTES } from "@/lib/api/config";
import { apiGet, apiPostJson } from "@/lib/api/http";
import type {
  ShopifyConnection,
  ShopifyConnectionKeyCreated,
} from "@/lib/types/shopify-integration";

interface BackendResult<T> {
  success?: boolean;
  message?: string | null;
  data?: T;
}

function auth(token: string): RequestInit {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export async function getShopifyConnections(token: string): Promise<ShopifyConnection[]> {
  const res = await apiGet<BackendResult<ShopifyConnection[]>>(
    API_ROUTES.shopifyConnections,
    auth(token)
  );
  return Array.isArray(res.data) ? res.data : [];
}

export async function createShopifyConnectionKey(
  token: string
): Promise<{ data: ShopifyConnectionKeyCreated; message: string }> {
  const res = await apiPostJson<BackendResult<ShopifyConnectionKeyCreated>>(
    API_ROUTES.shopifyConnectionKey,
    {},
    auth(token)
  );
  if (!res.data?.connectionKey) {
    throw new Error(res.message || "Backend did not return a connection key.");
  }
  return { data: res.data, message: res.message ?? "Connection key created." };
}

export async function revokeShopifyConnection(
  token: string,
  shopifyConnectionId: number
): Promise<string> {
  const res = await apiPostJson<BackendResult<boolean>>(
    API_ROUTES.shopifyRevokeConnection(shopifyConnectionId),
    {},
    auth(token)
  );
  return res.message ?? "Connection revoked.";
}
