import type { ClientOrder } from '@/lib/types/order';

/** Client-side fallback when GetOrdersByClient has no `search` param. */
export function orderMatchesSearch(order: ClientOrder, search: string): boolean {
  const term = search.trim().toLowerCase();
  if (!term) return true;

  const haystack = [
    order.awbNo,
    order.clientName,
    order.customerName,
    order.customerPhone,
    order.productName,
    order.customerReference,
    order.serviceName,
    order.status,
    order.destinationCity,
    order.originCity,
    order.warehouse,
    order.warehouseLabel,
    order.courierTrackingNo,
    order.courierName,
    order.dispatchStatus,
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(term);
}

export function filterOrdersBySearch(orders: ClientOrder[], search: string): ClientOrder[] {
  const term = search.trim();
  if (!term) return orders;
  return orders.filter((order) => orderMatchesSearch(order, term));
}
