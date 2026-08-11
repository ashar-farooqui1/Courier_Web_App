"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Info, Loader2, Printer, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildAppAuthHeaders } from "@/lib/api/app-request-context";
import { parseApiErrorMessage } from "@/lib/api/errors";
import { parseContentDispositionFilename } from "@/lib/format";
import { formatAmount } from "@/components/orders/order-columns";
import type { LoginRole } from "@/lib/auth/role";
import type { DeliverySheetViewData, DeliverySheetViewOrder } from "@/lib/types/delivery-sheet";

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "closed") return "bg-emerald-50 text-emerald-700";
  if (s === "picked") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-500";
}

export interface RollcartViewProps {
  sheetId: number;
  backHref: string;
  token?: string;
  role?: LoginRole | null;
  userId?: number;
  roleId?: number;
}

export function RollcartView({ sheetId, backHref, token, role, userId, roleId }: RollcartViewProps) {
  const [data, setData] = useState<DeliverySheetViewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchKey, setSearchKey] = useState("");
  const [removingAwb, setRemovingAwb] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!sheetId) return;

    const response = await fetch(`/api/orders/delivery-sheet-view?deliverySheetId=${sheetId}`, {
      headers: buildAppAuthHeaders(token, role ?? null, userId ?? 0),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(parseApiErrorMessage(payload, `Failed to load rollcart (${response.status})`));
    }

    setData(payload as DeliverySheetViewData);
  }, [sheetId, token, role, userId]);

  useEffect(() => {
    if (!sheetId) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        await reload();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load rollcart");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [sheetId, reload]);

  const handleRemoveOrder = async (awbNo: string) => {
    if (!token) {
      setRemoveError("Authentication required. Please log in again.");
      return;
    }

    setRemoveError(null);
    setRemovingAwb(awbNo);

    try {
      const response = await fetch("/api/orders/remove-from-delivery-sheet", {
        method: "POST",
        headers: buildAppAuthHeaders(token, role ?? null, userId ?? 0, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ awbNo, deliverySheetId: sheetId }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseApiErrorMessage(payload, `Failed to remove ${awbNo} (${response.status})`));
      }

      await reload();
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : "Failed to remove order from rollcart");
    } finally {
      setRemovingAwb(null);
    }
  };

  const handlePrint = async () => {
    if (!token) {
      setPrintError("Authentication required. Please log in again.");
      return;
    }

    setPrintError(null);
    setDownloadingPdf(true);

    try {
      const response = await fetch(`/api/orders/generate-delivery-sheet-by-id?deliverySheetId=${sheetId}`, {
        headers: buildAppAuthHeaders(token, role ?? null, userId ?? 0),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(parseApiErrorMessage(payload, `Failed to generate delivery sheet (${response.status})`));
      }

      const blob = await response.blob();
      const filename = parseContentDispositionFilename(
        response.headers.get("Content-Disposition"),
        `RollCart-${sheetId}.pdf`
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setPrintError(err instanceof Error ? err.message : "Failed to generate delivery sheet");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const filteredOrders: DeliverySheetViewOrder[] = (data?.orders ?? []).filter((order) => {
    const key = searchKey.trim().toLowerCase();
    if (!key) return true;
    return (
      order.awbNo.toLowerCase().includes(key) ||
      order.clientName.toLowerCase().includes(key) ||
      order.shipment.customerName.toLowerCase().includes(key)
    );
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-10">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 uppercase hover:text-primary"
      >
        <ArrowLeft size={14} />
        Back to Rollcarts
      </Link>

      <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">RollCart View</h1>

      {loading && (
        <div className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          Loading rollcart…
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center justify-center gap-3 py-16 text-red-600">
          <AlertCircle size={18} />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      {!loading && !error && data && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest">Rollcart Details</h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                placeholder="search key"
                className="h-9 w-48 px-3 bg-white border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
              <button
                type="button"
                className="h-9 px-5 bg-primary hover:bg-primary/90 text-white text-[11px] font-bold rounded uppercase tracking-widest shadow-sm transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Sub-header info row */}
          <div className="px-6 py-4 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4 bg-slate-50/20">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-bold text-slate-600">
              <span className="text-slate-800">
                Rollcart with parts no {data.header.deliverySheetId} from {data.header.date}
              </span>
              <span>Headquarters in {data.header.warehouseName || "—"}</span>
              <span>Courier: {data.header.riderName || "—"}</span>
              <span>WareHouse: {data.header.warehouseName || "—"}</span>
              <span className={cn("inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase", statusBadgeClass(data.header.deliverySheetStatus))}>
                {data.header.deliverySheetStatus || "—"}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/orders/debriefing?deliverySheetId=${sheetId}`}
                title="Debriefing"
                className="p-2.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors flex items-center justify-center"
              >
                <Info size={14} />
              </Link>
              <button
                type="button"
                title="Print"
                onClick={handlePrint}
                disabled={downloadingPdf}
                className="p-2.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {downloadingPdf ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
              </button>
            </div>
          </div>

          {printError && (
            <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
              {printError}
            </div>
          )}

          {removeError && (
            <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
              {removeError}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30">
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap w-12">#</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">AWB / Client</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Shipment</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Signature Stamp</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-medium text-slate-600">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <p className="text-slate-300 italic text-sm font-medium">No shipments found</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.awbNo} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors align-top">
                      <td className="p-4 whitespace-nowrap">{order.serial}</td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-primary">{order.awbNo}</div>
                        <div className="text-slate-500">{order.clientName || "—"}</div>
                      </td>
                      <td className="p-4 min-w-[320px]">
                        <p>
                          {order.shipment.customerName || "—"} {order.shipment.customerPhone || ""},{" "}
                          {order.shipment.deliveryAddress || "—"}
                          {order.shipment.area ? `, ${order.shipment.area}` : ""}{" "}
                          {order.shipment.destinationCity ? order.shipment.destinationCity.toUpperCase() : ""}
                        </p>
                        <p>
                          {order.shipment.serviceName || "—"}, {order.shipment.orderDate || "—"}, Package{" "}
                          {order.shipment.chargedWeight} kg
                        </p>
                        <p className="font-bold text-slate-700">Sender: {order.shipment.sender || "—"}</p>
                        <p className="font-bold text-slate-700">Contents: {order.shipment.contents || "—"}</p>
                        <p className="font-bold text-slate-700">COD: {formatAmount(order.shipment.cod)}</p>
                      </td>
                      <td className="p-4 min-w-[160px]">
                        <p className="mb-3">I received shipment intact</p>
                        <button
                          type="button"
                          onClick={() => handleRemoveOrder(order.awbNo)}
                          disabled={removingAwb === order.awbNo}
                          className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50"
                          title="Remove from rollcart"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-50 bg-slate-50/10 flex flex-wrap gap-x-8 gap-y-1 text-[11px] font-bold text-slate-600">
            <span>Pieces: {formatAmount(data.footer.pieces)}</span>
            <span>Refunds: {formatAmount(data.footer.refunds)}</span>
            <span>Lifts + deliveries: {formatAmount(data.footer.liftsAndDeliveries)} kg</span>
          </div>
        </div>
      )}
    </div>
  );
}
