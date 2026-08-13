import { formatAmount, formatOrderDate } from "@/components/orders/order-columns";
import { downloadCsv } from "@/lib/format";
import { formatOrderStatusLabel } from "@/lib/orders/order-status-options";
import type { ClientOrder } from "@/lib/types/order";

/** Mirrors ORDER_COLUMNS in components/orders/order-columns.tsx, minus the logo image column. */
export const ORDER_EXPORT_HEADERS = [
  "AWB No",
  "Brand Name",
  "Customer Name",
  "Customer Phone",
  "Amount",
  "Product Name",
  "Customer Reference",
  "Service",
  "Weight",
  "Order Time & Date",
  "Status",
  "Dispatched",
  "Rider",
  "Destination City",
  "Origin City",
  "Warehouse",
  "Courier",
  "Courier Tracking No",
  "Courier Tracking Status",
] as const;

export function orderToExportRow(order: ClientOrder): (string | number)[] {
  return [
    order.awbNo || "",
    order.clientName || "",
    order.customerName || "",
    order.customerPhone || "",
    formatAmount(order.amount),
    order.productName || "",
    order.customerReference || "",
    order.serviceName || "",
    order.weight,
    formatOrderDate(order.orderDate),
    formatOrderStatusLabel(order.status),
    order.dispatchStatus || "",
    order.riderName || "",
    order.destinationCity || "",
    order.originCity || "",
    order.warehouse || "",
    order.courierName || "",
    order.courierTrackingNo || "",
    order.courierTrackingStatus || "",
  ];
}

/** Builds an .xlsx file from the given orders and triggers a browser download. Client-side only. */
export async function exportOrdersToExcel(
  orders: ClientOrder[],
  filename = "orders-export.xlsx"
): Promise<void> {
  const XLSX = await import("xlsx");

  const worksheet = XLSX.utils.aoa_to_sheet([
    [...ORDER_EXPORT_HEADERS],
    ...orders.map(orderToExportRow),
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

  XLSX.writeFile(workbook, filename);
}

/** Builds a .csv file from the given orders and triggers a browser download. Client-side only. */
export function exportOrdersToCsv(orders: ClientOrder[], filename = "orders-export.csv"): void {
  downloadCsv(ORDER_EXPORT_HEADERS, orders.map(orderToExportRow), filename);
}
