import { API_BASE_URL, API_ROUTES } from '@/lib/api/config';
import { ApiError } from '@/lib/api/http';
import { parseApiErrorMessage } from '@/lib/api/errors';
import { parseContentDispositionFilename } from '@/lib/format';
import type {
  AddOrderRemarkPayload,
  BulkUploadApiResponse,
  BulkUploadShipmentPreview,
  BulkUploadStats,
  ClientOrder,
  CreateOrderApiResponse,
  CreateOrderPayload,
  OrderDetail,
  OrderDetailHistoryEvent,
  OrderDetailHistoryGroup,
  OrderDetailRecipient,
  OrderDetailRemark,
  OrderDetailSender,
  CreateDeliverySheetPayload,
  CreateReturnDocumentPayload,
  OrderPickupLocationDetails,
  RemoveOrderFromDeliverySheetPayload,
  ReweightArrivalPayload,
  ReweightArrivalResult,
  UpdateOrderStatusApiResponse,
  UpdateOrderStatusPayload,
} from '@/lib/types/order';
import type {
  DeliverySheetDebriefingData,
  DeliverySheetDebriefingResponse,
  UpdateOrderDeliveryStatusPayload,
} from '@/lib/types/debriefing';
import type {
  DeliverySheetListData,
  DeliverySheetListResponse,
  DeliverySheetViewData,
  DeliverySheetViewResponse,
} from '@/lib/types/delivery-sheet';
import type {
  RemoveOrderFromReturnDocumentPayload,
  ReturnDocumentListData,
  ReturnDocumentListResponse,
  ReturnDocumentViewData,
  ReturnDocumentViewResponse,
  UpdateReturnDocumentStatusPayload,
} from '@/lib/types/return-document';
import type { GetPickupReportParams, PickupReportData } from '@/lib/types/pickup-report';
import type {
  ShipperAdviceListData,
  ShipperAdviceListResponse,
  SubmitShipperAdviceRequestPayload,
} from '@/lib/types/shipper-advice';

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
    const parsed = JSON.parse(text) as unknown;
    const raw =
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      'data' in parsed &&
      (parsed as { data?: unknown }).data &&
      typeof (parsed as { data?: unknown }).data === 'object'
        ? (parsed as { data: unknown }).data
        : parsed;
    const details = normalizeOrderPickupLocationDetails(raw);
    if (!details) {
      throw new ApiError('Invalid pickup location details response', response.status, parsed);
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
    const payload = JSON.parse(text) as CreateOrderApiResponse & {
      Success?: boolean;
      Message?: string | null;
    };

    const apiSuccess = payload.success ?? payload.Success;
    if (apiSuccess === false) {
      throw new ApiError(
        parseApiErrorMessage(payload, fallbackError),
        response.status,
        payload
      );
    }

    if (typeof payload.message === 'string' && payload.message) {
      return payload.message;
    }

    if (typeof payload.Message === 'string' && payload.Message) {
      return payload.Message;
    }

    return 'Order created successfully';
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
    warehouseLabel: pickString(record, ['warehouseLabel', 'WarehouseLabel']),
    courierId: pickNumber(record, ['courierId', 'CourierId']),
    courierTrackingNo: pickString(record, ['courierTrackingNo', 'CourierTrackingNo']),
    courierName: pickString(record, ['courierName', 'CourierName']),
    courierLogoUrl: pickString(record, ['courierLogoUrl', 'CourierLogoUrl']),
    dispatchStatus: pickString(record, ['dispatchStatus', 'DispatchStatus']),
    courierTrackingStatus: '',
  };
}

export function unwrapOrdersList(payload: unknown): ClientOrder[] {
  if (!payload) return [];

  let rows: unknown[] = [];

  if (Array.isArray(payload)) {
    rows = payload;
  } else if (typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const success = record.success ?? record.Success;
    if (success === false) {
      throw new ApiError(
        parseApiErrorMessage(payload, 'Failed to fetch orders'),
        500,
        payload
      );
    }

    const data = record.data ?? record.Data;
    if (Array.isArray(data)) {
      rows = data;
    }
  }

  return rows
    .map(normalizeClientOrder)
    .filter((order): order is ClientOrder => order !== null);
}

async function fetchOrdersFromApi(path: string, token?: string): Promise<ClientOrder[]> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

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
      parseApiErrorMessage(body, `Failed to fetch orders (${response.status})`),
      response.status,
      body
    );
  }

  if (!text) return [];

  try {
    return unwrapOrdersList(JSON.parse(text) as unknown);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    return [];
  }
}

