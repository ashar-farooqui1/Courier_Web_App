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
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddClientOrderDialog } from "@/components/orders/AddClientOrderDialog";
import { OrderDetailModal } from "@/components/orders/OrderDetailModal";
import { useAuthSession } from "@/hooks/useAuthRole";
import { buildAppAuthHeaders } from "@/lib/api/app-request-context";
import { parseApiErrorMessage } from "@/lib/api/errors";
import { unwrapOrdersList } from "@/lib/api/order";
import { parseContentDispositionFilename } from "@/lib/format";
import type { ClientOrder } from "@/lib/types/order";
import type { MnpTrackingDetail } from "@/lib/types/mnp";
import { applyMnpTrackingStatus, buildMnpStatusMap, isMnpOrder } from "@/lib/orders/mnp-status";
import { ORDER_STATUS_OPTIONS } from "@/lib/orders/order-status-options";
import { ORDER_COLUMNS } from "@/components/orders/order-columns";
import { OrdersPaginationFooter, PageSizeSelect } from "@/components/orders/OrdersPagination";

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
  disabled = false,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "flex items-center gap-2 px-4 py-2.5 rounded bg-primary text-white text-[10px] font-bold uppercase tracking-tight transition-all active:scale-95 shadow-sm hover:bg-primary/90",
      disabled && "opacity-50 cursor-not-allowed hover:bg-primary active:scale-100"
    )}
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
    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative">
      {type === "select" ? (
        <>
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
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={12}
          />
        </>
      ) : (
        <>
          <input
            type={type}
            value={value ?? ""}
            onChange={onChange}
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

export default function ClientOrdersView() {
  const router = useRouter();
  const { token, clientId, role, ready } = useAuthSession();

  const [modalStates, setModalStates] = useState({
    addNew: false,
    pickup: false,
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const emptyOrderFilters = {
    awbId: "",
    customerReference: "",
    dateFrom: "",
    dateTo: "",
    city: "",
    status: "",
  };
  const [filterDraft, setFilterDraft] = useState(emptyOrderFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyOrderFilters);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(() => new Set());
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [generatingAwb, setGeneratingAwb] = useState(false);
  const [creatingLoadsheet, setCreatingLoadsheet] = useState(false);
  const [finalizingOrders, setFinalizingOrders] = useState(false);
  const [retryingDispatch, setRetryingDispatch] = useState(false);

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
        headers: buildAppAuthHeaders(token, role, clientId),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          parseApiErrorMessage(payload, `Failed to load orders (${response.status})`)
        );
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
          // M&P lookup failed — fall back to the backend's dispatch status.
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

  const cityOptions = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((order) => {
      if (order.destinationCity) set.add(order.destinationCity);
      if (order.originCity) set.add(order.originCity);
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
    const referenceQuery = appliedFilters.customerReference.trim().toLowerCase();

    return orders.filter((order) => {
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
          order.destinationCity,
          order.originCity,
          order.warehouse,
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(query)) return false;
      }

      if (awbQuery && !order.awbNo?.toLowerCase().includes(awbQuery)) return false;
      if (referenceQuery && !order.customerReference?.toLowerCase().includes(referenceQuery)) return false;
      if (
        appliedFilters.city &&
        order.destinationCity !== appliedFilters.city &&
        order.originCity !== appliedFilters.city
      )
        return false;
      if (appliedFilters.status && order.status !== appliedFilters.status) return false;
      if (!isWithinDateRange(order.orderDate, appliedFilters.dateFrom, appliedFilters.dateTo)) return false;

      return true;
    });
  }, [orders, tableSearch, appliedFilters]);

  const handleOrderCreated = (message: string) => {
    setSuccessMessage(message);
    loadOrders();
  };

  useEffect(() => {
    setPage(1);
  }, [tableSearch, appliedFilters, orders]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pagedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const matchedOrderIds = useMemo(
    () => filteredOrders.map((order) => order.orderId),
    [filteredOrders]
  );
  const pageOrderIds = useMemo(() => pagedOrders.map((order) => order.orderId), [pagedOrders]);

  const allPageSelected =
    pageOrderIds.length > 0 && pageOrderIds.every((orderId) => selectedOrderIds.has(orderId));
  const somePageSelected = pageOrderIds.some((orderId) => selectedOrderIds.has(orderId));

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
      matchedOrderIds.forEach((orderId) => next.add(orderId));
      return next;
    });
  };

  const handleDeselectAll = () => {
    setSelectedOrderIds(new Set());
  };

  const handleToggleAllVisible = () => {
    if (allPageSelected) {
      setSelectedOrderIds((prev) => {
        const next = new Set(prev);
        pageOrderIds.forEach((orderId) => next.delete(orderId));
        return next;
      });
      return;
    }

    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      pageOrderIds.forEach((orderId) => next.add(orderId));
      return next;
    });
  };

  const handleAwbPrint = async () => {
    if (!token) {
      setActionError("Client session not found. Please log in again.");
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
        headers: buildAppAuthHeaders(token, role, clientId, {
          "Content-Type": "application/json",
        }),
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

  const handleCreateLoadsheet = async () => {
    if (!token) {
      setActionError("Client session not found. Please log in again.");
      return;
    }

    const orderIds = Array.from(selectedOrderIds);
    if (orderIds.length === 0) {
      setActionError("Please select at least one order to create a loadsheet.");
      return;
    }

    setCreatingLoadsheet(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/loadsheets", {
        method: "POST",
        headers: buildAppAuthHeaders(token, role, clientId, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ orderIds }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? `Failed to create loadsheet (${response.status})`);
      }

      setSuccessMessage(payload?.message ?? "Loadsheet created successfully.");
      setSelectedOrderIds(new Set());
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to create loadsheet");
    } finally {
      setCreatingLoadsheet(false);
    }
  };

  const handleRetryDispatch = async () => {
    if (!token) {
      setActionError("Client session not found. Please log in again.");
      return;
    }

    const orderIds = Array.from(selectedOrderIds);
    if (orderIds.length === 0) {
      setActionError("Please select at least one order to retry dispatch.");
      return;
    }

    setRetryingDispatch(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/orders/retry-dispatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderIds }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? `Failed to retry dispatch (${response.status})`);
      }

      setSuccessMessage(
        payload?.message ??
          (orderIds.length === 1
            ? "Order resubmitted for dispatch."
            : `${orderIds.length} orders resubmitted for dispatch.`)
      );
      await loadOrders();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to retry dispatch");
    } finally {
      setRetryingDispatch(false);
    }
  };

  const handleOpenOrderDetail = (orderId: number) => {
    setDetailOrderId(orderId);
    setDetailModalOpen(true);
  };

  const handleFinalizeOrders = async () => {
    if (!token) {
      setActionError("Client session not found. Please log in again.");
      return;
    }

    const orderIds = Array.from(selectedOrderIds);
    if (orderIds.length === 0) {
      setActionError("Please select at least one order to finalize.");
      return;
    }

    setFinalizingOrders(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/orders/update-status", {
        method: "PUT",
        headers: buildAppAuthHeaders(token, role, clientId, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ orderIds, status: "Finalize" }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? `Failed to finalize orders (${response.status})`);
      }

      setSelectedOrderIds(new Set());
      setSuccessMessage(
        payload?.message ??
          (orderIds.length === 1
            ? "Order finalized successfully."
            : `${orderIds.length} orders finalized successfully.`)
      );
      await loadOrders();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to finalize orders");
    } finally {
      setFinalizingOrders(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Order Details</h1>
        <div className="flex flex-wrap gap-2">
          <ActionButton icon={Import} label="Import" onClick={() => router.push("/orders/import")} />
          <ActionButton
            icon={FileText}
            label={creatingLoadsheet ? "Creating…" : "Loadsheet"}
            onClick={handleCreateLoadsheet}
            disabled={creatingLoadsheet || loadingOrders || selectedOrderIds.size === 0}
          />
          <ActionButton
            icon={Printer}
            label={generatingAwb ? "Generating…" : "AWB Print"}
            onClick={handleAwbPrint}
            disabled={generatingAwb || loadingOrders}
          />
          <ActionButton
            icon={RefreshCw}
            label={retryingDispatch ? "Retrying…" : "Retry Dispatch"}
            onClick={handleRetryDispatch}
            disabled={retryingDispatch || loadingOrders || selectedOrderIds.size === 0}
          />
          <ActionButton icon={Plus} label="Add New" onClick={() => toggleModal("addNew", true)} />
          <ActionButton icon={Truck} label="Pickup Request" onClick={() => toggleModal("pickup", true)} />
        </div>
      </div>

      <AddClientOrderDialog
        isOpen={modalStates.addNew}
        onClose={() => toggleModal("addNew", false)}
        onSuccess={handleOrderCreated}
        variant="client"
      />

      {(ordersError || actionError || successMessage) && (
        <div className="space-y-3">
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
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => toggleModal("pickup", false)}
              className="h-11 px-10 w-full sm:w-auto border border-primary text-primary text-[11px] font-bold rounded-lg uppercase hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button className="h-11 px-10 w-full sm:w-auto bg-primary text-white text-[11px] font-bold rounded-lg uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all">
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
          className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <OrderFilter
              label="AWB ID"
              placeholder="Enter AWB ID"
              value={filterDraft.awbId}
              onChange={(e) => updateFilterDraft("awbId", e.target.value)}
            />
            <OrderFilter
              label="Customer Reference"
              placeholder="Enter Customer Reference"
              value={filterDraft.customerReference}
              onChange={(e) => updateFilterDraft("customerReference", e.target.value)}
            />
            <OrderFilter
              label="Date (From)"
              type="date"
              value={filterDraft.dateFrom}
              onChange={(e) => updateFilterDraft("dateFrom", e.target.value)}
            />
            <OrderFilter
              label="Date (To)"
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
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Status
              </label>
              <div className="relative">
                <select
                  value={filterDraft.status}
                  onChange={(e) => updateFilterDraft("status", e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-700 appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  <option value="">Select Status</option>
                  {ORDER_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={12}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
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
            <PageSizeSelect
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAllVisible}
                disabled={matchedOrderIds.length === 0}
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

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleFinalizeOrders}
                disabled={finalizingOrders || loadingOrders || selectedOrderIds.size === 0}
                className="h-8 px-4 bg-green-500 text-white text-[10px] font-bold rounded uppercase flex items-center gap-1.5 hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={12} />
                {finalizingOrders ? "Finalizing…" : "Finalize"}
              </button>
              <button className="h-8 px-4 bg-primary text-white text-[10px] font-bold rounded uppercase flex items-center gap-1.5 hover:bg-primary/90 transition-colors">
                <Check size={12} />
                Cancel
              </button>
            </div>
            <div className="flex items-center gap-2 sm:border-l sm:pl-4 border-slate-200">
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
                    checked={allPageSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = somePageSelected && !allPageSelected;
                      }
                    }}
                    onChange={handleToggleAllVisible}
                    disabled={pageOrderIds.length === 0}
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                    aria-label="Select all orders on this page"
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
                pagedOrders.map((order) => (
                  <tr
                    key={order.orderId}
                    onClick={() => handleOpenOrderDetail(order.orderId)}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
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

        <OrdersPaginationFooter
          page={currentPage}
          pageSize={pageSize}
          totalItems={filteredOrders.length}
          onPageChange={setPage}
        />
      </div>

      <OrderDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        orderId={detailOrderId}
        token={token}
        role={role}
        userId={clientId}
      />
    </div>
  );
}
