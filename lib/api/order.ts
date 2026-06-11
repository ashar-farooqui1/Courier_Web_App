import { API_BASE_URL, API_ROUTES } from '@/lib/api/config';
import { ApiError } from '@/lib/api/http';
import { parseApiErrorMessage } from '@/lib/api/errors';
import { parseContentDispositionFilename } from '@/lib/format';
import type {
  BulkUploadApiResponse,
  BulkUploadShipmentPreview,
  BulkUploadStats,
  ClientOrder,
  CreateOrderApiResponse,
  CreateOrderPayload,
  OrderPickupLocationDetails,
} from '@/lib/types/order';

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

export function normalizeOrderPickupLocationDetails(
  raw: unknown
): OrderPickupLocationDetails | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const pickupLocationId = pickNumber(record, ['pickupLocationId', 'PickupLocationId']);

  if (!pickupLocationId) return null;

  return {
    pickupLocationId,
    pickupLocationName: pickString(record, ['pickupLocationName', 'PickupLocationName']),
    originAddress: pickString(record, ['originAddress', 'OriginAddress']),
    originArea: pickString(record, ['originArea', 'OriginArea']),
    originCityId: pickNumber(record, ['originCityId', 'OriginCityId']),
    originCity: pickString(record, ['originCity', 'OriginCity']),
    serviceId: pickNumber(record, ['serviceId', 'ServiceId']),
    serviceName: pickString(record, ['serviceName', 'ServiceName']),
  };
}

/** GET /api/Order/GetOrderPickupLocation?pickupLocationId={id} */
export async function getOrderPickupLocation(
  pickupLocationId: number
): Promise<OrderPickupLocationDetails> {
  const response = await fetch(
    `${API_BASE_URL}${API_ROUTES.orderPickupLocation(pickupLocationId)}`,
    {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    }
  );

  const text = await response.text();

  if (!response.ok) {
    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : text;
    } catch {
      /* plain text or empty */
    }
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to fetch order pickup location (${response.status})`),
      response.status,
      body
    );
  }

  if (!text) {
    throw new ApiError('Pickup location details were empty', response.status);
  }

  try {
    const data = JSON.parse(text) as unknown;
    const details = normalizeOrderPickupLocationDetails(data);
    if (!details) {
      throw new ApiError('Invalid pickup location details response', response.status, data);
    }
    return details;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to parse pickup location details', response.status, text);
  }
}

async function parseCreateOrderResponse(
  response: Response,
  fallbackError: string
): Promise<string> {
  const text = await response.text();

  if (!response.ok) {
    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : text;
    } catch {
      /* plain text or empty */
    }
    throw new ApiError(
      parseApiErrorMessage(body, `${fallbackError} (${response.status})`),
      response.status,
      body
    );
  }

  if (!text) return 'Order created successfully';

  try {
    const payload = JSON.parse(text) as CreateOrderApiResponse;
    if (payload.success === false) {
      throw new ApiError(
        parseApiErrorMessage(payload, fallbackError),
        response.status,
        payload
      );
    }
    return payload.message ?? 'Order created successfully';
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (text === 'true') return 'Order created successfully';
    return text || 'Order created successfully';
  }
}

/** POST /api/Order/CreateOrder */
export async function createOrder(
  payload: CreateOrderPayload,
  token?: string
): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.createOrder}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  return parseCreateOrderResponse(response, 'Failed to create order');
}

export function normalizeClientOrder(raw: unknown): ClientOrder | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const orderId = pickNumber(record, ['orderId', 'OrderId']);

  if (!orderId) return null;

  return {
    orderId,
    awbNo: pickString(record, ['awbNo', 'AwbNo', 'awbNumber', 'AwbNumber']),
    clientName: pickString(record, ['clientName', 'ClientName']),
    customerName: pickString(record, ['customerName', 'CustomerName']),
    customerPhone: pickString(record, ['customerPhone', 'CustomerPhone']),
    amount: pickNumber(record, ['amount', 'Amount']),
    productName: pickString(record, ['productName', 'ProductName']),
    customerReference: pickString(record, ['customerReference', 'CustomerReference']),
    serviceName: pickString(record, ['serviceName', 'ServiceName']),
    weight: pickNumber(record, ['weight', 'Weight']),
    orderDate: pickString(record, ['orderDate', 'OrderDate']),
    status: pickString(record, ['status', 'Status']),
    riderName: pickString(record, ['riderName', 'RiderName']),
    destinationCity: pickString(record, ['destinationCity', 'DestinationCity']),
    originCity: pickString(record, ['originCity', 'OriginCity']),
    warehouse: pickString(record, ['warehouse', 'Warehouse']),
  };
}

/** GET /api/Order/GetOrdersByClient?clientId={clientId} */
export async function getOrdersByClient(
  clientId: number,
  token?: string
): Promise<ClientOrder[]> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.ordersByClient(clientId)}`, {
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
      parseApiErrorMessage(body, `Failed to fetch orders (${response.status})`),
      response.status,
      body
    );
  }

  if (!text) return [];

  try {
    const data = JSON.parse(text) as unknown;
    if (!Array.isArray(data)) return [];
    return data
      .map(normalizeClientOrder)
      .filter((order): order is ClientOrder => order !== null);
  } catch {
    return [];
  }
}

function pickValue(record: Record<string, unknown>, keys: string[]): string | number {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return '';
}

