"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileStack, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DialogError, DialogLoading } from "@/components/ui/AppDialog";
import { useAuthSession } from "@/hooks/useAuthRole";
import { buildAppAuthHeaders } from "@/lib/api/app-request-context";
import { useOrderPicker } from "@/components/loadsheets/useOrderPicker";

interface CreateLoadsheetViewProps {
  clientId: number;
  clientLabel?: string;
  backHref: string;
}

export default function CreateLoadsheetView({ clientId, clientLabel, backHref }: CreateLoadsheetViewProps) {
  const router = useRouter();
  const { token, role, user } = useAuthSession();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    loadingOrders,
    ordersError,
    selectedOrderIds,
    search,
    setSearch,
    scanMessage,
    setScanMessage,
    selectableOrders,
    handleScanSearch,
    toggleOrder,
    allSelected,
    toggleAll,
  } = useOrderPicker({ isActive: true, clientId });

  const handleSubmit = async () => {
    if (selectedOrderIds.size === 0) {
      setSubmitError("Select at least one order");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/loadsheets", {
        method: "POST",
        headers: {
          ...buildAppAuthHeaders(token, role, user?.userId ?? 0),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderIds: Array.from(selectedOrderIds) }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message ?? "Failed to create loadsheet");
      }
      router.push(backHref);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 uppercase hover:text-primary"
      >
        <ArrowLeft size={14} />
        Back to Loadsheets
      </Link>

      <div className="flex items-center gap-2">
        <FileStack className="text-primary" size={22} />
        <div>
          <h1 className="text-lg font-bold text-slate-800">Create Loadsheet</h1>
          {clientLabel && <p className="text-xs font-medium text-slate-500">{clientLabel}</p>}
        </div>
      </div>

      {submitError && <DialogError message={submitError} />}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setScanMessage(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleScanSearch();
                }
              }}
              placeholder="Scan or search AWB, customer, destination…"
              className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded text-sm text-black"
            />
          </div>
          {scanMessage && (
            <p
              className={cn(
                "mt-1.5 text-[11px] font-semibold",
                scanMessage.includes("Not found") ? "text-amber-600" : "text-emerald-600"
              )}
            >
              {scanMessage}
            </p>
          )}
        </div>

        <div className="p-4">
          {loadingOrders ? (
            <DialogLoading message="Loading orders…" />
          ) : ordersError ? (
            <p className="text-sm text-red-600 text-center py-8">{ordersError}</p>
          ) : selectableOrders.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              {search.trim() ? "No orders match your search." : "No booked orders available."}
            </p>
          ) : (
            <div className="border border-slate-100 rounded-lg overflow-hidden max-h-[32rem] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="w-10 px-3 py-2">
                      <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                    </th>
                    <th className="text-left px-3 py-2 text-[11px] font-bold text-slate-500 uppercase">AWB</th>
                    <th className="text-left px-3 py-2 text-[11px] font-bold text-slate-500 uppercase">Customer</th>
                    <th className="text-left px-3 py-2 text-[11px] font-bold text-slate-500 uppercase">Destination</th>
                    <th className="text-left px-3 py-2 text-[11px] font-bold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectableOrders.map((order) => (
                    <tr key={order.orderId} className="border-t border-slate-50 hover:bg-slate-50/50">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.has(order.orderId)}
                          onChange={() => toggleOrder(order.orderId)}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => toggleOrder(order.orderId)}
                          className="font-medium text-primary hover:underline"
                        >
                          {order.awbNo || "—"}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-slate-600">{order.customerName || "—"}</td>
                      <td className="px-3 py-2 text-slate-600">{order.destinationCity || "—"}</td>
                      <td className="px-3 py-2 text-slate-600">{order.status || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">{selectedOrderIds.size} order(s) selected</p>
        <div className="flex gap-3">
          <Button variant="outline" size="md" onClick={() => router.push(backHref)} disabled={submitting}>
            Cancel
          </Button>
          <Button size="md" onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting ? "Creating…" : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}
