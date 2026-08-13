import { downloadCsv, formatArrivalAt, formatTimeOfDay } from "@/lib/format";
import { formatAmount, formatOrderDate } from "@/components/orders/order-columns";
import type { PickupReportItem } from "@/lib/types/pickup-report";

export const PICKUP_REPORT_EXPORT_HEADERS = [
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
  "Pickup Status Added By",
] as const;

function pickupItemToExportRow(item: PickupReportItem): (string | number)[] {
  return [
    item.trackingId || "",
    item.salesPerson || "",
    item.client || "",
    item.brandName || "",
    item.customerName || "",
    item.customerNumber || "",
    item.customerReference || "",
    item.pickupAddress || "",
    item.deliveryAddress || "",
    item.area || "",
    item.originCity || "",
    item.city || "",
    item.service || "",
    formatAmount(item.amount),
    item.weight,
    formatOrderDate(item.orderDateTime),
    formatOrderDate(item.expDeliveryDate),
    item.pickupDate ? formatArrivalAt(item.pickupDate) : "",
    formatTimeOfDay(item.pickupTime),
    item.pickedUpBy || "",
    item.status || "",
    item.pickedUpStatusAddedBy || "",
  ];
}

/** Builds a .csv file from the given pickup report rows and triggers a browser download. Client-side only. */
export function exportPickupReportToCsv(items: PickupReportItem[], filename = "pickup-report.csv"): void {
  downloadCsv(PICKUP_REPORT_EXPORT_HEADERS, items.map(pickupItemToExportRow), filename);
}
