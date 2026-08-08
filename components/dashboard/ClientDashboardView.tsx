"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Calendar, Download } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthRole";
import { buildAppAuthHeaders } from "@/lib/api/app-request-context";
import { parseApiErrorMessage } from "@/lib/api/errors";
import { unwrapOrdersList } from "@/lib/api/order";
import { applyMnpTrackingStatus, buildMnpStatusMap, isMnpOrder } from "@/lib/orders/mnp-status";
import { formatOrderDate, formatAmount } from "@/components/orders/order-columns";
import ShipmentFinancialSummary from "@/components/dashboard/ShipmentFinancialSummary";
import DashboardHeroBanner from "@/components/dashboard/DashboardHeroBanner";
import DashboardStatusTabs from "@/components/dashboard/DashboardStatusTabs";
import { PageSizeSelect, OrdersPaginationFooter } from "@/components/orders/OrdersPagination";
import { formatOrderStatusLabel } from "@/lib/orders/order-status-options";
import { DASHBOARD_STATUS_BUCKETS, computeDashboardStatusCounts } from "@/lib/orders/dashboard-status-buckets";
import type { ClientOrder } from "@/lib/types/order";
import type { MnpTrackingDetail } from "@/lib/types/mnp";

const FilterField = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex-1 min-w-[180px] space-y-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative group">
      <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-10 px-4 bg-white border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300"
      />
      {type === "date" && (
        <Calendar
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          size={14}
        />
      )}
    </div>
  </div>
);

interface DashboardColumn {
  label: string;
  filterable: boolean;
  type?: "date";
  getValue: (order: ClientOrder) => string;
  render: (order: ClientOrder) => ReactNode;
}

const DASHBOARD_COLUMNS: DashboardColumn[] = [
  { label: "CN", filterable: true, getValue: (o) => o.awbNo ?? "", render: (o) => o.awbNo || "—" },
  { label: "Origin", filterable: true, getValue: (o) => o.originCity ?? "", render: (o) => o.originCity || "—" },
  {
    label: "Destination",
    filterable: true,
    getValue: (o) => o.destinationCity ?? "",
    render: (o) => o.destinationCity || "—",
  },
  {
    label: "Customer Name",
    filterable: true,
    getValue: (o) => o.customerName ?? "",
    render: (o) => o.customerName || "—",
  },
  {
    label: "Phone Number",
    filterable: true,
    getValue: (o) => o.customerPhone ?? "",
    render: (o) => o.customerPhone || "—",
  },
  {
    label: "COD Amount",
    filterable: true,
    getValue: (o) => String(o.amount ?? ""),
    render: (o) => formatAmount(o.amount),
  },
  {
    label: "Last Status",
    filterable: true,
    getValue: (o) => formatOrderStatusLabel(o.status),
    render: (o) => (
      <span className="inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-700">
        {formatOrderStatusLabel(o.status)}
      </span>
    ),
  },
  {
    label: "Booking Date",
    filterable: true,
    type: "date",
    getValue: (o) => (o.orderDate ? o.orderDate.slice(0, 10) : ""),
    render: (o) => formatOrderDate(o.orderDate),
  },
  { label: "Pickup Date", filterable: false, getValue: () => "", render: () => "—" },
  { label: "Last Status Date", filterable: false, getValue: () => "", render: () => "—" },
  { label: "Payment Date", filterable: false, getValue: () => "", render: () => "—" },
  {
    label: "Shipper Advise",
    filterable: true,
    getValue: (o) => (o.status === "HaltAdviceSent" ? "Yes" : "No"),
    render: (o) => (o.status === "HaltAdviceSent" ? "Yes" : "No"),
  },
  { label: "Transaction No", filterable: false, getValue: () => "", render: () => "—" },
  { label: "Support Ticket", filterable: false, getValue: () => "", render: () => "—" },
];