/** GET /api/Order/GetOrders — all orders (admin view, no client filter) */
export async function getOrders(token?: string): Promise<ClientOrder[]> {
  return fetchOrdersFromApi(API_ROUTES.orders, token);
}

/** GET /api/Order/GetOrdersByClient?clientId={clientId} — client's own orders */
export async function getOrdersByClient(
  clientId: number,
  token?: string
): Promise<ClientOrder[]> {
  return fetchOrdersFromApi(API_ROUTES.ordersForClient(clientId), token);
}

/** GET /api/Order/GetOrdersNotInLoadsheet?clientId={clientId} — orders available to add to a loadsheet */
export async function getOrdersNotInLoadsheet(
  clientId: number,
  token?: string
): Promise<ClientOrder[]> {
  return fetchOrdersFromApi(API_ROUTES.ordersNotInLoadsheet(clientId), token);
}

function normalizeOrderDetailSender(raw: unknown): OrderDetailSender {
  const record = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    name: pickString(record, ['name', 'Name']),
    phone: pickString(record, ['phone', 'Phone']),
    email: pickString(record, ['email', 'Email']),
    address: pickString(record, ['address', 'Address']),
    area: pickString(record, ['area', 'Area']),
    pickupScheduledAt: pickString(record, ['pickupScheduledAt', 'PickupScheduledAt']),
  };
}

function normalizeOrderDetailRecipient(raw: unknown): OrderDetailRecipient {
  const record = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    name: pickString(record, ['name', 'Name']),
    phone: pickString(record, ['phone', 'Phone']),
    address: pickString(record, ['address', 'Address']),
    area: pickString(record, ['area', 'Area']),
    deliveredAt: pickString(record, ['deliveredAt', 'DeliveredAt']),
  };
}

function normalizeOrderDetailHistoryEvent(raw: unknown): OrderDetailHistoryEvent | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  return {
    time: pickString(record, ['time', 'Time']),
    description: pickString(record, ['description', 'Description']),
    changedByName: pickString(record, ['changedByName', 'ChangedByName']),
    changedByEmail: pickString(record, ['changedByEmail', 'ChangedByEmail']),
    changedByRole: pickString(record, ['changedByRole', 'ChangedByRole']),
  };
}

/**
 * Field names are a best-effort guess (the backend hasn't shared a filled-in sample yet) —
 * covers the likely PascalCase/camelCase variants alongside the AddOrderRemark request field names.
 */
function normalizeOrderDetailRemark(raw: unknown): OrderDetailRemark | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const remark = pickString(record, ['remark', 'Remark', 'remarkText', 'RemarkText', 'text', 'Text']);

  if (!remark) return null;

  return {
    remarkId: pickNumber(record, ['remarkId', 'RemarkId', 'id', 'Id']),
    remark,
    remarkByName: pickString(record, [
      'remarkByName',
      'RemarkByName',
      'remarkBy',
      'RemarkBy',
      'changedByName',
      'ChangedByName',
      'userName',
      'UserName',
      'createdByName',
      'CreatedByName',
    ]),
    remarkByRoleName: pickString(record, [
      'remarkByRoleName',
      'RemarkByRoleName',
      'roleName',
      'RoleName',
      'changedByRole',
      'ChangedByRole',
    ]),
    remarkDate: pickString(record, [
      'remarkDate',
      'RemarkDate',
      'createdAt',
      'CreatedAt',
      'remarkAt',
      'RemarkAt',
      'date',
      'Date',
      'time',
      'Time',
    ]),
  };
}

function normalizeOrderDetailHistoryGroup(raw: unknown): OrderDetailHistoryGroup | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const events = Array.isArray(record.events ?? record.Events)
    ? ((record.events ?? record.Events) as unknown[])
        .map(normalizeOrderDetailHistoryEvent)
        .filter((event): event is OrderDetailHistoryEvent => event !== null)
    : [];

  return {
    dateLabel: pickString(record, ['dateLabel', 'DateLabel']),
    events,
  };
}

