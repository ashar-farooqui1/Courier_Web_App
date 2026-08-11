export interface OrderPickupLocationDetails {
  pickupLocationId: number;
  pickupLocationName: string;
  originAddress: string;
  originArea: string;
  originCityId: number;
  originCity: string;
  serviceId: number;
  serviceName: string;
}

export interface CreateOrderPayload {
  clientId: number;
  pickupLocationId: number;
  warehouseId: number;
  serviceId: number;
  serviceName: string;
  originAddress: string;
  originArea: string;
  originCityId: number;
  destinationCityId: number;
  customerName: string;
  customerPhone: string;
  customerReference: string;
  deliveryAddress: string;
  area: string;
  productName: string;
  amount: number;
  weight: number;
  quantity: number;
  customerRemarks: string;
  isReplacement: boolean;
}

export interface CreateOrderApiResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

export type { OrderStatusApiValue } from "@/lib/orders/order-status-options";
export {
  ORDER_STATUS_OPTIONS,
  formatOrderStatusLabel,
  getOrderStatusLabel,
} from "@/lib/orders/order-status-options";

import type { OrderStatusApiValue } from "@/lib/orders/order-status-options";

export interface UpdateOrderStatusPayload {
  orderIds: number[];
  status: OrderStatusApiValue;
  adminId: number;
}

export interface UpdateOrderStatusApiResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

export interface ClientOrder {
  orderId: number;
  awbNo: string;
  clientName: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  productName: string;
  customerReference: string;
  serviceName: string;
  weight: number;
  orderDate: string;
  status: string;
  riderName: string;
  destinationCity: string;
  originCity: string;
  warehouse: string;
  courierId: number;
  courierTrackingNo: string;
  courierName: string;
  courierLogoUrl: string;
  dispatchStatus: string;
  /** Live status from the third-party courier's tracking API (e.g. M&P). Not from the backend. */
  courierTrackingStatus: string;
}

export interface OrderDetailSender {
  name: string;
  phone: string;
  email: string;
  address: string;
  area: string;
  pickupScheduledAt: string;
}

export interface OrderDetailRecipient {
  name: string;
  phone: string;
  address: string;
  area: string;
  deliveredAt: string;
}

export interface OrderDetailHistoryEvent {
  time: string;
  description: string;
  changedByName: string;
  changedByEmail: string;
  changedByRole: string;
}

export interface OrderDetailHistoryGroup {
  dateLabel: string;
  events: OrderDetailHistoryEvent[];
}

export interface OrderDetailRemark {
  remarkId: number;
  remark: string;
  remarkByName: string;
  remarkByRoleName: string;
  remarkDate: string;
}

export interface OrderDetail {
  orderId: number;
  awbNo: string;
  clientName: string;
  amount: number;
  status: string;
  quantity: number;
  weight: number;
  serviceName: string;
  sender: OrderDetailSender;
  recipient: OrderDetailRecipient;
  history: OrderDetailHistoryGroup[];
  remarks: OrderDetailRemark[];
}

export interface AddOrderRemarkPayload {
  orderId: number;
  remark: string;
  remarkById: number;
  remarkByRoleId: number;
}

export interface ReweightArrivalPayload {
  warehouseId: number;
  pickupRiderId: number;
  weight: number;
  awbNo: string[];
}

export interface CreateDeliverySheetPayload {
  awbNo: string[];
  riderId: number;
  adminId: number;
  warehouseId: number;
  deliverySheetDate: string;
}

export interface CreateReturnDocumentPayload {
  awbNo: string[];
  riderId: number;
  adminId: number;
  warehouseId: number;
  returnDocumentDate: string;
}

export interface RemoveOrderFromDeliverySheetPayload {
  awbNo: string;
  deliverySheetId: number;
}

export interface ReweightScannedOrder {
  awbNo: string;
  clientName: string;
  customerName: string;
  customerNumber: string;
  amount: number;
  referenceId: string;
  service: string;
  chargedWeight: number;
  orderDateTime: string;
  riderName: string;
}

export interface ReweightArrivalResult {
  total: number;
  updated: number;
  skipped: number;
  scannedOrders: ReweightScannedOrder[];
  alreadyScanned: ReweightScannedOrder[];
  notFound: string[];
}

export interface BulkUploadShipmentPreview {
  consigneeName: string;
  consigneeContactNo: string;
  deliveryAddress: string;
  customerReference: string;
  productName: string;
  destination: string;
  quantity: number | string;
  weight: number | string;
  amount: number | string;
  locationId: number | string;
  serviceId: number | string;
  warehouseId: number | string;
  service: string;
  replacementId: string;
}

export interface BulkUploadApiResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

export interface BulkUploadStats {
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors: string[];
}
