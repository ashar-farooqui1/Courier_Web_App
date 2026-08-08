import type { OrderStatusApiValue } from "@/lib/orders/order-status-options";

/** Groups the backend's granular order-status enum into the dashboard's summary buckets. */
export const DASHBOARD_STATUS_BUCKETS: Record<string, OrderStatusApiValue[]> = {
  Booking: ["Draft", "Booked", "Finalize"],
  Picked: ["PickedUp"],
  "In Transit": [
    "ArrivedAtOrigin",
    "OutForDestination",
    "ArrivedAtDestination",
    "RequestForReattempt",
    "Reattempted",
    "TransitLost",
  ],
  "Out for Delivery": ["OutForDelivery"],
  "Shipper Advise": ["HaltAdviceSent"],
  Delivered: ["Delivered"],
  "Return In Transit": ["ReturnConfirm", "ReturnInTransit", "ReturnOutForDelivery", "ReturnReceivedAtOrigin"],
  Returned: ["ParcelReturned"],
  Cancelled: ["Cancelled", "ShipmentLost", "Damage"],
};

export function computeDashboardStatusCounts(orders: { status: string }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const bucket of Object.keys(DASHBOARD_STATUS_BUCKETS)) counts[bucket] = 0;

  orders.forEach((order) => {
    for (const [bucket, statuses] of Object.entries(DASHBOARD_STATUS_BUCKETS)) {
      if ((statuses as string[]).includes(order.status)) {
        counts[bucket] += 1;
        break;
      }
    }
  });

  return counts;
}
