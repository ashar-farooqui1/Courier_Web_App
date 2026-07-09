"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Import,
  Trash2,
  UserPlus,
  FileBox,
  Scale,
  FileText,
  Printer,
  Plus,
  Archive,
  Truck,
  X,
  AlertCircle,
  RotateCcw,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddClientOrderDialog } from "@/components/orders/AddClientOrderDialog";
import { ORDER_COLUMNS } from "@/components/orders/order-columns";
import { useAuthSession } from "@/hooks/useAuthRole";
import { buildAppAuthHeaders } from "@/lib/api/app-request-context";
import { parseApiErrorMessage } from "@/lib/api/errors";
import { unwrapOrdersList } from "@/lib/api/order";
import { parseContentDispositionFilename } from "@/lib/format";
import { ORDER_STATUS_OPTIONS } from "@/lib/orders/order-status-options";
import type { Client } from "@/lib/types/client";
import type { ClientOrder } from "@/lib/types/order";

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-4xl" }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div className={cn("bg-white rounded-xl shadow-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200", maxWidth)}>
        <div className="bg-primary px-6 py-4 flex items-center justify-between text-white">
          <h3 className="font-bold uppercase tracking-widest text-sm">{title}</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({
  icon: Icon,
  label,
  colorClass = "bg-primary",
  onClick,
  disabled = false,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  colorClass?: string;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "flex items-center gap-2 px-3 py-2 rounded text-white text-[10px] font-bold uppercase tracking-tight transition-all active:scale-95 shadow-sm hover:opacity-90",
      colorClass,
      disabled && "opacity-50 cursor-not-allowed hover:opacity-50 active:scale-100"
    )}
  >
    <Icon size={14} />
    {label}
  </button>
);

