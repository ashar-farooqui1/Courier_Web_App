import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatOrderStatusLabel } from "@/lib/orders/order-status-options";
import { resolveAssetUrl } from "@/lib/format";
import type { ClientOrder } from "@/lib/types/order";

export function formatOrderDate(value: string): string {
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

export function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export const ORDER_COLUMNS: {
  label: string;
  render: (order: ClientOrder) => ReactNode;
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
    render: (order) => {
      const status = formatOrderStatusLabel(order.status);
      const isFinalized = order.status?.toLowerCase() === "finalize";
      return (
        <span
          className={cn(
            "inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase",
            isFinalized ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          )}
        >
          {status}
        </span>
      );
    },
  },
  { label: "Rider", render: (order) => order.riderName || "—" },
  { label: "Destination City", render: (order) => order.destinationCity || "—" },
  { label: "Origin City", render: (order) => order.originCity || "—" },
  { label: "Warehouse", render: (order) => order.warehouse || "—" },
  {
    label: "Courier",
    render: (order) => {
      const logoUrl = resolveAssetUrl(order.courierLogoUrl);
      if (!logoUrl) return "—";
      return (
        <img
          src={logoUrl}
          alt={order.courierName || "Courier"}
          title={order.courierName || undefined}
          className="h-10 w-10 rounded object-contain bg-white border border-slate-100"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      );
    },
  },
  { label: "Courier Tracking No", render: (order) => order.courierTrackingNo || "—" },
  { label: "Courier Tracking Status", render: (order) => order.courierTrackingStatus || "—" },
];
