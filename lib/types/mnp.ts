/** Types for M&P (mnpcourier.com) Bulk_Consignment_Tracking_New API. */

export interface MnpCredentials {
  Username: string;
  Password: string;
  AccountNo: string;
}

export interface MnpBulkTrackingRequest extends MnpCredentials {
  Consignments: string[];
}

export interface MnpCnTrackingEvent {
  ConsignmentNumber: string;
  TrackingTagID: string;
  TransactionTime: string;
  Location: string;
  TrackingStatus: string;
  TrackingNarration: string;
  Event: string | null;
}

export interface MnpCnTrackingInvoice {
  ConsignmentNumber: string;
  InvoiceNumber: string | null;
  InvoiceDate: string | null;
  AmountInvoiced: string;
  InvoiceType: string;
}

export interface MnpTrackingDetail {
  ConsignmentNumber: string;
  OrderId: string;
  OriginCity: string;
  BookingDate: string;
  CODAmount: string;
  Weight: string;
  Pieces: string;
  ConsigneeName: string;
  ConsignerName: string;
  ContactNo: string;
  DestinationCity: string;
  DeliveryAddress: string;
  ServiceType: string;
  PaymentID: string | null;
  InstrumentNumber: string | null;
  PaymentDate: string | null;
  AmountPaid: string;
  AdjustedPaymentID: string;
  AdjustedPaymentDate: string;
  CNTrackingDetail: MnpCnTrackingEvent[];
  CNTrackingInvDetail: MnpCnTrackingInvoice[];
}

export interface MnpBulkTrackingResult {
  isSuccess: string;
  message: string;
  orderReferenceIdList: string[];
  tracking_Details: MnpTrackingDetail[];
}
