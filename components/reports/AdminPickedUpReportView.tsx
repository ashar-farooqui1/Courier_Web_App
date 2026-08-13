"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, FileOutput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageSizeSelect, OrdersPaginationFooter } from "@/components/orders/OrdersPagination";
import { useAuthSession } from "@/hooks/useAuthRole";
import { buildAppAuthHeaders } from "@/lib/api/app-request-context";
import { parseApiErrorMessage } from "@/lib/api/errors";
import { formatAmount, formatOrderDate } from "@/components/orders/order-columns";
import { formatArrivalAt, formatTimeOfDay } from "@/lib/format";
import { exportPickupReportToCsv } from "@/lib/reports/pickup-report-export";
import type { Client } from "@/lib/types/client";
import type { Rider } from "@/lib/types/rider";
import type { City } from "@/lib/types/city";
import type { PickupReportData, PickupReportItem } from "@/lib/types/pickup-report";

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
  pickupDate: "",
  clientId: "",
  riderId: "",
  cityId: "",
};

export default function AdminPickedUpReportView() {
  const { token, role, user, ready } = useAuthSession();

  const [clients, setClients] = useState<Client[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);

  const [items, setItems] = useState<PickupReportItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reportError, setReportError] = useState<string | null>(null);

  const [filterDraft, setFilterDraft] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);

  const [tableSearch, setTableSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [exporting, setExporting] = useState(false);

  const tableHeaders = [
    "AWB ID",
    "Sales Person",
    "Client",
    "Brand Name",
    "Customer Name",
    "Customer Number",
    "Customer Reference",
    "Pickup Address",
    "Delivery Address",
    "Area",
    "Origin",
    "Destination",
    "Service",
    "Amount",
    "Weight",
    "Order Date & Time",
    "Exp. Delivery Date",
    "Pickup Date",
    "Pickup Time",
    "Picked Up By",
    "Status",
  ];

  const loadLookups = useCallback(async () => {
    setLoadingLookups(true);
    try {
      const [clientsRes, ridersRes, citiesRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/riders"),
        fetch("/api/cities"),
      ]);
      const [clientsPayload, ridersPayload, citiesPayload] = await Promise.all([
        clientsRes.json().catch(() => null),
        ridersRes.json().catch(() => null),
        citiesRes.json().catch(() => null),
      ]);
      setClients(clientsRes.ok && Array.isArray(clientsPayload) ? clientsPayload : []);
      setRiders(ridersRes.ok && Array.isArray(ridersPayload) ? ridersPayload : []);
      setCities(citiesRes.ok && Array.isArray(citiesPayload) ? citiesPayload : []);
    } catch {
      setClients([]);
      setRiders([]);
      setCities([]);
    } finally {
      setLoadingLookups(false);
    }
  }, []);

  const buildQuery = useCallback(
    (overridePage?: number, overridePageSize?: number) => {
      const query = new URLSearchParams();
      if (appliedFilters.clientId) query.set("clientId", appliedFilters.clientId);
      if (appliedFilters.riderId) query.set("riderId", appliedFilters.riderId);
      if (appliedFilters.cityId) query.set("cityId", appliedFilters.cityId);
      if (appliedFilters.pickupDate) {
        query.set("pickupDateFrom", appliedFilters.pickupDate);
        query.set("pickupDateTo", appliedFilters.pickupDate);
      }
      query.set("page", String(overridePage ?? page));
      query.set("pageSize", String(overridePageSize ?? pageSize));
      return query.toString();
    },
    [appliedFilters, page, pageSize]
  );

  const loadReport = useCallback(async () => {
    if (!ready) return;

    if (!token) {
      setItems([]);
      setTotalCount(0);
      setReportError("Authentication required. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setReportError(null);

    try {
      const response = await fetch(`/api/orders/pickup-report?${buildQuery()}`, {
        headers: buildAppAuthHeaders(token, role, user?.userId ?? 0),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseApiErrorMessage(payload, `Failed to load pickup report (${response.status})`));
      }

      const data = payload as PickupReportData;
      setItems(data.items ?? []);
      setTotalCount(data.totalCount ?? 0);
    } catch (err) {
      setItems([]);
      setTotalCount(0);
      setReportError(err instanceof Error ? err.message : "Failed to load pickup report");
    } finally {
      setLoading(false);
    }
  }, [ready, token, role, user?.userId, buildQuery]);

  useEffect(() => {
    if (ready) loadLookups();
  }, [ready, loadLookups]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const clientLabel = (client: Client) =>
    client.brandName?.trim() || client.clientName?.trim() || client.clientCode || `Client #${client.clientId}`;

  const filteredItems = useMemo(() => {
    const query = tableSearch.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) => {
      const haystack = [
        item.trackingId,
        item.salesPerson,
        item.client,
        item.brandName,
        item.customerName,
        item.customerNumber,
        item.customerReference,
        item.pickupAddress,
        item.deliveryAddress,
        item.area,
        item.originCity,
        item.city,
        item.service,
        item.status,
        item.pickedUpBy,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [items, tableSearch]);

  const matchedIds = useMemo(() => filteredItems.map((item) => item.trackingId), [filteredItems]);

  const toggleSelection = (trackingId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(trackingId)) next.delete(trackingId);
      else next.add(trackingId);
      return next;
    });
  };

  const handleSelectAll = () => setSelectedIds(new Set(matchedIds));
  const handleDeselectAll = () => setSelectedIds(new Set());

  const handleViewReport = () => {
    setAppliedFilters(filterDraft);
    setSelectedIds(new Set());
    setPage(1);
  };

  const handleExport = async () => {
    if (!token || totalCount === 0) return;

    setExporting(true);
    try {
      const query = buildQuery(1, Math.max(totalCount, 1));
      const response = await fetch(`/api/orders/pickup-report?${query}`, {
        headers: buildAppAuthHeaders(token, role, user?.userId ?? 0),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseApiErrorMessage(payload, `Failed to export pickup report (${response.status})`));
      }

      const data = payload as PickupReportData;
      const today = new Date().toISOString().slice(0, 10);
      exportPickupReportToCsv(data.items ?? [], `picked-up-orders-${today}.csv`);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Failed to export pickup report");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1900px] mx-auto animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Picked Up Orders Report</h1>
        <Button
          onClick={handleExport}
          disabled={exporting || loading || totalCount === 0}
          className="h-10 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 gap-2 px-6 disabled:opacity-50"
        >
          <FileOutput size={14} /> {exporting ? "Exporting…" : "Export"}
        </Button>
      </div>

      {reportError && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium flex items-center justify-between gap-4">
          <span>{reportError}</span>
          <button
            type="button"
            onClick={loadReport}
            className="shrink-0 h-8 px-4 bg-red-600 text-white text-[10px] font-bold rounded uppercase hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ReportFilter
            label="Pickup Date"
            type="date"
            value={filterDraft.pickupDate}
            onChange={(e) => setFilterDraft((prev) => ({ ...prev, pickupDate: e.target.value }))}
          />
          <ReportFilter
            label="Client"
            placeholder={loadingLookups ? "Loading clients..." : "Select Client"}
            type="select"
            disabled={loadingLookups}
            value={filterDraft.clientId}
            onChange={(e) => setFilterDraft((prev) => ({ ...prev, clientId: e.target.value }))}
            options={clients.map((client) => ({ value: String(client.clientId), label: clientLabel(client) }))}
          />
          <ReportFilter
            label="Rider"
            placeholder={loadingLookups ? "Loading riders..." : "Select Rider"}
            type="select"
            disabled={loadingLookups}
            value={filterDraft.riderId}
            onChange={(e) => setFilterDraft((prev) => ({ ...prev, riderId: e.target.value }))}
            options={riders.map((rider) => ({ value: String(rider.riderId), label: rider.name }))}
          />
          <ReportFilter
            label="City"
            placeholder={loadingLookups ? "Loading cities..." : "Select City"}
            type="select"
            disabled={loadingLookups}
            value={filterDraft.cityId}
            onChange={(e) => setFilterDraft((prev) => ({ ...prev, cityId: e.target.value }))}
            options={cities.map((city) => ({ value: String(city.cityId), label: city.cityName }))}
          />
        </div>
        <div className="flex justify-start">
          <Button
            onClick={handleViewReport}
            className="h-12 px-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            View Report
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between bg-slate-50/30 gap-4">
          <div className="flex items-center gap-6">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Picked Up List</h3>
            <div className="border-l pl-6 border-slate-200">
              <PageSizeSelect pageSize={pageSize} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
            </div>
            <div className="flex gap-2 border-l pl-6 border-slate-200">
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={matchedIds.length === 0}
                className="h-9 px-4 text-[10px] font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                disabled={selectedIds.size === 0}
                className="h-9 px-4 text-[10px] font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Deselect All
              </button>
            </div>
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

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={matchedIds.length > 0 && matchedIds.every((id) => selectedIds.has(id))}
                    onChange={() => (matchedIds.every((id) => selectedIds.has(id)) ? handleDeselectAll() : handleSelectAll())}
                    disabled={matchedIds.length === 0}
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
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length + 1} className="py-20 text-center">
                    <p className="text-slate-300 italic text-sm font-medium">No picked up orders found</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.trackingId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.trackingId)}
                        onChange={() => toggleSelection(item.trackingId)}
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="p-4 whitespace-nowrap font-bold text-primary">{item.trackingId || "—"}</td>
                    <td className="p-4 whitespace-nowrap">{item.salesPerson || "—"}</td>
                    <td className="p-4 whitespace-nowrap">{item.client || "—"}</td>
                    <td className="p-4 whitespace-nowrap">{item.brandName || "—"}</td>
                    <td className="p-4 whitespace-nowrap">{item.customerName || "—"}</td>
                    <td className="p-4 whitespace-nowrap">{item.customerNumber || "—"}</td>
                    <td className="p-4 whitespace-nowrap">{item.customerReference || "—"}</td>
                    <td className="p-4 max-w-[220px] truncate" title={item.pickupAddress || undefined}>{item.pickupAddress || "—"}</td>
                    <td className="p-4 max-w-[220px] truncate" title={item.deliveryAddress || undefined}>{item.deliveryAddress || "—"}</td>
                    <td className="p-4 whitespace-nowrap">{item.area || "—"}</td>
                    <td className="p-4 whitespace-nowrap">{item.originCity || "—"}</td>
                    <td className="p-4 whitespace-nowrap">{item.city || "—"}</td>
                    <td className="p-4 whitespace-nowrap">{item.service || "—"}</td>
                    <td className="p-4 whitespace-nowrap">{formatAmount(item.amount)}</td>
                    <td className="p-4 whitespace-nowrap">{item.weight ? `${item.weight} kg` : "—"}</td>
                    <td className="p-4 whitespace-nowrap">{formatOrderDate(item.orderDateTime)}</td>
                    <td className="p-4 whitespace-nowrap">{formatOrderDate(item.expDeliveryDate)}</td>
                    <td className="p-4 whitespace-nowrap">{item.pickupDate ? formatArrivalAt(item.pickupDate) : "—"}</td>
                    <td className="p-4 whitespace-nowrap">{formatTimeOfDay(item.pickupTime)}</td>
                    <td className="p-4 whitespace-nowrap">{item.pickedUpBy || "—"}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-[9px] font-bold uppercase tracking-wider">
                        {item.status || "—"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <OrdersPaginationFooter page={page} pageSize={pageSize} totalItems={totalCount} onPageChange={setPage} />
      </div>
    </div>
  );
}
