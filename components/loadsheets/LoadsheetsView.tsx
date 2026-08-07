"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  FileStack,
  FileDown,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AppDialog, DialogBody, DialogError, DialogFormFooter, DialogLoading } from "@/components/ui/AppDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { OrdersPaginationFooter, PageSizeSelect } from "@/components/orders/OrdersPagination";
import { useAuthSession } from "@/hooks/useAuthRole";
import { buildAppAuthHeaders } from "@/lib/api/app-request-context";
import { parseContentDispositionFilename } from "@/lib/format";
import { useOrderPicker } from "@/components/loadsheets/useOrderPicker";
import type { Loadsheet, LoadsheetDetail } from "@/lib/types/loadsheet";

function formatDate(value: string): string {
  if (!value || value.startsWith("0001-")) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface OrderPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  clientId: number;
  excludeOrderIds?: Set<number>;
  submitLabel: string;
  onSubmit: (orderIds: number[]) => Promise<void>;
}

function OrderPickerDialog({
  isOpen,
  onClose,
  title,
  clientId,
  excludeOrderIds,
  submitLabel,
  onSubmit,
}: OrderPickerDialogProps) {
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
  } = useOrderPicker({ isActive: isOpen, clientId, excludeOrderIds });

  useEffect(() => {
    if (!isOpen) return;
    setSubmitError(null);
  }, [isOpen]);

  const handleSubmit = async () => {
    if (selectedOrderIds.size === 0) {
      setSubmitError("Select at least one order");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(Array.from(selectedOrderIds));
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="2xl"
      disableClose={submitting}
      footer={
        <DialogFormFooter
          onCancel={onClose}
          submitLabel={submitLabel}
          submittingLabel="Saving…"
          submitting={submitting}
          formId="order-picker-form"
        />
      }
    >
      <form
        id="order-picker-form"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
        className="flex flex-col min-h-0 flex-1"
      >
        <DialogBody className="p-0">
          {submitError && (
            <div className="px-6 pt-6">
              <DialogError message={submitError} />
            </div>
          )}

          <div className="px-6 pt-4">
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

          <div className="px-6 py-4">
            {loadingOrders ? (
              <DialogLoading message="Loading orders…" />
            ) : ordersError ? (
              <p className="text-sm text-red-600 text-center py-8">{ordersError}</p>
            ) : selectableOrders.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                {search.trim() ? "No orders match your search." : "No booked orders available."}
              </p>
            ) : (
              <div className="border border-slate-100 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
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
                      <tr
                        key={order.orderId}
                        className="border-t border-slate-50 hover:bg-slate-50/50"
                      >
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
        </DialogBody>
      </form>
    </AppDialog>
  );
}

interface LoadsheetsViewProps {
  /** Client these loadsheets belong to — admin views this per-client (via the client picker), client role always uses its own. */
  clientId: number;
  /** Shown in the header when viewing a specific client's loadsheets (admin only). */
  clientLabel?: string;
  /** Shows a "Back" link above the header when set (admin per-client view). */
  backHref?: string;
  /** Route to the "Create Loadsheet" page. */
  createHref: string;
}

export default function LoadsheetsView({ clientId, clientLabel, backHref, createHref }: LoadsheetsViewProps) {
  const { token, role, user, ready } = useAuthSession();

  const [loadsheets, setLoadsheets] = useState<Loadsheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set());
  const [details, setDetails] = useState<Map<number, LoadsheetDetail>>(() => new Map());
  const [loadingDetailIds, setLoadingDetailIds] = useState<Set<number>>(() => new Set());
  const [detailErrors, setDetailErrors] = useState<Map<number, string>>(() => new Map());

  const [addOrdersTarget, setAddOrdersTarget] = useState<Loadsheet | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{ loadsheetId: number; orderId: number; awbNo: string } | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null);

  const authHeaders = useCallback(
    () => buildAppAuthHeaders(token, role, user?.userId ?? 0),
    [token, role, user?.userId]
  );

  const loadLoadsheets = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/loadsheets?clientId=${clientId}`, { headers: authHeaders() });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const message = payload && !Array.isArray(payload) ? payload.message : undefined;
        throw new Error(message ?? `Failed to load loadsheets (${response.status})`);
      }
      setLoadsheets(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setLoadsheets([]);
      setError(err instanceof Error ? err.message : "Failed to load loadsheets");
    } finally {
      setLoading(false);
    }
  }, [clientId, authHeaders]);

  useEffect(() => {
    if (!ready) return;
    void loadLoadsheets();
  }, [ready, loadLoadsheets]);

  const loadDetail = useCallback(
    async (loadsheetId: number) => {
      setLoadingDetailIds((prev) => new Set(prev).add(loadsheetId));
      setDetailErrors((prev) => {
        const next = new Map(prev);
        next.delete(loadsheetId);
        return next;
      });
      try {
        const response = await fetch(`/api/loadsheets/${loadsheetId}`, { headers: authHeaders() });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload) {
          throw new Error((payload && payload.message) || `Failed to load loadsheet (${response.status})`);
        }
        setDetails((prev) => new Map(prev).set(loadsheetId, payload as LoadsheetDetail));
      } catch (err) {
        setDetailErrors((prev) =>
          new Map(prev).set(loadsheetId, err instanceof Error ? err.message : "Failed to load loadsheet")
        );
      } finally {
        setLoadingDetailIds((prev) => {
          const next = new Set(prev);
          next.delete(loadsheetId);
          return next;
        });
      }
    },
    [authHeaders]
  );

  const toggleExpand = (loadsheetId: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(loadsheetId)) {
        next.delete(loadsheetId);
      } else {
        next.add(loadsheetId);
        if (!details.has(loadsheetId)) void loadDetail(loadsheetId);
      }
      return next;
    });
  };

  const pagedLoadsheets = useMemo(() => {
    const start = (page - 1) * pageSize;
    return loadsheets.slice(start, start + pageSize);
  }, [loadsheets, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [loadsheets.length]);

  const handleAddOrdersSubmit = async (orderIds: number[]) => {
    if (!addOrdersTarget) return;
    const response = await fetch("/api/loadsheets/add-orders", {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ loadsheetId: addOrdersTarget.loadsheetId, orderIds }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.success === false) {
      throw new Error(payload?.message ?? "Failed to add orders");
    }
    setSuccessMessage(payload?.message ?? "Orders added to loadsheet");
    await loadDetail(addOrdersTarget.loadsheetId);
    await loadLoadsheets();
  };

  const handleRemoveConfirm = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    setRemoveError(null);
    try {
      const response = await fetch("/api/loadsheets/remove-orders", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ loadsheetId: removeTarget.loadsheetId, orderIds: [removeTarget.orderId] }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message ?? "Failed to remove order");
      }
      setSuccessMessage(payload?.message ?? "Order removed from loadsheet");
      await loadDetail(removeTarget.loadsheetId);
      await loadLoadsheets();
      setRemoveTarget(null);
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : "Failed to remove order");
    } finally {
      setRemoving(false);
    }
  };

  const handleGeneratePdf = async (loadsheetId: number) => {
    setPdfLoadingId(loadsheetId);
    setError(null);
    try {
      const response = await fetch(`/api/loadsheets/pdf?loadsheetId=${loadsheetId}`, {
        headers: authHeaders(),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? `Failed to generate PDF (${response.status})`);
      }
      const blob = await response.blob();
      const filename = parseContentDispositionFilename(
        response.headers.get("Content-Disposition"),
        `Loadsheet_${loadsheetId}.pdf`
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
      setError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setPdfLoadingId(null);
    }
  };

  return (
    <div className="p-6 space-y-4">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 uppercase hover:text-primary"
        >
          <ArrowLeft size={14} />
          Back to Clients
        </Link>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileStack className="text-primary" size={22} />
          <div>
            <h1 className="text-lg font-bold text-slate-800">Loadsheets</h1>
            {clientLabel && <p className="text-xs font-medium text-slate-500">{clientLabel}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" onClick={() => void loadLoadsheets()} disabled={loading}>
            <RefreshCw size={16} className={cn("mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Link
            href={createHref}
            className="inline-flex items-center justify-center h-10 px-4 rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Create Loadsheet
          </Link>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center justify-between gap-3 bg-emerald-50 text-emerald-800 text-sm font-medium px-4 py-3 rounded-lg">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-between gap-3 bg-red-50 text-red-700 text-sm font-medium px-4 py-3 rounded-lg">
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-10 px-3 py-3" />
                <th className="text-left px-3 py-3 text-[11px] font-bold text-slate-500 uppercase">Loadsheet #</th>
                <th className="text-left px-3 py-3 text-[11px] font-bold text-slate-500 uppercase">Orders</th>
                <th className="text-left px-3 py-3 text-[11px] font-bold text-slate-500 uppercase">Created</th>
                <th className="text-right px-3 py-3 text-[11px] font-bold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Loading…
                  </td>
                </tr>
              ) : pagedLoadsheets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 text-sm">
                    No loadsheets found.
                  </td>
                </tr>
              ) : (
                pagedLoadsheets.map((loadsheet) => {
                  const isExpanded = expandedIds.has(loadsheet.loadsheetId);
                  const detail = details.get(loadsheet.loadsheetId);
                  const detailLoading = loadingDetailIds.has(loadsheet.loadsheetId);
                  const detailError = detailErrors.get(loadsheet.loadsheetId);

                  return (
                    <React.Fragment key={loadsheet.loadsheetId}>
                      <tr className="border-t border-slate-50 hover:bg-slate-50/40">
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => toggleExpand(loadsheet.loadsheetId)}
                            className="text-slate-400 hover:text-primary"
                            aria-label={isExpanded ? "Collapse" : "Expand"}
                          >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                        </td>
                        <td className="px-3 py-3 font-bold text-slate-700">#{loadsheet.loadsheetId}</td>
                        <td className="px-3 py-3 text-slate-600">{loadsheet.totalConsignments}</td>
                        <td className="px-3 py-3 text-slate-600">{formatDate(loadsheet.createdAt)}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setAddOrdersTarget(loadsheet)}
                              className="h-8 px-3 text-[11px] font-bold uppercase rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
                            >
                              <Plus size={14} className="inline mr-1 -mt-0.5" />
                              Add Orders
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleGeneratePdf(loadsheet.loadsheetId)}
                              disabled={pdfLoadingId === loadsheet.loadsheetId}
                              className="h-8 px-3 text-[11px] font-bold uppercase rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            >
                              <FileDown size={14} className="inline mr-1 -mt-0.5" />
                              {pdfLoadingId === loadsheet.loadsheetId ? "Generating…" : "PDF"}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="border-t border-slate-50 bg-slate-50/30">
                          <td colSpan={5} className="px-6 py-4">
                            {detailLoading ? (
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 text-center py-4">
                                Loading orders…
                              </p>
                            ) : detailError ? (
                              <p className="text-sm text-red-600 text-center py-4">{detailError}</p>
                            ) : !detail || detail.orders.length === 0 ? (
                              <p className="text-sm text-slate-400 text-center py-4">No orders in this loadsheet.</p>
                            ) : (
                              <div className="border border-slate-100 rounded-lg overflow-hidden bg-white">
                                <table className="w-full text-xs">
                                  <thead className="bg-slate-100">
                                    <tr>
                                      <th className="text-left px-3 py-2 font-bold text-slate-500 uppercase">AWB</th>
                                      <th className="text-left px-3 py-2 font-bold text-slate-500 uppercase">Customer</th>
                                      <th className="text-left px-3 py-2 font-bold text-slate-500 uppercase">Destination</th>
                                      <th className="text-left px-3 py-2 font-bold text-slate-500 uppercase">Status</th>
                                      <th className="text-right px-3 py-2 font-bold text-slate-500 uppercase">Amount</th>
                                      <th className="w-10 px-3 py-2" />
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {detail.orders.map((order) => (
                                      <tr key={order.orderId} className="border-t border-slate-50">
                                        <td className="px-3 py-2 font-medium text-slate-700">{order.awbNo || "—"}</td>
                                        <td className="px-3 py-2 text-slate-600">{order.customerName || "—"}</td>
                                        <td className="px-3 py-2 text-slate-600">{order.destinationCity || "—"}</td>
                                        <td className="px-3 py-2 text-slate-600">{order.status || "—"}</td>
                                        <td className="px-3 py-2 text-right text-slate-600">{order.amount}</td>
                                        <td className="px-3 py-2 text-right">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setRemoveTarget({
                                                loadsheetId: loadsheet.loadsheetId,
                                                orderId: order.orderId,
                                                awbNo: order.awbNo,
                                              })
                                            }
                                            className="text-slate-300 hover:text-red-600"
                                            aria-label="Remove order"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <OrdersPaginationFooter
          page={page}
          pageSize={pageSize}
          totalItems={loadsheets.length}
          onPageChange={setPage}
        />
        <div className="px-4 pb-4">
          <PageSizeSelect pageSize={pageSize} onPageSizeChange={setPageSize} />
        </div>
      </div>

      <OrderPickerDialog
        isOpen={addOrdersTarget !== null}
        onClose={() => setAddOrdersTarget(null)}
        title={addOrdersTarget ? `Add Orders to Loadsheet #${addOrdersTarget.loadsheetId}` : "Add Orders"}
        clientId={clientId}
        excludeOrderIds={
          addOrdersTarget
            ? new Set(details.get(addOrdersTarget.loadsheetId)?.orders.map((o) => o.orderId) ?? [])
            : undefined
        }
        submitLabel="Add"
        onSubmit={handleAddOrdersSubmit}
      />

      <ConfirmDialog
        isOpen={removeTarget !== null}
        onClose={() => {
          setRemoveTarget(null);
          setRemoveError(null);
        }}
        onConfirm={() => void handleRemoveConfirm()}
        title="Remove Order"
        message={`Remove order ${removeTarget?.awbNo ?? ""} from this loadsheet?`}
        error={removeError ?? undefined}
        loading={removing}
        confirmLabel="Remove"
      />
    </div>
  );
}
