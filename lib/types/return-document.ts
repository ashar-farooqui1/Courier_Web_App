export interface ReturnDocumentListItem {
  number: number;
  date: string;
  riderName: string;
  shipments: number;
  status: string;
}

export interface ReturnDocumentListData {
  page: number;
  pageSize: number;
  totalCount: number;
  returnDocuments: ReturnDocumentListItem[];
}

export interface ReturnDocumentListResponse {
  success: boolean;
  message: string | null;
  data: ReturnDocumentListData | null;
  details: unknown;
}

export interface ReturnDocumentViewHeader {
  returnDocumentId: number;
  date: string;
  warehouseName: string;
  riderName: string;
  returnDocumentStatus: string;
}

export interface ReturnDocumentViewShipment {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  area: string | null;
  destinationCity: string;
  serviceName: string;
  orderDate: string;
  chargedWeight: number;
  sender: string;
  contents: string;
  cod: number;
}

export interface ReturnDocumentViewOrder {
  serial: number;
  awbNo: string;
  clientName: string;
  shipment: ReturnDocumentViewShipment;
}

export interface ReturnDocumentViewFooter {
  pieces: number;
  refunds: number;
  liftsAndDeliveries: number;
}

export interface ReturnDocumentViewData {
  header: ReturnDocumentViewHeader;
  orders: ReturnDocumentViewOrder[];
  footer: ReturnDocumentViewFooter;
}

export interface ReturnDocumentViewResponse {
  success: boolean;
  message: string | null;
  data: ReturnDocumentViewData | null;
  details: unknown;
}

export interface RemoveOrderFromReturnDocumentPayload {
  awbNo: string;
  returnDocumentId: number;
}

export interface UpdateReturnDocumentStatusPayload {
  returnDocumentId: number;
  status: string;
}
