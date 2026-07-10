export interface Warehouse {
  warehouseId: number;
  name: string;
  city?: string;
  address?: string;
}

export interface WarehouseApiResponse<T = unknown> {
  success?: boolean;
  message?: string | null;
  data?: T;
  details?: unknown;
}
