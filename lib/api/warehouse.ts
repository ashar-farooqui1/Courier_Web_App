import { apiGet } from '@/lib/api/http';
import { API_ROUTES } from '@/lib/api/config';
import type { Warehouse, WarehouseApiResponse } from '@/lib/types/warehouse';

function pickString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string') return value;
  }
  return '';
}

function pickNumber(record: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = Number(record[key]);
    if (Number.isFinite(value)) return value;
  }
  return 0;
}

function normalizeWarehouse(raw: unknown): Warehouse | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const warehouseId = pickNumber(record, ['warehouseId', 'WarehouseId', 'id', 'Id']);

  if (!warehouseId) return null;

  return {
    warehouseId,
    name: pickString(record, ['name', 'Name', 'warehouseName', 'WarehouseName']),
    city: pickString(record, ['city', 'City', 'cityName', 'CityName']) || undefined,
    address: pickString(record, ['address', 'Address']) || undefined,
  };
}

function unwrapWarehouses(response: WarehouseApiResponse<unknown[]> | unknown[]): unknown[] {
  if (Array.isArray(response)) return response;
  return Array.isArray(response.data) ? response.data : [];
}

/** GET /api/Warehouse/GetWarehouses */
export async function getAllWarehouses(): Promise<Warehouse[]> {
  const response = await apiGet<WarehouseApiResponse<unknown[]> | unknown[]>(
    API_ROUTES.warehouses
  );
  return unwrapWarehouses(response)
    .map(normalizeWarehouse)
    .filter((warehouse): warehouse is Warehouse => warehouse !== null);
}
