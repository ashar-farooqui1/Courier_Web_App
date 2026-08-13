"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Calendar } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthRole";
import { buildAppAuthHeaders } from "@/lib/api/app-request-context";
import { parseApiErrorMessage } from "@/lib/api/errors";
import { unwrapOrdersList } from "@/lib/api/order";
import type { OrderStatusApiValue } from "@/lib/orders/order-status-options";
import type { ClientOrder } from "@/lib/types/order";
import ShipmentFinancialSummary from "@/components/dashboard/ShipmentFinancialSummary";
import DashboardHeroBanner from "@/components/dashboard/DashboardHeroBanner";

const FilterField = ({
  label,
  placeholder,
  type = "text",
  value = "",
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
}) => (
  <div className="flex-1 min-w-[200px] space-y-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="w-full h-10 px-4 bg-white border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300"
      />
      {type === "date" && (
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
      )}
    </div>
  </div>
);

const SelectField = ({ label, placeholder }: { label: string; placeholder: string }) => (
  <div className="flex-1 min-w-[200px] space-y-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <select className="w-full h-10 px-4 bg-white border border-slate-200 rounded-md text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all">
        <option value="">{placeholder}</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
    </div>
  </div>
);

export default function AdminDashboardView() {
  const { token, role, user, username, ready } = useAuthSession();
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
    if (!ready || !token) return;

    setOrdersError(null);

    try {
      const response = await fetch("/api/orders", {
        headers: buildAppAuthHeaders(token, role, user?.userId ?? 0),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseApiErrorMessage(payload, `Failed to load orders (${response.status})`));
      }

      setOrders(unwrapOrdersList(payload));
    } catch (err) {
      setOrders([]);
      setOrdersError(err instanceof Error ? err.message : "Failed to load orders");
    }
  }, [ready, token, role, user]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardHeroBanner greetingName={username} totalOrders={orders.length} />

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SelectField label="Filter By" placeholder="Booking Date" />
          <FilterField label="From" placeholder="" type="date" value="2026-04-01" />
          <FilterField label="To" placeholder="" type="date" value="2026-04-29" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FilterField label="Client" placeholder="Select Client" />
          <FilterField label="Origin" placeholder="Origin" />
          <FilterField label="Destination" placeholder="Destination" />
        </div>
      </div>

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
