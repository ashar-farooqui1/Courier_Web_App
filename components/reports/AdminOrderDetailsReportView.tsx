"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Eye, FileOutput } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageSizeSelect, OrdersPaginationFooter } from "@/components/orders/OrdersPagination";
import { formatAmount, formatOrderDate } from "@/components/orders/order-columns";
import { useAuthSession } from "@/hooks/useAuthRole";
import { buildAppAuthHeaders } from "@/lib/api/app-request-context";
import { parseApiErrorMessage } from "@/lib/api/errors";
import { unwrapOrdersList } from "@/lib/api/order";
import { exportOrdersToCsv } from "@/lib/orders/order-export";
import { ORDER_STATUS_OPTIONS, formatOrderStatusLabel, normalizeOrderStatusValue } from "@/lib/orders/order-status-options";
import type { OrderStatusApiValue } from "@/lib/orders/order-status-options";
import type { Client } from "@/lib/types/client";
import type { ClientOrder } from "@/lib/types/order";

const ReportFilter = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: { value: string; label: string }[];
  disabled?: boolean;
}) => (
  <div className="flex-1 min-w-[200px] space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      {type === "select" ? (
        <div className="relative">
          <select
            value={value ?? ""}
            onChange={onChange}
            disabled={disabled}
            className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg text-xs font-bold text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
          >
            <option value="">{placeholder}</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
        </div>
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300"
        />
      )}
    </div>
  </div>
);

const emptyFilters = {
  dateFrom: "",
  dateTo: "",
  clientId: "",
  city: "",
  status: "" as OrderStatusApiValue | "",
};