export function normalizeBulkUploadShipment(raw: unknown): BulkUploadShipmentPreview | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const consigneeName = pickString(record, [
    'consigneeName',
    'ConsigneeName',
    'customerName',
    'CustomerName',
  ]);

  if (!consigneeName) return null;

  return {
    consigneeName,
    consigneeContactNo: pickString(record, [
      'consigneeContactNo',
      'ConsigneeContactNo',
      'customerPhone',
      'CustomerPhone',
    ]),
    deliveryAddress: pickString(record, ['deliveryAddress', 'DeliveryAddress']),
    customerReference: pickString(record, ['customerReference', 'CustomerReference']),
    productName: pickString(record, ['productName', 'ProductName']),
    destination: pickString(record, ['destination', 'Destination', 'destinationCity', 'DestinationCity']),
    quantity: pickValue(record, ['quantity', 'Quantity']),
    weight: pickValue(record, ['weight', 'Weight']),
    amount: pickValue(record, ['amount', 'Amount']),
    service: pickString(record, ['service', 'Service', 'serviceName', 'ServiceName']),
    replacementId: pickString(record, ['replacementId', 'ReplacementId', 'replacementID', 'ReplacementID']),
  };
}

function extractBulkUploadShipments(data: unknown): BulkUploadShipmentPreview[] {
  if (!data) return [];
  if (!Array.isArray(data)) return [];

  return data
    .map(normalizeBulkUploadShipment)
    .filter((row): row is BulkUploadShipmentPreview => row !== null);
}

function parseBulkUploadStats(data: unknown): BulkUploadStats | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;

  const record = data as Record<string, unknown>;
  return {
    totalRows: Number(record.totalRows) || 0,
    successRows: Number(record.successRows) || 0,
    failedRows: Number(record.failedRows) || 0,
    errors: Array.isArray(record.errors)
      ? record.errors.filter((entry): entry is string => typeof entry === 'string')
      : [],
  };
}

function formatBulkUploadStatsMessage(stats: BulkUploadStats): string {
  if (stats.errors.length > 0) {
    return stats.errors.join(' ');
  }
  if (stats.failedRows > 0) {
    return `${stats.failedRows} row(s) failed to import.`;
  }
  return 'Bulk upload failed. Please check your file and try again.';
}

function assertBulkUploadSucceeded(payload: BulkUploadApiResponse): BulkUploadStats | null {
  const stats = parseBulkUploadStats(payload.data);
  if (!stats) return null;

  if (stats.totalRows === 0) {
    throw new ApiError(
      'No order rows found in the file. Check the template and try again.',
      400,
      payload
    );
  }

  if (stats.successRows === 0) {
    throw new ApiError(formatBulkUploadStatsMessage(stats), 400, payload);
  }

  if (stats.failedRows > 0) {
    throw new ApiError(
      `${stats.successRows} of ${stats.totalRows} orders imported. ${formatBulkUploadStatsMessage(stats)}`,
      400,
      payload
    );
  }

  return stats;
}

function formatBulkUploadErrorMessage(payload: BulkUploadApiResponse): string {
  const { message } = payload;
  if (typeof message === 'string' && message && !message.includes('System.Collections')) {
    return message;
  }
  if (Array.isArray(message)) {
    return message.join(', ');
  }
  return 'Bulk upload failed. Please check your file and try again.';
}

export interface BulkUploadResult {
  message: string;
  shipments: BulkUploadShipmentPreview[];
}

/** POST /api/Order/BulkUpload (multipart: ClientId, file) */
export async function bulkUploadOrders(
  clientId: number,
  file: Blob,
  fileName: string,
  token: string
): Promise<BulkUploadResult> {
  const formData = new FormData();
  formData.append('ClientId', String(clientId));
  formData.append('file', file, fileName);

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.bulkUploadOrders}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
    cache: 'no-store',
  });

  const text = await response.text();
  let payload: BulkUploadApiResponse = {};

  try {
    payload = text ? (JSON.parse(text) as BulkUploadApiResponse) : {};
  } catch {
    if (!response.ok) {
      throw new ApiError(text || 'Bulk upload failed', response.status, text);
    }
    return { message: text || 'File uploaded successfully', shipments: [] };
  }

  if (!response.ok || payload.success === false) {
    throw new ApiError(formatBulkUploadErrorMessage(payload), response.status, payload);
  }

  const stats = assertBulkUploadSucceeded(payload);
  const shipments = extractBulkUploadShipments(payload.data);
  const successMessage =
    stats && stats.successRows > 0
      ? `${stats.successRows} order(s) imported successfully.`
      : (payload.message ?? 'Shipments added successfully');

  return {
    message: successMessage,
    shipments,
  };
}

/** POST /api/Order/generate-awb — returns AWB PDF for the given order IDs. */
export async function generateOrderAwb(
  orderIds: number[],
  token?: string
): Promise<{ blob: Blob; filename: string }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/pdf',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.generateAwb}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ orderIds }),
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
      parseApiErrorMessage(body, `Failed to generate AWB (${response.status})`),
      response.status,
      body
    );
  }

  const blob = await response.blob();
  const fallbackName =
    orderIds.length === 1 ? `AWB-${orderIds[0]}.pdf` : `AWB-${orderIds.length}-orders.pdf`;

  return {
    blob,
    filename: parseContentDispositionFilename(
      response.headers.get('Content-Disposition'),
      fallbackName
    ),
  };
}
