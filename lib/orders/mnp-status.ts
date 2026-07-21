import type { ClientOrder } from "@/lib/types/order";
import type { MnpTrackingDetail } from "@/lib/types/mnp";

const MNP_COURIER_NAME = "M&P";

export function isMnpOrder(order: Pick<ClientOrder, "courierName">): boolean {
  return order.courierName.trim().toUpperCase() === MNP_COURIER_NAME;
}

function parseMnpTransactionTime(value: string): number {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

/** Picks the most recent tracking event (by TransactionTime) for a consignment. */
function getLatestMnpStatus(detail: MnpTrackingDetail): string {
  const events = detail.CNTrackingDetail ?? [];
  if (events.length === 0) return "";

  const latest = events.reduce((latestSoFar, event) =>
    parseMnpTransactionTime(event.TransactionTime) >=
    parseMnpTransactionTime(latestSoFar.TransactionTime)
      ? event
      : latestSoFar
  );

  return latest.TrackingStatus?.trim() ?? "";
}

/** Maps M&P ConsignmentNumber -> latest tracking status. */
export function buildMnpStatusMap(details: MnpTrackingDetail[]): Map<string, string> {
  const map = new Map<string, string>();

  for (const detail of details) {
    const consignmentNumber = detail.ConsignmentNumber?.trim();
    if (!consignmentNumber) continue;

    const status = getLatestMnpStatus(detail);
    if (status) map.set(consignmentNumber, status);
  }

  return map;
}

/**
 * Sets `courierTrackingStatus` from the live M&P tracking API for orders booked
 * via the M&P third-party courier. Orders with no third-party courier are left
 * with an empty `courierTrackingStatus` — the backend's dispatchStatus is never
 * used here.
 */
export function applyMnpTrackingStatus(
  orders: ClientOrder[],
  mnpStatusByTrackingNo: Map<string, string>
): ClientOrder[] {
  if (mnpStatusByTrackingNo.size === 0) return orders;

  return orders.map((order) => {
    if (!isMnpOrder(order)) return order;

    const liveStatus = mnpStatusByTrackingNo.get(order.courierTrackingNo.trim());
    if (!liveStatus) return order;

    return { ...order, courierTrackingStatus: liveStatus };
  });
}