export function normalizeOrderDetail(raw: unknown): OrderDetail | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const orderId = pickNumber(record, ['orderId', 'OrderId']);

  if (!orderId) return null;

  const history = Array.isArray(record.history ?? record.History)
    ? ((record.history ?? record.History) as unknown[])
        .map(normalizeOrderDetailHistoryGroup)
        .filter((group): group is OrderDetailHistoryGroup => group !== null)
    : [];

  const remarks = Array.isArray(record.remarks ?? record.Remarks)
    ? ((record.remarks ?? record.Remarks) as unknown[])
        .map(normalizeOrderDetailRemark)
        .filter((remark): remark is OrderDetailRemark => remark !== null)
    : [];

  return {
    orderId,
    awbNo: pickString(record, ['awbNo', 'AwbNo']),
    clientName: pickString(record, ['clientName', 'ClientName']),
    amount: pickNumber(record, ['amount', 'Amount']),
    status: pickString(record, ['status', 'Status']),
    quantity: pickNumber(record, ['quantity', 'Quantity']),
    weight: pickNumber(record, ['weight', 'Weight']),
    serviceName: pickString(record, ['serviceName', 'ServiceName']),
    sender: normalizeOrderDetailSender(record.sender ?? record.Sender),
    recipient: normalizeOrderDetailRecipient(record.recipient ?? record.Recipient),
    history,
    remarks,
  };
}

/** GET /api/Order/GetOrderById?orderId={id} */
export async function getOrderById(orderId: number, token?: string): Promise<OrderDetail> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.orderById(orderId)}`, {
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
      parseApiErrorMessage(body, `Failed to fetch order (${response.status})`),
      response.status,
      body
    );
  }

  if (!text) {
    throw new ApiError('Order details were empty', response.status);
  }

  const parsed = JSON.parse(text) as unknown;
  const record = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};

  if (record.success === false) {
    throw new ApiError(parseApiErrorMessage(parsed, 'Failed to fetch order'), response.status, parsed);
  }

  const raw = 'data' in record ? record.data : parsed;
  const detail = normalizeOrderDetail(raw);

  if (!detail) {
    throw new ApiError('Invalid order details response', response.status, parsed);
  }

  return detail;
}

/** PUT /api/Order/UpdateOrderStatus */
export async function updateOrderStatus(
  payload: UpdateOrderStatusPayload,
  token?: string
): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.updateOrderStatus}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  return parseUpdateOrderStatusResponse(response, 'Failed to update order status');
}

async function parseUpdateOrderStatusResponse(
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

  if (!text) return 'Order status updated successfully';

  try {
    const payload = JSON.parse(text) as UpdateOrderStatusApiResponse;

    if (payload.success === false) {
      throw new ApiError(
        parseApiErrorMessage(payload, fallbackError),
        response.status,
        payload
      );
    }

    if (payload.data === false) {
      throw new ApiError('Order status was not updated', response.status, payload);
    }

    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message;
    }

    return 'Order status updated successfully';
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (text === 'true') return 'Order status updated successfully';
    return text || 'Order status updated successfully';
  }
}

/** POST /api/Order/AddOrderRemark */
export async function addOrderRemark(
  payload: AddOrderRemarkPayload,
  token?: string
): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.addOrderRemark}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
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
      parseApiErrorMessage(body, `Failed to add remark (${response.status})`),
      response.status,
      body
    );
  }

  if (!text) return 'Remark added successfully';

  try {
    const parsed = JSON.parse(text) as { success?: boolean; message?: string };
    if (parsed.success === false) {
      throw new ApiError(parseApiErrorMessage(parsed, 'Failed to add remark'), response.status, parsed);
    }
    return typeof parsed.message === 'string' && parsed.message ? parsed.message : 'Remark added successfully';
  } catch (error) {
    if (error instanceof ApiError) throw error;
    return 'Remark added successfully';
  }
}

async function parseDeleteOrdersResponse(
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

  if (!text) return 'Order(s) deleted successfully';

  try {
    const payload = JSON.parse(text) as { success?: boolean; message?: string; data?: unknown };

    if (payload.success === false) {
      throw new ApiError(
        parseApiErrorMessage(payload, fallbackError),
        response.status,
        payload
      );
    }

    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message;
    }

    return 'Order(s) deleted successfully';
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (text === 'true') return 'Order(s) deleted successfully';
    return text || 'Order(s) deleted successfully';
  }
}

/** POST /api/Order/DeleteOrders */
export async function deleteOrders(orderIds: number[], token?: string): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.deleteOrders}`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ orderIds }),
    cache: 'no-store',
  });

  return parseDeleteOrdersResponse(response, 'Failed to delete orders');
}

async function parseRetryDispatchResponse(
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

  if (!text) return 'Order(s) resubmitted for dispatch';

  try {
    const payload = JSON.parse(text) as { success?: boolean; message?: string; data?: unknown };

    if (payload.success === false) {
      throw new ApiError(
        parseApiErrorMessage(payload, fallbackError),
        response.status,
        payload
      );
    }

    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message;
    }

    return 'Order(s) resubmitted for dispatch';
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (text === 'true') return 'Order(s) resubmitted for dispatch';
    return text || 'Order(s) resubmitted for dispatch';
  }
}

