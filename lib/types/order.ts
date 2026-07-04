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

export type OrderStatus = "Draft" | "Finalize";

export interface UpdateOrderStatusPayload {
  orderIds: number[];
  status: OrderStatus;
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
