import { API_BASE_URL, API_ROUTES } from '@/lib/api/config';
import { ApiError } from '@/lib/api/http';
import { parseApiErrorMessage } from '@/lib/api/errors';
import { parseContentDispositionFilename } from '@/lib/format';
import type {
  AddOrdersToLoadsheetPayload,
  Loadsheet,
  LoadsheetDetail,
  LoadsheetOrder,
  RemoveOrdersFromLoadsheetPayload,
} from '@/lib/types/loadsheet';

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

function normalizeLoadsheetOrder(raw: unknown): LoadsheetOrder | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const orderId = pickNumber(record, ['orderId', 'OrderId']);
  if (!orderId) return null;

  return {
    orderId,
    awbNo: pickString(record, ['awbNo', 'AwbNo']),
    customerName: pickString(record, ['customerName', 'CustomerName']),
    status: pickString(record, ['status', 'Status']),
    courierTrackingNo: pickString(record, ['courierTrackingNo', 'CourierTrackingNo']),
    destinationCity: pickString(record, ['destinationCity', 'DestinationCity']),
    amount: pickNumber(record, ['amount', 'Amount']),
    weight: pickNumber(record, ['weight', 'Weight']),
    quantity: pickNumber(record, ['quantity', 'Quantity']),
  };
}

function normalizeLoadsheet(raw: unknown): Loadsheet | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const loadsheetId = pickNumber(record, ['loadsheetId', 'LoadsheetId']);
  if (!loadsheetId) return null;

  return {
    loadsheetId,
    clientId: pickNumber(record, ['clientId', 'ClientId']),
    clientName: pickString(record, ['clientName', 'ClientName']),
    totalConsignments: pickNumber(record, ['totalConsignments', 'TotalConsignments']),
    createdAt: pickString(record, ['createdAt', 'CreatedAt']),
  };
}

function unwrapDataEnvelope(payload: unknown, fallbackError: string): unknown {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const success = record.success ?? record.Success;
    if (success === false) {
      throw new ApiError(parseApiErrorMessage(payload, fallbackError), 500, payload);
    }
    return record.data ?? record.Data;
  }
  return payload;
}

export function unwrapLoadsheetsList(payload: unknown): Loadsheet[] {
  const data = unwrapDataEnvelope(payload, 'Failed to fetch loadsheets');
  const rows = Array.isArray(data) ? data : [];
  return rows
    .map(normalizeLoadsheet)
    .filter((loadsheet): loadsheet is Loadsheet => loadsheet !== null);
}

export function unwrapLoadsheetDetail(payload: unknown): LoadsheetDetail | null {
  const data = unwrapDataEnvelope(payload, 'Failed to fetch loadsheet');
  const loadsheet = normalizeLoadsheet(data);
  if (!loadsheet) return null;

  const record = data as Record<string, unknown>;
  const rawOrders = record.orders ?? record.Orders;
  const orders = Array.isArray(rawOrders)
    ? rawOrders
        .map(normalizeLoadsheetOrder)
        .filter((order): order is LoadsheetOrder => order !== null)
    : [];

  return { ...loadsheet, orders };
}

async function fetchLoadsheetsApi(path: string, token?: string): Promise<unknown> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  const text = await response.text();

  if (!response.ok) {
    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : text;
    } catch {
      /* plain text or empty */
    }
    throw new ApiError(
      parseApiErrorMessage(body, `Request failed (${response.status})`),
      response.status,
      body
    );
  }

  return text ? (JSON.parse(text) as unknown) : null;
}

/** GET /api/Order/GetLoadsheets (optional ?clientId=) */
export async function getLoadsheets(token?: string, clientId?: number): Promise<Loadsheet[]> {
  const payload = await fetchLoadsheetsApi(API_ROUTES.loadsheets(clientId), token);
  return unwrapLoadsheetsList(payload);
}

/** GET /api/Order/GetLoadsheet?loadsheetId= */
export async function getLoadsheet(
  loadsheetId: number,
  token?: string
): Promise<LoadsheetDetail | null> {
  const payload = await fetchLoadsheetsApi(API_ROUTES.loadsheetById(loadsheetId), token);
  return unwrapLoadsheetDetail(payload);
}

async function postLoadsheetsApi(
  path: string,
  body: unknown,
  token: string | undefined,
  fallbackError: string,
  fallbackSuccess: string
): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const text = await response.text();
  let payload: unknown = text;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    /* plain text or empty */
  }

  const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const success = record.success ?? record.Success;

  if (!response.ok || success === false) {
    throw new ApiError(parseApiErrorMessage(payload, fallbackError), response.status, payload);
  }

  const message = record.message ?? record.Message;
  return typeof message === 'string' && message ? message : fallbackSuccess;
}

/** POST /api/Order/CreateLoadsheet */
export async function createLoadsheet(orderIds: number[], token?: string): Promise<string> {
  return postLoadsheetsApi(
    API_ROUTES.createLoadsheet,
    { orderIds },
    token,
    'Failed to create loadsheet',
    'Loadsheet created successfully'
  );
}

/** POST /api/Order/AddOrdersToLoadsheet */
export async function addOrdersToLoadsheet(
  payload: AddOrdersToLoadsheetPayload,
  token?: string
): Promise<string> {
  return postLoadsheetsApi(
    API_ROUTES.addOrdersToLoadsheet,
    payload,
    token,
    'Failed to add orders to loadsheet',
    'Orders added to loadsheet'
  );
}

/** POST /api/Order/RemoveOrdersFromLoadsheet */
export async function removeOrdersFromLoadsheet(
  payload: RemoveOrdersFromLoadsheetPayload,
  token?: string
): Promise<string> {
  return postLoadsheetsApi(
    API_ROUTES.removeOrdersFromLoadsheet,
    payload,
    token,
    'Failed to remove orders from loadsheet',
    'Orders removed from loadsheet'
  );
}

/** GET /api/Order/GenerateLoadsheetPdf?loadsheetId= — returns the loadsheet PDF. */
export async function generateLoadsheetPdf(
  loadsheetId: number,
  token?: string
): Promise<{ blob: Blob; filename: string }> {
  const headers: Record<string, string> = { Accept: 'application/pdf' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.generateLoadsheetPdf(loadsheetId)}`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const contentType = response.headers.get('Content-Type') ?? '';
    let body: unknown;

    if (contentType.includes('application/json')) {
      body = await response.json().catch(() => undefined);
    } else {
      body = await response.text().catch(() => undefined);
    }

    throw new ApiError(
      parseApiErrorMessage(body, `Failed to generate loadsheet PDF (${response.status})`),
      response.status,
      body
    );
  }

  const blob = await response.blob();
  return {
    blob,
    filename: parseContentDispositionFilename(
      response.headers.get('Content-Disposition'),
      `Loadsheet_${loadsheetId}.pdf`
    ),
  };
}