export default function ClientDashboardView() {
  const { token, clientId, role, ready, username } = useAuthSession();

  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<string | null>("Booking");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const loadOrders = useCallback(async () => {
    if (!ready) return;

    if (!token || !Number.isInteger(clientId) || clientId < 1) {
      setOrders([]);
      setOrdersError("Client session not found. Please log in again.");
      setLoadingOrders(false);
      return;
    }

    setLoadingOrders(true);
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
    } finally {
      setLoadingOrders(false);
    }
  }, [clientId, ready, role, token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const statusCounts = useMemo(() => computeDashboardStatusCounts(orders), [orders]);

  const statusTabs = [
    { label: "Total", value: orders.length },
    { label: "Booking", value: statusCounts["Booking"] ?? 0 },
    { label: "Picked", value: statusCounts["Picked"] ?? 0 },
    { label: "In Transit", value: statusCounts["In Transit"] ?? 0 },
    { label: "Out for Delivery", value: statusCounts["Out for Delivery"] ?? 0 },
    { label: "Shipper Advise", value: statusCounts["Shipper Advise"] ?? 0 },
    { label: "Delivered", value: statusCounts["Delivered"] ?? 0 },
    { label: "Return In Transit", value: statusCounts["Return In Transit"] ?? 0 },
    { label: "Returned", value: statusCounts["Returned"] ?? 0 },
    { label: "Payment Settled", value: 0, disabled: true },
    { label: "Cancelled", value: statusCounts["Cancelled"] ?? 0 },
  ];

  const isWithinDateRange = (orderDate: string, from: string, to: string) => {
    if (!from && !to) return true;
    const parsed = new Date(orderDate);
    if (Number.isNaN(parsed.getTime())) return false;
    const day = parsed.toISOString().slice(0, 10);
    if (from && day < from) return false;
    if (to && day > to) return false;
    return true;
  };

  const updateColumnFilter = (label: string, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [label]: value }));
  };

  const filteredOrders = useMemo(() => {
    const origin = originQuery.trim().toLowerCase();
    const destination = destinationQuery.trim().toLowerCase();

    return orders.filter((order) => {
      if (selectedStatus === "Payment Settled") return false;

      if (selectedStatus && selectedStatus !== "Total") {
        const bucket = DASHBOARD_STATUS_BUCKETS[selectedStatus];
        if (bucket && !(bucket as string[]).includes(order.status)) return false;
      }

      if (!isWithinDateRange(order.orderDate, dateFrom, dateTo)) return false;

      if (origin && !order.originCity?.toLowerCase().includes(origin)) return false;
      if (destination && !order.destinationCity?.toLowerCase().includes(destination)) return false;

      for (const column of DASHBOARD_COLUMNS) {
        if (!column.filterable) continue;
        const filterValue = columnFilters[column.label]?.trim();
        if (!filterValue) continue;

        const cellValue = column.getValue(order);
        if (column.type === "date") {
          if (cellValue !== filterValue) return false;
        } else if (!cellValue.toLowerCase().includes(filterValue.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [orders, selectedStatus, dateFrom, dateTo, originQuery, destinationQuery, columnFilters]);

  useEffect(() => {
    setPage(1);
  }, [selectedStatus, dateFrom, dateTo, originQuery, destinationQuery, columnFilters, orders]);

  const pagedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page, pageSize]);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardHeroBanner greetingName={username} totalOrders={orders.length} />

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-wrap gap-4">
          <FilterField
            label="Booking Date (From)"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <FilterField
            label="Booking Date (To)"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <FilterField
            label="Origin"
            placeholder="Origin"
            value={originQuery}
            onChange={(e) => setOriginQuery(e.target.value)}
          />
          <FilterField
            label="Destination"
            placeholder="Destination"
            value={destinationQuery}
            onChange={(e) => setDestinationQuery(e.target.value)}
          />
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

      <ShipmentFinancialSummary orders={orders} />

      <DashboardStatusTabs tabs={statusTabs} active={selectedStatus} onChange={setSelectedStatus} />

      {selectedStatus && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="p-8 border-b border-slate-50 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <PageSizeSelect
                  pageSize={pageSize}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                />
              </div>

              <h2 className="text-xl font-bold text-slate-600 flex items-center gap-2">
                <span className="text-emerald-500">{selectedStatus}</span> Shipments Details
              </h2>

              <button className="h-10 px-6 bg-emerald-500 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                <Download size={16} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/30">
                  {DASHBOARD_COLUMNS.map((column) => (
                    <th
                      key={column.label}
                      className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-slate-50">
                  {DASHBOARD_COLUMNS.map((column) => (
                    <td key={column.label} className="p-2">
                      <input
                        type={column.type === "date" ? "date" : "text"}
                        value={columnFilters[column.label] ?? ""}
                        onChange={(e) => updateColumnFilter(column.label, e.target.value)}
                        disabled={!column.filterable}
                        title={column.filterable ? undefined : "Not tracked yet"}
                        className="w-full h-8 px-2 border border-slate-100 rounded text-[10px] font-bold text-primary focus:outline-none appearance-none disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingOrders ? (
                  <tr>
                    <td colSpan={DASHBOARD_COLUMNS.length} className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                      Loading orders…
                    </td>
                  </tr>
                ) : pagedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={DASHBOARD_COLUMNS.length} className="py-12 text-center">
                      <p className="text-slate-300 italic text-sm font-medium">No Data</p>
                    </td>
                  </tr>
                ) : (
                  pagedOrders.map((order) => (
                    <tr key={order.orderId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      {DASHBOARD_COLUMNS.map((column) => (
                        <td key={column.label} className="p-4 text-[11px] font-medium text-slate-600 whitespace-nowrap">
                          {column.render(order)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <OrdersPaginationFooter
            page={page}
            pageSize={pageSize}
            totalItems={filteredOrders.length}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
