"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthSession } from "@/hooks/useAuthRole";
import { buildAppAuthHeaders } from "@/lib/api/app-request-context";
import type { ClientOrder } from "@/lib/types/order";

interface UseOrderPickerOptions {
  isActive: boolean;
  clientId: number;
  excludeOrderIds?: Set<number>;
}

/** Shared order-search/select logic behind "Create Loadsheet" and "Add Orders to Loadsheet". */
export function useOrderPicker({ isActive, clientId, excludeOrderIds }: UseOrderPickerOptions) {
  const { token, role, user } = useAuthSession();
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(() => new Set());
  const [search, setSearch] = useState("");
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) return;
    setSelectedOrderIds(new Set());
    setSearch("");
    setScanMessage(null);
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !clientId) {
      setOrders([]);
      return;
    }

    let cancelled = false;
    setLoadingOrders(true);
    setOrdersError(null);

    fetch(`/api/loadsheets/available-orders?clientId=${clientId}`, {
      headers: buildAppAuthHeaders(token, role, user?.userId ?? 0),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          const message = payload && !Array.isArray(payload) ? payload.message : undefined;
          throw new Error(message ?? `Failed to load orders (${response.status})`);
        }
        return Array.isArray(payload) ? (payload as ClientOrder[]) : [];
      })
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setOrders([]);
          setOrdersError(err instanceof Error ? err.message : "Failed to load orders");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingOrders(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isActive, clientId, token, role, user?.userId]);

  const bookedOrders = useMemo(
    () =>
      orders.filter(
        (order) => !excludeOrderIds?.has(order.orderId) && order.status?.toLowerCase() === "booked"
      ),
    [orders, excludeOrderIds]
  );

  const parseAwbTokens = (raw: string): string[] =>
    raw
      .split(/[\s,]+/)
      .map((token) => token.trim().toLowerCase())
      .filter(Boolean);

  // Scanners fire multiple space/comma-separated codes in quick succession, so treat 2+
  // digit-bearing tokens (e.g. "KHI000051 KTA000001") as AWBs rather than one free-text phrase.
  const selectableOrders = useMemo(() => {
    const tokens = parseAwbTokens(search);
    if (tokens.length === 0) return bookedOrders;

    if (tokens.length > 1 && tokens.every((token) => /\d/.test(token))) {
      return bookedOrders.filter((order) => {
        const awb = order.awbNo?.trim().toLowerCase() ?? "";
        return awb && tokens.some((token) => awb.includes(token));
      });
    }

    const needle = search.trim().toLowerCase();
    return bookedOrders.filter(
      (order) =>
        order.awbNo?.toLowerCase().includes(needle) ||
        order.customerName?.toLowerCase().includes(needle) ||
        order.destinationCity?.toLowerCase().includes(needle)
    );
  }, [bookedOrders, search]);

  const handleScanSearch = () => {
    const tokens = parseAwbTokens(search);
    if (tokens.length === 0) return;

    const matched = bookedOrders.filter((order) => tokens.includes(order.awbNo?.trim().toLowerCase() ?? ""));
    const matchedAwbs = new Set(matched.map((order) => order.awbNo?.trim().toLowerCase()));
    const notFound = tokens.filter((token) => !matchedAwbs.has(token));

    if (matched.length > 0) {
      setSelectedOrderIds((prev) => {
        const next = new Set(prev);
        matched.forEach((order) => next.add(order.orderId));
        return next;
      });
    }

    setScanMessage(
      notFound.length > 0
        ? `Added ${matched.length} order(s). Not found: ${notFound.join(", ")}`
        : `Added ${matched.length} order(s).`
    );
    setSearch("");
  };

  const toggleOrder = (orderId: number) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const allSelected = selectableOrders.length > 0 && selectableOrders.every((o) => selectedOrderIds.has(o.orderId));

  const toggleAll = () => {
    setSelectedOrderIds((prev) => {
      if (allSelected) return new Set();
      const next = new Set(prev);
      selectableOrders.forEach((o) => next.add(o.orderId));
      return next;
    });
  };

  return {
    loadingOrders,
    ordersError,
    selectedOrderIds,
    setSelectedOrderIds,
    search,
    setSearch,
    scanMessage,
    setScanMessage,
    selectableOrders,
    handleScanSearch,
    toggleOrder,
    allSelected,
    toggleAll,
  };
}