/** POST /api/Order/RetryDispatch */
export async function retryDispatchOrders(orderIds: number[], token?: string): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.retryDispatch}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ orderIds }),
    cache: 'no-store',
  });

  return parseRetryDispatchResponse(response, 'Failed to retry dispatch');
}

interface ReweightArrivalApiResponse {
  success?: boolean;
  message?: string | null;
  data?: Partial<ReweightArrivalResult> | null;
  details?: unknown;
}

/** POST /api/Order/ReweightArrival */
export async function reweightArrival(
  payload: ReweightArrivalPayload,
  token?: string
): Promise<{ message: string; result: ReweightArrivalResult }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.reweightArrival}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const text = await response.text();
  let body: ReweightArrivalApiResponse = {};

  try {
    body = text ? (JSON.parse(text) as ReweightArrivalApiResponse) : {};
  } catch {
    body = {};
  }

  if (!response.ok || body.success === false) {
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to reweight arrival (${response.status})`),
      response.status,
      body
    );
  }

  const data = body.data ?? {};

  return {
    message: body.message ?? 'Order(s) reweighed successfully',
    result: {
      total: Number(data.total) || 0,
      updated: Number(data.updated) || 0,
      skipped: Number(data.skipped) || 0,
      scannedOrders: Array.isArray(data.scannedOrders) ? data.scannedOrders : [],
      alreadyScanned: Array.isArray(data.alreadyScanned) ? data.alreadyScanned : [],
      notFound: Array.isArray(data.notFound) ? data.notFound : [],
    },
  };
}

interface CreateDeliverySheetApiResponse {
  success?: boolean;
  message?: string | null;
  data?: unknown;
  details?: unknown;
}

/**
 * POST /api/Order/CreateDeliverySheet. Backend response shape for `data` isn't confirmed
 * yet, so it's returned as-is for the caller to interpret defensively.
 */
export async function createDeliverySheet(
  payload: CreateDeliverySheetPayload,
  token?: string
): Promise<{ message: string; data: unknown }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.createDeliverySheet}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const text = await response.text();
  let body: CreateDeliverySheetApiResponse = {};

  try {
    body = text ? (JSON.parse(text) as CreateDeliverySheetApiResponse) : {};
  } catch {
    body = {};
  }

  if (!response.ok || body.success === false) {
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to create delivery sheet (${response.status})`),
      response.status,
      body
    );
  }

  return {
    message: body.message ?? 'Delivery sheet created successfully',
    data: body.data,
  };
}

interface CreateReturnDocumentApiResponse {
  success?: boolean;
  message?: string | null;
  data?: unknown;
  details?: unknown;
}

/**
 * POST /api/Order/CreateReturnDocument. Backend response shape for `data` isn't confirmed
 * yet, so it's returned as-is for the caller to interpret defensively.
 */
export async function createReturnDocument(
  payload: CreateReturnDocumentPayload,
  token?: string
): Promise<{ message: string; data: unknown }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.createReturnDocument}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const text = await response.text();
  let body: CreateReturnDocumentApiResponse = {};

  try {
    body = text ? (JSON.parse(text) as CreateReturnDocumentApiResponse) : {};
  } catch {
    body = {};
  }

  if (!response.ok || body.success === false) {
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to create return document (${response.status})`),
      response.status,
      body
    );
  }

  return {
    message: body.message ?? 'Return document created successfully',
    data: body.data,
  };
}

interface RemoveOrderFromDeliverySheetApiResponse {
  success?: boolean;
  message?: string | null;
  data?: unknown;
  details?: unknown;
}

/** POST /api/Order/RemoveOrderFromDeliverySheet */
export async function removeOrderFromDeliverySheet(
  payload: RemoveOrderFromDeliverySheetPayload,
  token?: string
): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.removeOrderFromDeliverySheet}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const text = await response.text();
  let body: RemoveOrderFromDeliverySheetApiResponse = {};

  try {
    body = text ? (JSON.parse(text) as RemoveOrderFromDeliverySheetApiResponse) : {};
  } catch {
    body = {};
  }

  if (!response.ok || body.success === false) {
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to remove order from delivery sheet (${response.status})`),
      response.status,
      body
    );
  }

  return body.message ?? 'Order removed from delivery sheet';
}

interface RemoveOrderFromReturnDocumentApiResponse {
  success?: boolean;
  message?: string | null;
  data?: unknown;
  details?: unknown;
}

