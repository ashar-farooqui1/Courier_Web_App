"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthRole";
import { buildAppAuthHeaders } from "@/lib/api/app-request-context";
import { parseApiErrorMessage } from "@/lib/api/errors";
import { unwrapOrdersList } from "@/lib/api/order";
import { applyMnpTrackingStatus, buildMnpStatusMap, isMnpOrder } from "@/lib/orders/mnp-status";
import ShipmentFinancialSummary from "@/components/dashboard/ShipmentFinancialSummary";
import DashboardHeroBanner from "@/components/dashboard/DashboardHeroBanner";
import type { OrderStatusApiValue } from "@/lib/orders/order-status-options";
import type { ClientOrder } from "@/lib/types/order";
import type { MnpTrackingDetail } from "@/lib/types/mnp";

export default function ClientDashboardView() {
  const { token, clientId, role, ready, username } = useAuthSession();
  const router = useRouter();

  const handleFilterClick = useCallback(
    (statuses: OrderStatusApiValue[]) => {
      router.push(statuses.length > 0 ? `/orders/details?status=${statuses.join(",")}` : "/orders/details");
    },
    [router]
  );

  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!ready) return;

    if (!token || !Number.isInteger(clientId) || clientId < 1) {
      setOrders([]);
      setOrdersError("Client session not found. Please log in again.");
      return;
    }

    setOrdersError(null);

    try {
      const response = await fetch(`/api/orders?clientId=${clientId}`, {
        headers: buildAppAuthHeaders(token, role, clientId),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseApiErrorMessage(payload, `Failed to load orders (${response.status})`));
      }

      const fetchedOrders = unwrapOrdersList(payload);

      if (!fetchedOrders.some(isMnpOrder)) {
        setOrders(fetchedOrders);
      } else {
        try {
          const mnpResponse = await fetch(`/api/orders/mnp-tracking?clientId=${clientId}`, {
            headers: buildAppAuthHeaders(token, role, clientId),
          });
          const mnpPayload = (await mnpResponse.json().catch(() => null)) as {
            tracking_Details?: MnpTrackingDetail[];
          } | null;
          const statusMap = mnpResponse.ok
            ? buildMnpStatusMap(mnpPayload?.tracking_Details ?? [])
            : new Map<string, string>();
          setOrders(applyMnpTrackingStatus(fetchedOrders, statusMap));
        } catch {
          setOrders(fetchedOrders);
        }
      }
    } catch (err) {
      setOrders([]);
      setOrdersError(err instanceof Error ? err.message : "Failed to load orders");
    }
  }, [clientId, ready, role, token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardHeroBanner greetingName={username} totalOrders={orders.length} />

      {ordersError && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium">
          <span>{ordersError}</span>
          <button
            type="button"
            onClick={loadOrders}
            className="shrink-0 h-8 px-4 bg-red-600 text-white text-[10px] font-bold rounded uppercase hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <ShipmentFinancialSummary orders={orders} onFilterClick={handleFilterClick} />
    </div>
  );
}
