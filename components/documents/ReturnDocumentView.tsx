"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Pencil, Printer, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildAppAuthHeaders } from "@/lib/api/app-request-context";
import { parseApiErrorMessage } from "@/lib/api/errors";
import { parseContentDispositionFilename } from "@/lib/format";
import { formatAmount } from "@/components/orders/order-columns";
import type { LoginRole } from "@/lib/auth/role";
import type { ReturnDocumentViewData } from "@/lib/types/return-document";

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "closed") return "bg-emerald-50 text-emerald-700";
  if (s === "pending") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-500";
}

export interface ReturnDocumentViewProps {
  returnDocumentId: number;
  backHref: string;
  token?: string;
  role?: LoginRole | null;
  userId?: number;
  roleId?: number;
}

export function ReturnDocumentView({
  returnDocumentId,
  backHref,
  token,
  role,
  userId,
}: ReturnDocumentViewProps) {
  const [data, setData] = useState<ReturnDocumentViewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);
  const [removingAwb, setRemovingAwb] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!returnDocumentId) return;

    const response = await fetch(`/api/orders/return-document-view?returnDocumentId=${returnDocumentId}`, {
      headers: buildAppAuthHeaders(token, role ?? null, userId ?? 0),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(parseApiErrorMessage(payload, `Failed to load return document (${response.status})`));
    }

    setData(payload as ReturnDocumentViewData);
  }, [returnDocumentId, token, role, userId]);

  useEffect(() => {
    if (!returnDocumentId) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        await reload();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load return document");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [returnDocumentId, reload]);

  const handleRemoveOrder = async (awbNo: string) => {
    if (!token) {
      setRemoveError("Authentication required. Please log in again.");
      return;
    }

    setRemoveError(null);
    setRemovingAwb(awbNo);

    try {
      const response = await fetch("/api/orders/remove-from-return-document", {
        method: "POST",
        headers: buildAppAuthHeaders(token, role ?? null, userId ?? 0, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ awbNo, returnDocumentId }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseApiErrorMessage(payload, `Failed to remove ${awbNo} (${response.status})`));
      }

      await reload();
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : "Failed to remove order from return document");
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
      const response = await fetch(`/api/orders/generate-return-document-by-id?returnDocumentId=${returnDocumentId}`, {
        headers: buildAppAuthHeaders(token, role ?? null, userId ?? 0),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(parseApiErrorMessage(payload, `Failed to generate return document (${response.status})`));
      }

      const blob = await response.blob();
      const filename = parseContentDispositionFilename(
        response.headers.get("Content-Disposition"),
        `ReturnDocument-${returnDocumentId}.pdf`
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
      setPrintError(err instanceof Error ? err.message : "Failed to generate return document");
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-10">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 uppercase hover:text-primary"
      >
        <ArrowLeft size={14} />
        Back to Return Documents
      </Link>

      <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Return Document View</h1>

      {loading && (
        <div className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          Loading return document…
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
          <div className="p-6 border-b border-slate-50">
            <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest">Return Documents</h2>
          </div>

          {/* Sub-header info row */}
          <div className="px-6 py-4 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4 bg-slate-50/20">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-bold text-slate-600">
              <span className="text-slate-800">
                Return Parcel with parts no {data.header.returnDocumentId} from {data.header.date}
              </span>
              <span>Headquarters in {data.header.warehouseName || "—"}</span>
              <span>Courier: {data.header.riderName || "—"}</span>
              <span className={cn("inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase", statusBadgeClass(data.header.returnDocumentStatus))}>
                {data.header.returnDocumentStatus || "—"}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                title="Edit"
                className="p-2.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors flex items-center justify-center"
              >
                <Pencil size={14} />
              </button>
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
                {data.orders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <p className="text-slate-300 italic text-sm font-medium">No shipments found</p>
                    </td>
                  </tr>
                ) : (
                  data.orders.map((order) => (
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
                          title="Remove from return document"
                          className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50"
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
