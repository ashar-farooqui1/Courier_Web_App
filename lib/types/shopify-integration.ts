export type ShopifyConnectionStatus = "pending" | "connected" | "disconnected" | "revoked";

export interface ShopifyConnection {
  shopifyConnectionId: number;
  keyPrefix: string;
  shopDomain: string | null;
  status: ShopifyConnectionStatus | string;
  createdAt: string;
  connectedAt: string | null;
  lastUsedAt: string | null;
}

export interface ShopifyConnectionKeyCreated {
  shopifyConnectionId: number;
  /** Returned only once by the backend. */
  connectionKey: string;
}
