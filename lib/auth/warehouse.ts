const DEFAULT_WAREHOUSE_KEY = "courier_default_warehouse";

export interface DefaultWarehouse {
  warehouseId: number;
  name: string;
}

export function getDefaultWarehouse(): DefaultWarehouse | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(DEFAULT_WAREHOUSE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as DefaultWarehouse;
  } catch {
    return null;
  }
}

export function saveDefaultWarehouse(warehouse: DefaultWarehouse): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEFAULT_WAREHOUSE_KEY, JSON.stringify(warehouse));
}
