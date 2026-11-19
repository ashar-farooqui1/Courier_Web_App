import type { ClientOrder } from '@/lib/types/order';
import {
  isOrderStatusApiValue,
  normalizeOrderStatusValue,
  type OrderStatusApiValue,
} from '@/lib/orders/order-status-options';

/** Search-panel filters on the admin Orders tab, applied across all pages in the BFF. */
export interface OrderListFilters {
  clientId: number;
  clientNames: string[];
  awbId: string;
  referenceId: string;
  trackingNumbers: string[];
  city: string;
  rider: string;
  status: OrderStatusApiValue[];
  dateTo: string;
  assignDateFrom: string;
  assignDateTo: string;
}

export function parseTrackingNumbers(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
}

function parseClientNames(raw: string): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const token of raw.split('|')) {
    const name = token.trim().toLowerCase();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }
  return names;
}

function readPositiveInt(value: string | null): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

export function readOrderListFilters(params: URLSearchParams): OrderListFilters {
  const read = (key: string) => params.get(key)?.trim() ?? '';
  return {
    clientId: readPositiveInt(params.get('clientId')),
    clientNames: parseClientNames(read('clientNames')),
    awbId: read('awbId'),
    referenceId: read('referenceId'),
    trackingNumbers: parseTrackingNumbers(read('trackingNumbers')),
    city: read('city'),
    rider: read('rider'),
    status: read('status')
      .split(',')
      .map((s) => s.trim())
      .filter(isOrderStatusApiValue),
    dateTo: read('dateTo'),
    assignDateFrom: read('assignDateFrom'),
    assignDateTo: read('assignDateTo'),
  };
}

export function hasOrderListFilters(filters: OrderListFilters): boolean {
  return Boolean(
    filters.clientId ||
      filters.clientNames.length > 0 ||
      filters.awbId ||
      filters.referenceId ||
      filters.trackingNumbers.length > 0 ||
      filters.city ||
      filters.rider ||
      filters.status.length > 0 ||
      filters.dateTo ||
      filters.assignDateFrom ||
      filters.assignDateTo
  );
}

function isWithinDateRange(orderDate: string, from: string, to: string): boolean {
  if (!from && !to) return true;
  const parsed = new Date(orderDate);
  if (Number.isNaN(parsed.getTime())) return false;
  const day = parsed.toISOString().slice(0, 10);
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}

function orderMatchesClient(order: ClientOrder, filters: OrderListFilters): boolean {
  if (!filters.clientId && filters.clientNames.length === 0) return true;

  if (order.clientId > 0 && filters.clientId > 0) {
    return order.clientId === filters.clientId;
  }

  if (filters.clientNames.length === 0) return true;

  const orderName = order.clientName?.trim().toLowerCase() ?? '';
  if (!orderName) return false;

  return filters.clientNames.some(
    (name) => orderName === name || orderName.includes(name) || name.includes(orderName)
  );
}

export function orderMatchesFilters(order: ClientOrder, filters: OrderListFilters): boolean {
  const awbNo = order.awbNo?.trim().toLowerCase() ?? '';
  const awbQuery = filters.awbId.toLowerCase();
  const referenceQuery = filters.referenceId.toLowerCase();

  if (!orderMatchesClient(order, filters)) return false;
  if (awbQuery && !awbNo.includes(awbQuery)) return false;
  if (filters.trackingNumbers.length > 0 && !filters.trackingNumbers.includes(awbNo)) return false;
  if (referenceQuery && !order.customerReference?.toLowerCase().includes(referenceQuery)) return false;
  if (filters.city && order.destinationCity !== filters.city && order.originCity !== filters.city) {
    return false;
  }
  if (filters.rider && order.riderName !== filters.rider) return false;
  if (filters.status.length > 0) {
    const normalizedStatus = normalizeOrderStatusValue(order.status);
    if (!normalizedStatus || !filters.status.includes(normalizedStatus)) return false;
  }
  if (!isWithinDateRange(order.orderDate, '', filters.dateTo)) return false;
  if (!isWithinDateRange(order.orderDate, filters.assignDateFrom, filters.assignDateTo)) return false;
  return true;
}

export function filterOrders(orders: ClientOrder[], filters: OrderListFilters): ClientOrder[] {
  if (!hasOrderListFilters(filters)) return orders;
  return orders.filter((order) => orderMatchesFilters(order, filters));
}