const ModalInput = ({ label, placeholder, type = "text", required = false }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {type === "select" ? (
        <div className="relative">
          <select className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer">
            <option value="">{placeholder}</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
        </div>
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
  onChange,
  options,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: string[];
}) => (
  <div className="space-y-1">
    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      {type === "select" ? (
        <select
          value={value ?? ""}
          onChange={onChange}
          className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-700 appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20"
        >
          <option value="">{placeholder}</option>
          {options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={onChange}
          className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-slate-300"
        />
      )}
    </div>
  </div>
);

export default function AdminOrdersView() {
  const { token, ready, role, user } = useAuthSession();

  const [modalStates, setModalStates] = useState({
    import: false,
    delete: false,
    addNew: false,
    trashed: false,
    pickup: false,
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState("");
  const emptyOrderFilters = {
    awbId: "",
    referenceId: "",
    dateTo: "",
    city: "",
    assignDateFrom: "",
    assignDateTo: "",
    rider: "",
    trackingNumbers: "",
    rollcartNumber: "",
  };
  const [filterDraft, setFilterDraft] = useState(emptyOrderFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyOrderFilters);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(() => new Set());
  const [selectedStatus, setSelectedStatus] = useState("");
  const [finalizingOrders, setFinalizingOrders] = useState(false);
  const [generatingAwb, setGeneratingAwb] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const toggleModal = (key: string, val: boolean) => {
    setModalStates((prev) => ({ ...prev, [key]: val }));
  };

  const loadClients = useCallback(async () => {
    setLoadingClients(true);
    setClientsError(null);

    try {
      const response = await fetch("/api/clients");
      const payload = (await response.json().catch(() => null)) as
        | Client[]
        | { message?: string }
        | null;

      if (!response.ok) {
        const message =
          payload && !Array.isArray(payload) ? payload.message : undefined;
        throw new Error(message ?? `Failed to load clients (${response.status})`);
      }

      setClients(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setClients([]);
      setClientsError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoadingClients(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    if (!ready) return;

    if (!token) {
      setOrders([]);
      setOrdersError("Authentication required. Please log in again.");
      setLoadingOrders(false);
      return;
    }

    const clientId = Number(selectedClientId);
    const ordersUrl =
      Number.isInteger(clientId) && clientId > 0
        ? `/api/orders?clientId=${clientId}`
        : "/api/orders";

    setLoadingOrders(true);
    setOrdersError(null);

    try {
      const response = await fetch(ordersUrl, {
        headers: buildAppAuthHeaders(token, role, user?.userId ?? 0),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          parseApiErrorMessage(payload, `Failed to load orders (${response.status})`)
        );
      }

      setOrders(unwrapOrdersList(payload));
    } catch (err) {
      setOrders([]);
      setOrdersError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  }, [ready, role, selectedClientId, token, user?.userId]);

  useEffect(() => {
    if (ready) {
      loadClients();
    }
  }, [ready, loadClients]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const clientLabel = (client: Client) =>
    client.brandName?.trim() ||
    client.clientName?.trim() ||
    client.clientCode ||
    `Client #${client.clientId}`;

  const selectedClient = useMemo(
    () => clients.find((client) => String(client.clientId) === selectedClientId),
    [clients, selectedClientId]
  );

  const cityOptions = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((order) => {
      if (order.destinationCity) set.add(order.destinationCity);
      if (order.originCity) set.add(order.originCity);
    });
    return Array.from(set).sort();
  }, [orders]);

  const riderOptions = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((order) => {
      if (order.riderName) set.add(order.riderName);
    });
    return Array.from(set).sort();
  }, [orders]);

  const updateFilterDraft = (key: keyof typeof emptyOrderFilters, value: string) => {
    setFilterDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setAppliedFilters(filterDraft);
  };

  const handleClearFilters = () => {
    setFilterDraft(emptyOrderFilters);
    setAppliedFilters(emptyOrderFilters);
    setSelectedClientId("");
  };

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
    const awbQuery = appliedFilters.awbId.trim().toLowerCase();
    const trackingQuery = appliedFilters.trackingNumbers.trim().toLowerCase();
    const referenceQuery = appliedFilters.referenceId.trim().toLowerCase();
    const selectedClientName = selectedClient ? clientLabel(selectedClient).trim().toLowerCase() : "";

    return orders.filter((order) => {
      // Safety net: the API's ?clientId= filter isn't always honored by the
      // backend, so also match on client name client-side.
      if (selectedClientName) {
        const orderClientName = order.clientName?.trim().toLowerCase() ?? "";
        if (orderClientName !== selectedClientName && !orderClientName.includes(selectedClientName)) {
          return false;
        }
      }

      if (query) {
        const haystack = [
          order.awbNo,
          order.clientName,
          order.customerName,
          order.customerPhone,
          order.customerReference,
          order.productName,
          order.serviceName,
          order.status,
          order.riderName,
          order.destinationCity,
          order.originCity,
          order.warehouse,
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(query)) return false;
      }

      if (awbQuery && !order.awbNo?.toLowerCase().includes(awbQuery)) return false;
      if (trackingQuery && !order.awbNo?.toLowerCase().includes(trackingQuery)) return false;
      if (referenceQuery && !order.customerReference?.toLowerCase().includes(referenceQuery)) return false;
      if (
        appliedFilters.city &&
        order.destinationCity !== appliedFilters.city &&
        order.originCity !== appliedFilters.city
      )
        return false;
      if (appliedFilters.rider && order.riderName !== appliedFilters.rider) return false;
      if (!isWithinDateRange(order.orderDate, "", appliedFilters.dateTo)) return false;
      if (!isWithinDateRange(order.orderDate, appliedFilters.assignDateFrom, appliedFilters.assignDateTo))
        return false;

      return true;
    });
  }, [orders, tableSearch, appliedFilters, selectedClient]);

  const visibleOrderIds = useMemo(
    () => filteredOrders.map((order) => order.orderId),
    [filteredOrders]
  );

  const allVisibleSelected =
    visibleOrderIds.length > 0 && visibleOrderIds.every((orderId) => selectedOrderIds.has(orderId));
  const someVisibleSelected = visibleOrderIds.some((orderId) => selectedOrderIds.has(orderId));

  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const handleSelectAllVisible = () => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      visibleOrderIds.forEach((orderId) => next.add(orderId));
      return next;
    });
  };

  const handleDeselectAll = () => {
    setSelectedOrderIds(new Set());
  };

  const handleToggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedOrderIds((prev) => {
        const next = new Set(prev);
        visibleOrderIds.forEach((orderId) => next.delete(orderId));
        return next;
      });
      return;
    }

    handleSelectAllVisible();
  };

  const handleFinalizeOrders = async () => {
    if (!token) {
      setActionError("Authentication required. Please log in again.");
      return;
    }

    const orderIds = Array.from(selectedOrderIds);
    if (orderIds.length === 0) {
      setActionError("Please select at least one order to finalize.");
      return;
    }

    if (!selectedStatus) {
      setActionError("Please select a status.");
      return;
    }

    setFinalizingOrders(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/orders/update-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderIds, status: selectedStatus }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? `Failed to update order status (${response.status})`);
      }

      const statusLabel =
        ORDER_STATUS_OPTIONS.find((option) => option.value === selectedStatus)?.label ??
        selectedStatus;

      setSelectedOrderIds(new Set());
      setSuccessMessage(
        payload?.message ??
          (orderIds.length === 1
            ? `Order status updated to "${statusLabel}".`
            : `${orderIds.length} orders updated to "${statusLabel}".`)
      );
      await loadOrders();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to finalize orders");
    } finally {
      setFinalizingOrders(false);
    }
  };

  const handleAwbPrint = async () => {
    if (!token) {
      setActionError("Authentication required. Please log in again.");
      return;
    }

    const orderIds = Array.from(selectedOrderIds);
    if (orderIds.length === 0) {
      setActionError("Please select at least one order to print AWB.");
      return;
    }

    setGeneratingAwb(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/orders/generate-awb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderIds }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? `Failed to generate AWB (${response.status})`);
      }

      const blob = await response.blob();
      const fallbackName =
        orderIds.length === 1 ? `AWB-${orderIds[0]}.pdf` : `AWB-${orderIds.length}-orders.pdf`;
      const filename = parseContentDispositionFilename(
        response.headers.get("Content-Disposition"),
        fallbackName
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setSuccessMessage(
        orderIds.length === 1
          ? "AWB PDF downloaded successfully."
          : `AWB PDF downloaded for ${orderIds.length} orders.`
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to generate AWB");
    } finally {
      setGeneratingAwb(false);
    }
  };

  const handleOrderCreated = (message: string) => {
    setSuccessMessage(message);
    loadOrders();
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Order Details</h1>

        <div className="flex flex-wrap gap-2 justify-end">
          <ActionButton icon={Import} label="Import" onClick={() => toggleModal("import", true)} />
          <ActionButton icon={Trash2} label="Delete" onClick={() => toggleModal("delete", true)} />
          <ActionButton icon={UserPlus} label="Assign Rider" />
          <ActionButton icon={FileBox} label="Rollcart" />
          <ActionButton icon={Scale} label="Re-Weight" />
          <ActionButton icon={FileText} label="Loadsheet" />
          <ActionButton
            icon={Printer}
            label={generatingAwb ? "Generating…" : "AWB Print"}
            onClick={handleAwbPrint}
            disabled={generatingAwb || loadingOrders}
          />
          <ActionButton icon={Plus} label="Add New" onClick={() => toggleModal("addNew", true)} />
          <ActionButton icon={Archive} label="Trashed" onClick={() => toggleModal("trashed", true)} />
          <ActionButton icon={Truck} label="Pickup Request" onClick={() => toggleModal("pickup", true)} />
        </div>
      </div>

      <AddClientOrderDialog
        variant="admin"
        isOpen={modalStates.addNew}
        onClose={() => toggleModal("addNew", false)}
        onSuccess={handleOrderCreated}
      />

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

      {(clientsError || ordersError || actionError) && (
        <div className="space-y-3">
          {clientsError && (
            <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium">
              <span>{clientsError}</span>
              <button
                type="button"
                onClick={loadClients}
                className="shrink-0 h-8 px-4 bg-red-600 text-white text-[10px] font-bold rounded uppercase hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}
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
          {actionError && (
            <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium">
              <span>{actionError}</span>
              <button
                type="button"
                onClick={() => setActionError(null)}
                className="shrink-0 p-1 hover:bg-red-100 rounded-full transition-colors"
                aria-label="Dismiss message"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={modalStates.import} onClose={() => toggleModal("import", false)} title="Order Import" maxWidth="max-w-6xl">
        <div className="flex items-end gap-6 bg-white p-4 rounded-lg">
          <div className="flex-1">
            <ModalInput label="Client" placeholder="Please Select client" type="select" />
          </div>
          <button className="h-11 px-10 bg-primary text-white text-[11px] font-bold rounded-lg uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all">
            Choose Client
          </button>
        </div>
      </Modal>

      <Modal isOpen={modalStates.delete} onClose={() => toggleModal("delete", false)} title="Confirm Delete" maxWidth="max-w-md">
        <div className="text-center space-y-6 py-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-slate-700">Are you sure?</h4>
            <p className="text-sm text-slate-400">Do you really want to delete these orders? This process cannot be undone.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => toggleModal("delete", false)} className="flex-1 h-11 border border-slate-200 text-slate-400 text-xs font-bold rounded-lg uppercase hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button className="flex-1 h-11 bg-red-500 text-white text-xs font-bold rounded-lg uppercase shadow-lg shadow-red-500/20 active:scale-95 transition-all">
              Delete
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modalStates.trashed} onClose={() => toggleModal("trashed", false)} title="Trashed Orders List" maxWidth="max-w-[1400px]">
        <div className="space-y-6">
          <div className="flex items-end gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div className="w-64">
              <ModalInput label="Tracking ID #" placeholder="Tracking ID #" />
            </div>
            <div className="w-64">
              <ModalInput label="Rider" placeholder="Please Select a rider" type="select" />
            </div>
            <button className="h-11 px-10 bg-primary text-white text-[11px] font-bold rounded-lg uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2">
              <RotateCcw size={14} />
              Restore
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Show</span>
                <select className="h-8 border border-slate-200 rounded px-2 text-xs font-bold text-primary">
                  <option>10</option>
                </select>
                <span className="text-[11px] font-bold text-slate-500 uppercase">entries</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="p-4 w-10">
                      <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
                    </th>
                    {["AWB ID", "Client Name", "Customer Name", "Customer Number", "Amount", "Reference ID", "Service", "Weight", "Order Time & Date", "Exp. Delivery Date", "Rider"].map((h) => (
                      <th key={h} className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[10px] font-medium text-slate-600">
                  {[
                    { id: "KHI10936275", client: "Sindhi.Bazar", name: "Ayan ali", number: "03353721798", amount: "2000", ref: "Clothing", service: "Main Cities Service", weight: "0.50 Kg", date: "2025-10-04 18:55", exp: "2025-10-07" },
                    { id: "RWP10935360", client: "Oriza food & Beverages", name: "Squadron Leader Tanveer Hayat", number: "03204156872", amount: "3500", ref: "Oriza Stevia Drops 10 Pack Clear", service: "Main Cities Service", weight: "1.00 Kg", date: "2025-10-04 10:03", exp: "2025-10-07" },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/30">
                      <td className="p-4">
                        <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-primary font-bold">{row.id}</span>
                          <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[8px] font-black uppercase w-fit mt-1">Draft</span>
                        </div>
                      </td>
                      <td className="p-4">{row.client}</td>
                      <td className="p-4">{row.name}</td>
                      <td className="p-4">{row.number}</td>
                      <td className="p-4">{row.amount}</td>
                      <td className="p-4">{row.ref}</td>
                      <td className="p-4">{row.service}</td>
                      <td className="p-4">{row.weight}</td>
                      <td className="p-4">{row.date}</td>
                      <td className="p-4">{row.exp}</td>
                      <td className="p-4"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modalStates.pickup} onClose={() => toggleModal("pickup", false)} title="Send Pickup Request" maxWidth="max-w-4xl">
        <div className="space-y-4">
          <ModalInput label="Client" placeholder="Please Select a client" type="select" />
          <ModalInput label="Pickup Location" placeholder="Pickup Location" type="select" />
          <ModalInput label="Request Title" placeholder="Orders Pickup Request" />
          <ModalInput label="Description" placeholder="Please Pickup Orders From Our warehouse" type="textarea" />
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <button onClick={() => toggleModal("pickup", false)} className="h-11 px-10 border border-primary text-primary text-[11px] font-bold rounded-lg uppercase hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button className="h-11 px-10 bg-primary text-white text-[11px] font-bold rounded-lg uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all">
              Send
            </button>
          </div>
        </div>
      </Modal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <OrderFilter
            label="AWB ID"
            placeholder="Enter AWB ID"
            value={filterDraft.awbId}
            onChange={(e) => updateFilterDraft("awbId", e.target.value)}
          />
          <OrderFilter
            label="Reference ID"
            placeholder="Enter Reference ID"
            value={filterDraft.referenceId}
            onChange={(e) => updateFilterDraft("referenceId", e.target.value)}
          />
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Client Name
            </label>
            <div className="relative">
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                disabled={loadingClients}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-700 appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20"
              >
                <option value="">
                  {loadingClients ? "Loading clients..." : "Select Client"}
                </option>
                {clients.map((client) => (
                  <option key={client.clientId} value={client.clientId}>
                    {clientLabel(client)}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={12}
              />
            </div>
          </div>
          <OrderFilter
            label="Date (To)"
            placeholder=""
            type="date"
            value={filterDraft.dateTo}
            onChange={(e) => updateFilterDraft("dateTo", e.target.value)}
          />
          <OrderFilter
            label="City"
            placeholder="Select City"
            type="select"
            options={cityOptions}
            value={filterDraft.city}
            onChange={(e) => updateFilterDraft("city", e.target.value)}
          />
          <OrderFilter
            label="Assign Date (From)"
            placeholder=""
            type="date"
            value={filterDraft.assignDateFrom}
            onChange={(e) => updateFilterDraft("assignDateFrom", e.target.value)}
          />
          <OrderFilter
            label="Assign Date (To)"
            placeholder=""
            type="date"
            value={filterDraft.assignDateTo}
            onChange={(e) => updateFilterDraft("assignDateTo", e.target.value)}
          />
          <OrderFilter
            label="Rider"
            placeholder="Select Rider"
            type="select"
            options={riderOptions}
            value={filterDraft.rider}
            onChange={(e) => updateFilterDraft("rider", e.target.value)}
          />
          <div className="md:col-span-3 pt-2 flex gap-3">
            <Button type="submit" className="flex-1 h-10 font-bold bg-primary text-white shadow-md">
              Search
            </Button>
            <Button
              type="button"
              onClick={handleClearFilters}
              className="h-10 px-6 font-bold bg-white text-primary border border-primary hover:bg-slate-50 shadow-sm"
            >
              Clear
            </Button>
          </div>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4"
        >
          <OrderFilter
            label="Tracking Numbers"
            placeholder="Enter Tracking Numbers"
            value={filterDraft.trackingNumbers}
            onChange={(e) => updateFilterDraft("trackingNumbers", e.target.value)}
          />
          <OrderFilter
            label="Rollcart Number"
            placeholder="Enter Rollcart Number"
            value={filterDraft.rollcartNumber}
            onChange={(e) => updateFilterDraft("rollcartNumber", e.target.value)}
          />
          <div className="flex gap-3">
            <Button type="submit" className="flex-1 h-10 font-bold bg-primary text-white shadow-md">
              Search
            </Button>
            <Button
              type="button"
              onClick={handleClearFilters}
              className="h-10 px-6 font-bold bg-white text-primary border border-primary hover:bg-slate-50 shadow-sm"
            >
              Clear
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Show</span>
              <select className="h-8 border border-slate-200 rounded px-2 text-xs font-bold text-primary">
                <option>50</option>
              </select>
              <span className="text-[11px] font-bold text-slate-500 uppercase">entries</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAllVisible}
                disabled={visibleOrderIds.length === 0}
                className="h-8 px-4 bg-primary text-white text-[10px] font-bold rounded uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                disabled={selectedOrderIds.size === 0}
                className="h-8 px-4 bg-primary text-white text-[10px] font-bold rounded uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Deselect All
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={handleFinalizeOrders}
                disabled={finalizingOrders || loadingOrders || selectedOrderIds.size === 0 || !selectedStatus}
                className="h-8 px-4 bg-green-500 text-white text-[10px] font-bold rounded uppercase flex items-center gap-1.5 hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={12} />
                {finalizingOrders ? "Finalizing…" : "Finalize"}
              </button>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={finalizingOrders}
                  className="h-8 min-w-[180px] pl-3 pr-8 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-700 appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  <option value="">Select Status</option>
                  {ORDER_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={12}
                />
              </div>
              <button className="h-8 px-4 bg-primary text-white text-[10px] font-bold rounded uppercase">Cancel</button>
            </div>
            <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Search:</span>
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="h-8 border border-slate-200 rounded px-3 text-xs focus:outline-none"
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
                    checked={allVisibleSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = someVisibleSelected && !allVisibleSelected;
                      }
                    }}
                    onChange={handleToggleAllVisible}
                    disabled={visibleOrderIds.length === 0}
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                    aria-label="Select all visible orders"
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
                    <p className="text-slate-300 italic text-sm font-medium">No orders found</p>
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
                        checked={selectedOrderIds.has(order.orderId)}
                        onChange={() => toggleOrderSelection(order.orderId)}
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                        aria-label={`Select order ${order.awbNo || order.orderId}`}
                      />
                    </td>
                    {ORDER_COLUMNS.map((column) => (
                      <td
                        key={column.label}
                        className={cn("p-4 whitespace-nowrap", column.cellClassName)}
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
