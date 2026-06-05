"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Import,
  FileText,
  Printer,
  Plus,
  Truck,
  X,
  ChevronDown,
  Calendar,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddClientOrderDialog } from "@/components/orders/AddClientOrderDialog";
import { useAuthSession } from "@/hooks/useAuthRole";
import type { ClientOrder } from "@/lib/types/order";
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-4xl",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div
        className={cn(
          "bg-white rounded-xl shadow-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200",
          maxWidth
        )}
      >
        <div className="bg-primary px-6 py-4 flex items-center justify-between text-white">
          <h3 className="font-bold uppercase tracking-widest text-sm">{title}</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[85vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const ActionButton = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2.5 rounded bg-primary text-white text-[10px] font-bold uppercase tracking-tight transition-all active:scale-95 shadow-sm hover:bg-primary/90"
  >
    <Icon size={14} />
    {label}
  </button>
);

const ModalInput = ({
  label,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {type === "select" ? (
        <>
          <select className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer">
            <option value="">{placeholder}</option>
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={14}
          />
        </>
      ) : type === "textarea" ? (
        <textarea
          placeholder={placeholder}
          rows={3}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300 resize-none"
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300"
        />
      )}
    </div>
  </div>
);

const OrderFilter = ({
  label,
  placeholder,
  type = "text",
  value,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
}) => (
  <div className="space-y-1">
    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative">
      {type === "select" ? (
        <>
          <select className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-700 appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20">
            <option value="">{placeholder}</option>
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={12}
          />
        </>
      ) : (
        <>
          <input
            type={type}
            defaultValue={value}
            placeholder={placeholder}
            className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-slate-300"
          />
          {type === "date" && (
            <Calendar
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={12}
            />
          )}
        </>
      )}
    </div>
  </div>
);

function formatOrderDate(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

const ORDER_COLUMNS: {
  label: string;
  render: (order: ClientOrder) => React.ReactNode;
  cellClassName?: string;
}[] = [
  {
    label: "AWB No",
    cellClassName: "font-bold text-primary",
    render: (order) => order.awbNo || "—",
  },
  { label: "Client Name", render: (order) => order.clientName || "—" },
  { label: "Customer Name", render: (order) => order.customerName || "—" },
  { label: "Customer Phone", render: (order) => order.customerPhone || "—" },
  { label: "Amount", render: (order) => formatAmount(order.amount) },
  { label: "Product Name", render: (order) => order.productName || "—" },
  { label: "Customer Reference", render: (order) => order.customerReference || "—" },
  { label: "Service", render: (order) => order.serviceName || "—" },
  { label: "Weight", render: (order) => order.weight || "—" },
  { label: "Order Time & Date", render: (order) => formatOrderDate(order.orderDate) },
  {
    label: "Status",
    render: (order) => (
      <span className="inline-flex px-2 py-1 rounded bg-amber-50 text-amber-700 text-[10px] font-bold uppercase">
        {order.status || "—"}
      </span>
    ),
  },
  { label: "Destination City", render: (order) => order.destinationCity || "—" },
  { label: "Origin City", render: (order) => order.originCity || "—" },
  { label: "Warehouse", render: (order) => order.warehouse || "—" },
];

export default function ClientOrdersView() {
  const router = useRouter();
  const { user, token, ready } = useAuthSession();
  const clientId = user?.userId ?? 0;

  const [modalStates, setModalStates] = useState({
    addNew: false,
    pickup: false,
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState("");

  const toggleModal = (key: keyof typeof modalStates, val: boolean) => {
    setModalStates((prev) => ({ ...prev, [key]: val }));
  };

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
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = (await response.json().catch(() => null)) as
        | ClientOrder[]
        | { message?: string }
        | null;

      if (!response.ok) {
        const message =
          payload && !Array.isArray(payload) ? payload.message : undefined;
        throw new Error(message ?? `Failed to load orders (${response.status})`);
      }

      setOrders(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setOrders([]);
      setOrdersError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  }, [clientId, ready, token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const query = tableSearch.trim().toLowerCase();
    if (!query) return orders;

    return orders.filter((order) => {
      const haystack = [
        order.awbNo,
        order.clientName,
        order.customerName,
        order.customerPhone,
        order.customerReference,
        order.productName,
        order.serviceName,
        order.status,
        order.destinationCity,
        order.originCity,
        order.warehouse,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [orders, tableSearch]);

  const handleOrderCreated = (message: string) => {
    setSuccessMessage(message);
    loadOrders();
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Order Details</h1>
        <div className="flex flex-wrap gap-2">
          <ActionButton icon={Import} label="Import" onClick={() => router.push("/orders/import")} />
          <ActionButton icon={FileText} label="Loadsheet" />
          <ActionButton icon={Printer} label="AWB Print" />
          <ActionButton icon={Plus} label="Add New" onClick={() => toggleModal("addNew", true)} />
          <ActionButton icon={Truck} label="Pickup Request" onClick={() => toggleModal("pickup", true)} />
        </div>
      </div>

      <AddClientOrderDialog
        isOpen={modalStates.addNew}
        onClose={() => toggleModal("addNew", false)}
        onSuccess={handleOrderCreated}
      />

      {(ordersError || successMessage) && (
        <div className="space-y-3">
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
          {successMessage && (
            <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wide">
              <span>{successMessage}</span>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                className="shrink-0 p-1 hover:bg-emerald-100 rounded-full transition-colors"
                aria-label="Dismiss message"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={modalStates.pickup}
        onClose={() => toggleModal("pickup", false)}
        title="Send Pickup Request"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <ModalInput label="Pickup Location" placeholder="Pickup Location" type="select" />
          <ModalInput label="Request Title" placeholder="Orders Pickup Request" />
          <ModalInput
            label="Description"
            placeholder="Please Pickup Orders From Our warehouse"
            type="textarea"
          />
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => toggleModal("pickup", false)}
              className="h-11 px-10 border border-primary text-primary text-[11px] font-bold rounded-lg uppercase hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button className="h-11 px-10 bg-primary text-white text-[11px] font-bold rounded-lg uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all">
              Send
            </button>
          </div>
        </div>
      </Modal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <OrderFilter label="AWB ID" placeholder="Enter AWB ID" />
            <OrderFilter label="Customer Reference" placeholder="Enter Customer Reference" />
            <OrderFilter label="Date (From)" type="date" value="2026-06-03" />
            <OrderFilter label="Date (To)" type="date" value="2026-06-03" />
            <OrderFilter label="City" placeholder="Select City" type="select" />
            <OrderFilter label="Status" placeholder="Select Status" type="select" />
          </div>
          <div className="mt-4">
            <Button className="w-full h-10 font-bold bg-primary text-white shadow-md">Search</Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-4">
          <div className="space-y-1 flex-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Tracking Numbers
            </label>
            <textarea
              placeholder="Enter Tracking Numbers"
              rows={6}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-slate-300 resize-none"
            />
          </div>
          <Button className="w-full h-10 font-bold bg-primary text-white shadow-md">Search</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Show</span>
              <select className="h-8 border border-slate-200 rounded px-2 text-xs font-bold text-primary">
                <option>50</option>
                <option>100</option>
              </select>
              <span className="text-[11px] font-bold text-slate-500 uppercase">entries</span>
            </div>
            <div className="flex gap-2">
              <button className="h-8 px-4 bg-primary text-white text-[10px] font-bold rounded uppercase hover:bg-primary/90 transition-colors">
                Select All
              </button>
              <button className="h-8 px-4 bg-primary text-white text-[10px] font-bold rounded uppercase hover:bg-primary/90 transition-colors">
                Deselect All
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              <button className="h-8 px-4 bg-green-500 text-white text-[10px] font-bold rounded uppercase flex items-center gap-1.5 hover:bg-green-600 transition-colors">
                <Check size={12} />
                Finalize
              </button>
              <button className="h-8 px-4 bg-primary text-white text-[10px] font-bold rounded uppercase flex items-center gap-1.5 hover:bg-primary/90 transition-colors">
                <Check size={12} />
                Cancel
              </button>
            </div>
            <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Search:</span>
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="h-8 border border-slate-200 rounded px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
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
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </th>
                {ORDER_COLUMNS.map((column) => (
                  <th
                    key={column.label}
                    className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[11px] font-medium text-slate-600">
              {loadingOrders ? (
                <tr>
                  <td
                    colSpan={ORDER_COLUMNS.length + 1}
                    className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest"
                  >
                    Loading orders…
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={ORDER_COLUMNS.length + 1} className="py-20 text-center">
                    <p className="text-slate-300 italic text-sm font-medium">No Data</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.orderId}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                      />
                    </td>
                    {ORDER_COLUMNS.map((column) => (
                      <td
                        key={column.label}
                        className={cn(
                          "p-4 whitespace-nowrap",
                          column.cellClassName
                        )}
                      >
                        {column.render(order)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50/30 border-t border-slate-50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {loadingOrders
              ? "Loading entries…"
              : filteredOrders.length === 0
                ? "Showing 0 to 0 of 0 entries"
                : `Showing 1 to ${filteredOrders.length} of ${orders.length} entries`}
          </p>
        </div>
      </div>
    </div>
  );
}