/** POST /api/Order/RemoveOrderFromReturnDocument */
export async function removeOrderFromReturnDocument(
  payload: RemoveOrderFromReturnDocumentPayload,
  token?: string
): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.removeOrderFromReturnDocument}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const text = await response.text();
  let body: RemoveOrderFromReturnDocumentApiResponse = {};

  try {
    body = text ? (JSON.parse(text) as RemoveOrderFromReturnDocumentApiResponse) : {};
  } catch {
    body = {};
  }

  if (!response.ok || body.success === false) {
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to remove order from return document (${response.status})`),
      response.status,
      body
    );
  }

  return body.message ?? 'Order removed from return document';
}

interface UpdateReturnDocumentStatusApiResponse {
  success?: boolean;
  message?: string | null;
  data?: unknown;
  details?: unknown;
}

/** POST /api/Order/UpdateReturnDocumentStatus */
export async function updateReturnDocumentStatus(
  payload: UpdateReturnDocumentStatusPayload,
  token?: string
): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.updateReturnDocumentStatus}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const text = await response.text();
  let body: UpdateReturnDocumentStatusApiResponse = {};

  try {
    body = text ? (JSON.parse(text) as UpdateReturnDocumentStatusApiResponse) : {};
  } catch {
    body = {};
  }

  if (!response.ok || body.success === false) {
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to update return document status (${response.status})`),
      response.status,
      body
    );
  }

  return body.message ?? 'Return document status updated';
}

/** POST /api/Order/GenerateDeliverySheet — returns the delivery sheet file for the given orders. */
export async function generateDeliverySheet(
  payload: CreateDeliverySheetPayload,
  token?: string
): Promise<{ blob: Blob; filename: string }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: '*/*',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.generateDeliverySheet}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
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
      parseApiErrorMessage(body, `Failed to generate delivery sheet (${response.status})`),
      response.status,
      body
    );
  }

  const blob = await response.blob();
  return {
    blob,
    filename: parseContentDispositionFilename(
      response.headers.get('Content-Disposition'),
      'DeliverySheet.pdf'
    ),
  };
}

/** POST /api/Order/GenerateReturnDocument — returns the return document file for the given orders. */
export async function generateReturnDocument(
  payload: CreateReturnDocumentPayload,
  token?: string
): Promise<{ blob: Blob; filename: string }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: '*/*',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.generateReturnDocument}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
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
      parseApiErrorMessage(body, `Failed to generate return document (${response.status})`),
      response.status,
      body
    );
  }

  const blob = await response.blob();
  return {
    blob,
    filename: parseContentDispositionFilename(
      response.headers.get('Content-Disposition'),
      'ReturnDocument.pdf'
    ),
  };
}

