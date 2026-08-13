export type ShipperAdviceListType = 'history' | 'publish' | 'pending';

export interface ShipperAdviceItem {
  shipperAdviceId: number;
  awbNo: string;
  amount: number;
  vendorOrderId: string | null;
  isApproved: boolean;
  approvalDate: string | null;
  currentStatus: string;
  currentStatusDate: string;
  requestedStatus: string | null;
  requestedStatusDate: string | null;
  customerPhoneNo: string;
  riderRemarks: string | null;
  shipperName: string;
  customerName: string;
  totalAttempts: number;
  remarks: string | null;
}

export interface ShipperAdviceListData {
  page: number;
  pageSize: number;
  totalCount: number;
  shipperAdvices: ShipperAdviceItem[];
}

export interface ShipperAdviceListResponse {
  success: boolean;
  message: string | null;
  data: ShipperAdviceListData | null;
  details: unknown;
}

export interface SubmitShipperAdviceRequestPayload {
  shipperAdviceId: number;
  clientId: number;
  requestedStatus: string;
  remarks: string;
}
