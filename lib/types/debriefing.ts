export interface DeliverySheetDebriefingSummary {
  riderName: string;
  warehouseName: string;
  deliverySheetStatus: string;
  createdAt: string | null;
  closeAt: string | null;
  totalOrders: number;
  totalPending: number;
  totalReturned: number;
  totalDelivered: number;
  deliveredAmount: number;
  totalReattempt: number;
  totalAdvised: number;
}

export interface DeliverySheetDebriefingOrder {
  trackingId: string;
  name: string;
  customerName: string;
  contact: string;
  address: string;
  amount: number;
  attempt: number;
  reasons: string | null;
  status: string;
  warehouseStatus: string;
  deliveryStatus: string;
}

export interface DeliverySheetDebriefingData {
  summary: DeliverySheetDebriefingSummary;
  orders: DeliverySheetDebriefingOrder[];
}

export interface DeliverySheetDebriefingResponse {
  success: boolean;
  message: string | null;
  data: DeliverySheetDebriefingData | null;
  details: unknown;
}

export interface UpdateOrderDeliveryStatusPayload {
  deliverySheetId: number;
  /** The order's trackingId. */
  awbNo: string;
  status: string;
  reason: string;
}