/** GET /api/Order/GenerateDeliverySheetById?deliverySheetId= — returns the delivery sheet file for an existing rollcart. */
export async function generateDeliverySheetById(
  deliverySheetId: number,
  token?: string
): Promise<{ blob: Blob; filename: string }> {
  const headers: Record<string, string> = {
    Accept: '*/*',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(
    `${API_BASE_URL}${API_ROUTES.generateDeliverySheetById(deliverySheetId)}`,
    {
      method: 'GET',
      headers,
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const contentType = response.headers.get('Content-Type') ?? '';
    let body: unknown;

    if (contentType.includes('application/json')) {
      body = await response.json().catch(() => undefined);
    } else {
      body = await response.text().catch(() => undefined);
    }

    throw new ApiError(
      parseApiErrorMessage(body, `Failed to generate delivery sheet (${response.status})`),
      response.status,
      body
    );
  }

  const blob = await response.blob();
  return {
    blob,
    filename: parseContentDispositionFilename(
      response.headers.get('Content-Disposition'),
      'DeliverySheet.pdf'
    ),
  };
}

/** GET /api/Order/GenerateReturnDocumentById?returnDocumentId= — returns the return document file for an existing return document. */
export async function generateReturnDocumentById(
  returnDocumentId: number,
  token?: string
): Promise<{ blob: Blob; filename: string }> {
  const headers: Record<string, string> = {
    Accept: '*/*',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(
    `${API_BASE_URL}${API_ROUTES.generateReturnDocumentById(returnDocumentId)}`,
    {
      method: 'GET',
      headers,
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const contentType = response.headers.get('Content-Type') ?? '';
    let body: unknown;

    if (contentType.includes('application/json')) {
      body = await response.json().catch(() => undefined);
    } else {
      body = await response.text().catch(() => undefined);
    }

    throw new ApiError(
      parseApiErrorMessage(body, `Failed to generate return document (${response.status})`),
      response.status,
      body
    );
  }

  const blob = await response.blob();
  return {
    blob,
    filename: parseContentDispositionFilename(
      response.headers.get('Content-Disposition'),
      'ReturnDocument.pdf'
    ),
  };
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
    locationId: pickValue(record, [
      'locationId',
      'LocationId',
      'Location_id',
      'Locationid',
    ]),
    serviceId: pickValue(record, ['serviceId', 'ServiceId']),
    warehouseId: pickValue(record, ['warehouseId', 'WarehouseId']),
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

function pickStatNumber(record: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = Number(record[key]);
    if (Number.isFinite(value)) return value;
  }
  return 0;
}

function pickStatErrors(record: Record<string, unknown>): string[] {
  const raw = record.errors ?? record.Errors;
  if (!Array.isArray(raw)) return [];
  return raw.filter((entry): entry is string => typeof entry === 'string' && Boolean(entry));
}

const STAT_FIELD_KEYS = ['totalRows', 'TotalRows', 'successRows', 'SuccessRows', 'failedRows', 'FailedRows'];

function hasStatFields(record: Record<string, unknown>): boolean {
  return STAT_FIELD_KEYS.some((key) => record[key] != null);
}

/** Backend sometimes wraps the real stats in nested `data`/`stats` envelopes. */
function resolveStatsRecord(record: Record<string, unknown>): Record<string, unknown> | null {
  if (hasStatFields(record)) return record;

  if (record.stats && typeof record.stats === 'object' && !Array.isArray(record.stats)) {
    const nested = record.stats as Record<string, unknown>;
    if (hasStatFields(nested)) return nested;
  }

  if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
    return resolveStatsRecord(record.data as Record<string, unknown>);
  }

  return null;
}

function parseBulkUploadStats(data: unknown): BulkUploadStats | null {
  if (!data) return null;

  if (Array.isArray(data)) {
    const successRows = data.length;
    return {
      totalRows: successRows,
      successRows,
      failedRows: 0,
      errors: [],
    };
  }

  if (typeof data !== 'object') return null;

  const nested = resolveStatsRecord(data as Record<string, unknown>);
  if (!nested) return null;

  return {
    totalRows: pickStatNumber(nested, ['totalRows', 'TotalRows']),
    successRows: pickStatNumber(nested, ['successRows', 'SuccessRows']),
    failedRows: pickStatNumber(nested, ['failedRows', 'FailedRows']),
    errors: pickStatErrors(nested),
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

/**
 * Only rejects when the file itself yielded no rows to process — partial and full
 * row-level failures are returned as stats so the UI can render a results summary
 * instead of a blocking error.
 */
function resolveBulkUploadStats(payload: BulkUploadApiResponse): BulkUploadStats | null {
  const stats = parseBulkUploadStats(payload.data);
  if (!stats) return null;

  if (stats.totalRows === 0) {
    throw new ApiError(
      'No order rows found in the file. Check the template and try again.',
      400,
      payload
    );
  }

  return stats;
}

function buildBulkUploadMessage(stats: BulkUploadStats | null, fallback?: string | null): string {
  if (!stats) return fallback ?? 'Shipments added successfully';

  if (stats.successRows === stats.totalRows) {
    return `${stats.successRows} order(s) imported successfully.`;
  }
  if (stats.successRows > 0) {
    return `${stats.successRows} of ${stats.totalRows} order(s) imported. ${formatBulkUploadStatsMessage(stats)}`;
  }
  return `0 of ${stats.totalRows} order(s) imported. ${formatBulkUploadStatsMessage(stats)}`;
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
  stats: BulkUploadStats | null;
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
    return { message: text || 'File uploaded successfully', shipments: [], stats: null };
  }

  if (!response.ok || payload.success === false) {
    throw new ApiError(formatBulkUploadErrorMessage(payload), response.status, payload);
  }

  const stats = resolveBulkUploadStats(payload);
  const shipments = extractBulkUploadShipments(payload.data);

  return {
    message: buildBulkUploadMessage(stats, payload.message),
    shipments,
    stats,
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

/** GET /api/Order/DeliverySheetDebriefing?deliverySheetId= — rollcart id maps to deliverySheetId. */
export async function getDeliverySheetDebriefing(
  deliverySheetId: number,
  token?: string
): Promise<DeliverySheetDebriefingData> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${API_ROUTES.deliverySheetDebriefing(deliverySheetId)}`,
    {
      method: 'GET',
      headers,
      cache: 'no-store',
    }
  );

  const text = await response.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : text;
  } catch {
    /* plain text or empty */
  }

  if (!response.ok) {
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to fetch debriefing (${response.status})`),
      response.status,
      body
    );
  }

  const payload = body as DeliverySheetDebriefingResponse;

  if (!payload || payload.success === false || !payload.data) {
    throw new ApiError(
      parseApiErrorMessage(payload, 'Failed to fetch debriefing'),
      response.status,
      payload
    );
  }

  return payload.data;
}

/** GET /api/Order/GetAllDeliverySheets — no filter params supported; always returns every sheet. */
export async function getAllDeliverySheets(token?: string): Promise<DeliverySheetListData> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.getAllDeliverySheets}`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  const text = await response.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : text;
  } catch {
    /* plain text or empty */
  }

  if (!response.ok) {
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to fetch delivery sheets (${response.status})`),
      response.status,
      body
    );
  }

  const payload = body as DeliverySheetListResponse;

  if (!payload || payload.success === false || !payload.data) {
    throw new ApiError(
      parseApiErrorMessage(payload, 'Failed to fetch delivery sheets'),
      response.status,
      payload
    );
  }

  return payload.data;
}

