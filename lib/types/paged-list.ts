export interface PagedList<T> {
  pageNum: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: T[];
}

export const DEFAULT_ORDERS_PAGE_SIZE = 10;
export const DEFAULT_CLIENTS_PAGE_SIZE = 20;
export const LOOKUP_PAGE_SIZE = 500;

export function paginateItems<T>(
  items: T[],
  pageNum = 1,
  pageSize = 10
): PagedList<T> {
  const safePage = Math.max(1, pageNum);
  const safeSize = Math.max(1, pageSize);
  const totalCount = items.length;
  const totalPages = Math.ceil(totalCount / safeSize) || 0;
  const start = (safePage - 1) * safeSize;
  return {
    pageNum: safePage,
    pageSize: safeSize,
    totalCount,
    totalPages,
    items: items.slice(start, start + safeSize),
  };
}

export function emptyPagedList<T>(pageNum = 1, pageSize = 10): PagedList<T> {
  return { pageNum, pageSize, totalCount: 0, totalPages: 0, items: [] };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readPositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function readRows(source: unknown): unknown[] | null {
  if (Array.isArray(source)) return source;
  const record = asRecord(source);
  if (!record) return null;
  const items = record.items ?? record.Items;
  return Array.isArray(items) ? items : null;
}

export function unwrapPagedPayload<T>(
  payload: unknown,
  mapItem: (raw: unknown) => T | null
): PagedList<T> {
  if (!payload) return emptyPagedList<T>();

  if (Array.isArray(payload)) {
    const items = payload.map(mapItem).filter((item): item is T => item !== null);
    return {
      pageNum: 1,
      pageSize: items.length || 10,
      totalCount: items.length,
      totalPages: items.length > 0 ? 1 : 0,
      items,
    };
  }

  const root = asRecord(payload);
  if (!root) return emptyPagedList<T>();

  const success = root.success ?? root.Success;
  if (success === false) {
    throw new Error(typeof root.message === "string" ? root.message : "Request failed");
  }

  const data = root.data ?? root.Data ?? root;
  const rows = readRows(data) ?? readRows(root) ?? [];
  const pageSource = asRecord(data) ?? root;
  const items = rows.map(mapItem).filter((item): item is T => item !== null);
  const pageNum = readPositiveInt(pageSource.pageNum ?? pageSource.PageNum ?? root.pageNum, 1);
  const pageSize = readPositiveInt(
    pageSource.pageSize ?? pageSource.PageSize ?? root.pageSize,
    items.length || 10
  );
  const totalCount = readPositiveInt(
    pageSource.totalCount ?? pageSource.TotalCount ?? root.totalCount,
    items.length
  );
  const totalPages = readPositiveInt(
    pageSource.totalPages ?? pageSource.TotalPages ?? root.totalPages,
    Math.ceil(totalCount / pageSize) || 0
  );

  return { pageNum, pageSize, totalCount, totalPages, items };
}

export function buildPagedAdminQuery(options: {
  adminId?: number | null;
  pageNum?: number;
  pageSize?: number;
  extra?: Record<string, string | number | undefined>;
}): string {
  const params = new URLSearchParams();

  if (Number.isInteger(options.adminId) && (options.adminId as number) > 0) {
    params.set("adminId", String(options.adminId));
  }

  params.set("pageNum", String(Math.max(1, options.pageNum ?? 1)));
  params.set("pageSize", String(Math.max(1, options.pageSize ?? 10)));

  if (options.extra) {
    for (const [key, value] of Object.entries(options.extra)) {
      if (value === undefined || value === "") continue;
      params.set(key, String(value));
    }
  }

  return params.toString();
}
