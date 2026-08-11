export interface DeliverySheetListSummary {
  totalAdvices: number;
  totalReattempt: number;
  totalDelivered: number;
  totalReturnConfirm: number;
  deliveredAmount: number;
  totalRollcarts: number;
  totalAmount: number;
  totalShipment: number;
  newShipments: number;
  reattemptedShipments: number;
}

export interface DeliverySheetListCounts {
  advice: number;
  return: number;
  attempt: number;
  delivered: number;
  deliveredAmount: number;
}

export interface DeliverySheetListItem {
  number: number;
  date: string;
  riderName: string;
  shipments: number;
  total: number;
  warehouseName: string;
  status: string;
  counts: DeliverySheetListCounts;
  newShipments: number;
  reattemptedShipments: number;
}

export interface DeliverySheetListData {
  summary: DeliverySheetListSummary;
  page: number;
  pageSize: number;
  totalCount: number;
  deliverySheets: DeliverySheetListItem[];
}

export interface DeliverySheetListResponse {
  success: boolean;
  message: string | null;
  data: DeliverySheetListData | null;
  details: unknown;
}

export interface DeliverySheetViewHeader {
  deliverySheetId: number;
  date: string;
  warehouseName: string;
  riderName: string;
  deliverySheetStatus: string;
}

export interface DeliverySheetViewShipment {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  area: string;
  destinationCity: string;
  serviceName: string;
  orderDate: string;
  chargedWeight: number;
  sender: string;
  contents: string;
  cod: number;
}

export interface DeliverySheetViewOrder {
  serial: number;
  awbNo: string;
  clientName: string;
  shipment: DeliverySheetViewShipment;
}

export interface DeliverySheetViewFooter {
  pieces: number;
  refunds: number;
  liftsAndDeliveries: number;
}

export interface DeliverySheetViewData {
  header: DeliverySheetViewHeader;
  orders: DeliverySheetViewOrder[];
  footer: DeliverySheetViewFooter;
}

export interface DeliverySheetViewResponse {
  success: boolean;
  message: string | null;
  data: DeliverySheetViewData | null;
  details: unknown;
}