/** GET /api/Order/GetAllReturnDocuments — no filter params supported; always returns every return document. */
export async function getAllReturnDocuments(token?: string): Promise<ReturnDocumentListData> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.getAllReturnDocuments}`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  const text = await response.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : text;
  } catch {
    /* plain text or empty */
  }

  if (!response.ok) {
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to fetch return documents (${response.status})`),
      response.status,
      body
    );
  }

  const payload = body as ReturnDocumentListResponse;

  if (!payload || payload.success === false || !payload.data) {
    throw new ApiError(
      parseApiErrorMessage(payload, 'Failed to fetch return documents'),
      response.status,
      payload
    );
  }

  return payload.data;
}

/** GET /api/Order/GetAllShipperAdvices?ListType=&ClientId=&Page=&PageSize= */
export async function getAllShipperAdvices(
  params: { listType: string; clientId?: number; page?: number; pageSize?: number },
  token?: string
): Promise<ShipperAdviceListData> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.getAllShipperAdvices(params)}`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  const text = await response.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : text;
  } catch {
    /* plain text or empty */
  }

  if (!response.ok) {
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to fetch shipper advices (${response.status})`),
      response.status,
      body
    );
  }

  const payload = body as ShipperAdviceListResponse;

  if (!payload || payload.success === false || !payload.data) {
    throw new ApiError(
      parseApiErrorMessage(payload, 'Failed to fetch shipper advices'),
      response.status,
      payload
    );
  }

  return payload.data;
}

/** GET /api/Order/GetPickupReport?ClientId=&RiderId=&CityId=&PickupDateFrom=&PickupDateTo=&Page=&PageSize= */
export async function getPickupReport(
  params: GetPickupReportParams,
  token?: string
): Promise<PickupReportData> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.getPickupReport(params)}`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  const text = await response.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : text;
  } catch {
    /* plain text or empty */
  }

  if (!response.ok) {
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to fetch pickup report (${response.status})`),
      response.status,
      body
    );
  }

  const payload = body as { success?: boolean; message?: string | null; data?: PickupReportData | null };

  if (!payload || payload.success === false || !payload.data) {
    throw new ApiError(parseApiErrorMessage(payload, 'Failed to fetch pickup report'), response.status, payload);
  }

  return payload.data;
}

/** POST /api/Order/ApproveShipperAdvice */
export async function approveShipperAdvice(
  payload: { shipperAdviceId: number; adminId: number },
  token?: string
): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.approveShipperAdvice}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
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
      parseApiErrorMessage(body, `Failed to approve shipper advice (${response.status})`),
      response.status,
      body
    );
  }

  if (!text) return 'Shipper advice approved successfully';

  try {
    const parsed = JSON.parse(text) as { success?: boolean; message?: string };
    if (parsed.success === false) {
      throw new ApiError(parseApiErrorMessage(parsed, 'Failed to approve shipper advice'), response.status, parsed);
    }
    return typeof parsed.message === 'string' && parsed.message ? parsed.message : 'Shipper advice approved successfully';
  } catch (error) {
    if (error instanceof ApiError) throw error;
    return 'Shipper advice approved successfully';
  }
}