export default function AdminOrderDetailsReportView() {
  const { token, role, user, ready } = useAuthSession();
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [filterDraft, setFilterDraft] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);

  const [tableSearch, setTableSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(() => new Set());
  const [exportingReport, setExportingReport] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);

  const tableHeaders = ["AWB ID", "Client", "Customer", "Destination", "Weight", "Amount", "Booking Date", "Status", "Action"];

  const loadClients = useCallback(async () => {
    setLoadingClients(true);
    try {
      const response = await fetch("/api/clients");
      const payload = (await response.json().catch(() => null)) as Client[] | null;
      setClients(response.ok && Array.isArray(payload) ? payload : []);
    } catch {
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    if (!ready) return;

    if (!token) {
      setOrders([]);
      setOrdersError("Authentication required. Please log in again.");
      setLoading(false);
      return;
    }

    const clientId = Number(appliedFilters.clientId);
    const ordersUrl =
      Number.isInteger(clientId) && clientId > 0 ? `/api/orders?clientId=${clientId}` : "/api/orders";

    setLoading(true);
    setOrdersError(null);

    try {
      const response = await fetch(ordersUrl, {
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
    } finally {
      setLoading(false);
    }
  }, [ready, token, role, user?.userId, appliedFilters.clientId]);

  useEffect(() => {
    if (ready) loadClients();
  }, [ready, loadClients]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const clientLabel = (client: Client) =>
    client.brandName?.trim() || client.clientName?.trim() || client.clientCode || `Client #${client.clientId}`;

  const selectedClient = useMemo(
    () => clients.find((client) => String(client.clientId) === appliedFilters.clientId),
    [clients, appliedFilters.clientId]
  );

  const cityOptions = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((order) => {
      if (order.destinationCity) set.add(order.destinationCity);
    });
    return Array.from(set).sort();
  }, [orders]);

  const isWithinDateRange = (orderDate: string, from: string, to: string) => {
    if (!from && !to) return true;
    const parsed = new Date(orderDate);
    if (Number.isNaN(parsed.getTime())) return false;
    const day = parsed.toISOString().slice(0, 10);
    if (from && day < from) return false;
    if (to && day > to) return false;
    return true;
  };

  const filteredOrders = useMemo(() => {
    const query = tableSearch.trim().toLowerCase();
    const selectedClientName = selectedClient ? clientLabel(selectedClient).trim().toLowerCase() : "";

    return orders.filter((order) => {
      if (selectedClientName) {
        const orderClientName = order.clientName?.trim().toLowerCase() ?? "";
        if (orderClientName !== selectedClientName && !orderClientName.includes(selectedClientName)) return false;
      }

      if (appliedFilters.city && order.destinationCity !== appliedFilters.city) return false;

      if (appliedFilters.status && normalizeOrderStatusValue(order.status) !== appliedFilters.status) return false;

      if (!isWithinDateRange(order.orderDate, appliedFilters.dateFrom, appliedFilters.dateTo)) return false;

      if (query) {
        const haystack = [
          order.awbNo,
          order.clientName,
          order.customerName,
          order.customerPhone,
          order.destinationCity,
          order.status,
          order.riderName,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [orders, appliedFilters, selectedClient, tableSearch]);

  useEffect(() => {
    setPage(1);
  }, [filteredOrders]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pagedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const matchedOrderIds = useMemo(() => filteredOrders.map((order) => order.orderId), [filteredOrders]);

  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedOrderIds(new Set(matchedOrderIds));
  };

  const handleDeselectAll = () => {
    setSelectedOrderIds(new Set());
  };

  const handleViewReport = () => {
    setAppliedFilters(filterDraft);
    setSelectedOrderIds(new Set());
  };

  const handleExportReport = () => {
    if (filteredOrders.length === 0) return;

    setExportingReport(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      exportOrdersToCsv(filteredOrders, `order-details-report-${today}.csv`);
    } finally {
      setExportingReport(false);
    }
  };

  const handleExportAll = () => {
    if (orders.length === 0) return;

    setExportingAll(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      exportOrdersToCsv(orders, `order-details-all-${today}.csv`);
    } finally {
      setExportingAll(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1900px] mx-auto animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Order Detail Report</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleExportReport}
            disabled={exportingReport || loading || filteredOrders.length === 0}
            className="h-10 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 gap-2 px-6 disabled:opacity-50"
          >
            <FileOutput size={14} /> {exportingReport ? "Exporting…" : "Export Report"}
          </Button>
          <Button
            onClick={handleExportAll}
            disabled={exportingAll || loading || orders.length === 0}
            className="h-10 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 gap-2 px-6 disabled:opacity-50"
          >
            <FileOutput size={14} /> {exportingAll ? "Exporting…" : "Export All"}
          </Button>
        </div>
      </div>

      {ordersError && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium flex items-center justify-between gap-4">
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

      <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ReportFilter
            label="Date (From)"
            type="date"
            value={filterDraft.dateFrom}
            onChange={(e) => setFilterDraft((prev) => ({ ...prev, dateFrom: e.target.value }))}
          />
          <ReportFilter
            label="Date (To)"
            type="date"
            value={filterDraft.dateTo}
            onChange={(e) => setFilterDraft((prev) => ({ ...prev, dateTo: e.target.value }))}
          />
          <ReportFilter
            label="Client Name"
            placeholder={loadingClients ? "Loading clients..." : "Select Name"}
            type="select"
            disabled={loadingClients}
            value={filterDraft.clientId}
            onChange={(e) => setFilterDraft((prev) => ({ ...prev, clientId: e.target.value }))}
            options={clients.map((client) => ({ value: String(client.clientId), label: clientLabel(client) }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-end">
          <ReportFilter
            label="City"
            placeholder="Select City"
            type="select"
            value={filterDraft.city}
            onChange={(e) => setFilterDraft((prev) => ({ ...prev, city: e.target.value }))}
            options={cityOptions.map((city) => ({ value: city, label: city }))}
          />
          <ReportFilter
            label="Status"
            placeholder="Select Status"
            type="select"
            value={filterDraft.status}
            onChange={(e) =>
              setFilterDraft((prev) => ({ ...prev, status: e.target.value as OrderStatusApiValue | "" }))
            }
            options={ORDER_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
          />
          <Button
            onClick={handleViewReport}
            className="h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            View Report
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between bg-slate-50/30 gap-4">
          <div className="flex items-center gap-6">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Orders List</h3>
            <div className="border-l pl-6 border-slate-200">
              <PageSizeSelect pageSize={pageSize} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={matchedOrderIds.length === 0}
                className="h-9 px-4 text-[10px] font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                disabled={selectedOrderIds.size === 0}
                className="h-9 px-4 text-[10px] font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Deselect All
              </button>
            </div>
            <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Search:</span>
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="h-9 border border-slate-200 rounded-lg px-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 w-64 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={matchedOrderIds.length > 0 && matchedOrderIds.every((id) => selectedOrderIds.has(id))}
                    onChange={() =>
                      matchedOrderIds.every((id) => selectedOrderIds.has(id)) ? handleDeselectAll() : handleSelectAll()
                    }
                    disabled={matchedOrderIds.length === 0}
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </th>
                {tableHeaders.map((header) => (
                  <th
                    key={header}
                    className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[11px] font-medium text-slate-600">
              {loading ? (
                <tr>
                  <td colSpan={tableHeaders.length + 1} className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Loading orders…
                  </td>
                </tr>
              ) : pagedOrders.length === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length + 1} className="py-20 text-center">
                    <p className="text-slate-300 italic text-sm font-medium">No orders found</p>
                  </td>
                </tr>
              ) : (
                pagedOrders.map((order) => {
                  const isFinalized = order.status?.toLowerCase() === "finalize";
                  return (
                    <tr key={order.orderId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.has(order.orderId)}
                          onChange={() => toggleOrderSelection(order.orderId)}
                          className="rounded border-slate-300 text-primary focus:ring-primary"
                        />
                      </td>
                      <td
                        className="p-4 whitespace-nowrap font-bold text-primary hover:underline cursor-pointer"
                        onClick={() => router.push(`/orders/details/${order.orderId}`)}
                      >
                        {order.awbNo || "—"}
                      </td>
                      <td className="p-4 whitespace-nowrap">{order.clientName || "—"}</td>
                      <td className="p-4 whitespace-nowrap">{order.customerName || "—"}</td>
                      <td className="p-4 whitespace-nowrap">{order.destinationCity || "—"}</td>
                      <td className="p-4 whitespace-nowrap">{order.weight ? `${order.weight} kg` : "—"}</td>
                      <td className="p-4 whitespace-nowrap">{formatAmount(order.amount)}</td>
                      <td className="p-4 whitespace-nowrap">{formatOrderDate(order.orderDate)}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex px-2 py-1 rounded text-[9px] font-bold uppercase",
                            isFinalized ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          )}
                        >
                          {formatOrderStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => router.push(`/orders/details/${order.orderId}`)}
                          className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm"
                          aria-label="View order"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <OrdersPaginationFooter page={currentPage} pageSize={pageSize} totalItems={filteredOrders.length} onPageChange={setPage} />
      </div>
    </div>
  );
}