/** POST /api/Order/SubmitShipperAdviceRequest */
export async function submitShipperAdviceRequest(
  payload: SubmitShipperAdviceRequestPayload,
  token?: string
): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.submitShipperAdviceRequest}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
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
      parseApiErrorMessage(body, `Failed to submit shipper advice request (${response.status})`),
      response.status,
      body
    );
  }

  if (!text) return 'Shipper advice request submitted successfully';

  try {
    const parsed = JSON.parse(text) as { success?: boolean; message?: string };
    if (parsed.success === false) {
      throw new ApiError(
        parseApiErrorMessage(parsed, 'Failed to submit shipper advice request'),
        response.status,
        parsed
      );
    }
    return typeof parsed.message === 'string' && parsed.message
      ? parsed.message
      : 'Shipper advice request submitted successfully';
  } catch (error) {
    if (error instanceof ApiError) throw error;
    return 'Shipper advice request submitted successfully';
  }
}

/** GET /api/Order/GetReturnDocumentView?returnDocumentId= — the `number` field from GetAllReturnDocuments is the returnDocumentId. */
export async function getReturnDocumentView(
  returnDocumentId: number,
  token?: string
): Promise<ReturnDocumentViewData> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${API_ROUTES.getReturnDocumentView(returnDocumentId)}`,
    {
      method: 'GET',
      headers,
      cache: 'no-store',
    }
  );

  const text = await response.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : text;
  } catch {
    /* plain text or empty */
  }

  if (!response.ok) {
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to fetch return document (${response.status})`),
      response.status,
      body
    );
  }

  const payload = body as ReturnDocumentViewResponse;

  if (!payload || payload.success === false || !payload.data) {
    throw new ApiError(
      parseApiErrorMessage(payload, 'Failed to fetch return document'),
      response.status,
      payload
    );
  }

  return payload.data;
}

/** GET /api/Order/GetDeliverySheetView?sheetId= — the `number` field from GetAllDeliverySheets is the sheetId. */
export async function getDeliverySheetView(
  sheetId: number,
  token?: string
): Promise<DeliverySheetViewData> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.getDeliverySheetView(sheetId)}`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  const text = await response.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : text;
  } catch {
    /* plain text or empty */
  }

  if (!response.ok) {
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to fetch delivery sheet (${response.status})`),
      response.status,
      body
    );
  }

  const payload = body as DeliverySheetViewResponse;

  if (!payload || payload.success === false || !payload.data) {
    throw new ApiError(
      parseApiErrorMessage(payload, 'Failed to fetch delivery sheet'),
      response.status,
      payload
    );
  }

  return payload.data;
}

interface PickDeliverySheetApiResponse {
  success?: boolean;
  message?: string | null;
  data?: unknown;
  details?: unknown;
}

/** POST /api/Order/PickDeliverySheet — assigns all unassigned orders on the delivery sheet to the rider. */
export async function pickDeliverySheet(
  payload: { deliverySheetId: number; adminId: number },
  token?: string
): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.pickDeliverySheet}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const text = await response.text();
  let body: PickDeliverySheetApiResponse = {};

  try {
    body = text ? (JSON.parse(text) as PickDeliverySheetApiResponse) : {};
  } catch {
    body = {};
  }

  if (!response.ok || body.success === false) {
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to assign delivery sheet (${response.status})`),
      response.status,
      body
    );
  }

  return body.message ?? 'Delivery sheet assigned';
}

interface CloseDeliverySheetApiResponse {
  success?: boolean;
  message?: string | null;
  data?: unknown;
  details?: unknown;
}

/** POST /api/Order/CloseDeliverySheet */
export async function closeDeliverySheet(deliverySheetId: number, token?: string): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.closeDeliverySheet}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ deliverySheetId }),
    cache: 'no-store',
  });

  const text = await response.text();
  let body: CloseDeliverySheetApiResponse = {};

  try {
    body = text ? (JSON.parse(text) as CloseDeliverySheetApiResponse) : {};
  } catch {
    body = {};
  }

  if (!response.ok || body.success === false) {
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to close delivery sheet (${response.status})`),
      response.status,
      body
    );
  }

  return body.message ?? 'Delivery sheet closed';
}

interface UpdateOrderDeliveryStatusApiResponse {
  success?: boolean;
  message?: string | null;
  data?: unknown;
  details?: unknown;
}

/** POST /api/Order/UpdateOrderDeliveryStatus */
export async function updateOrderDeliveryStatus(
  payload: UpdateOrderDeliveryStatusPayload,
  token?: string
): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.updateOrderDeliveryStatus}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const text = await response.text();
  let body: UpdateOrderDeliveryStatusApiResponse = {};

  try {
    body = text ? (JSON.parse(text) as UpdateOrderDeliveryStatusApiResponse) : {};
  } catch {
    body = {};
  }

  if (!response.ok || body.success === false) {
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to update order delivery status (${response.status})`),
      response.status,
      body
    );
  }

  return body.message ?? 'Order delivery status updated';
}
