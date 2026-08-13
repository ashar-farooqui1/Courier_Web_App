export interface PickupReportItem {
  salesPerson: string | null;
  client: string;
  clientId: string;
  brandName: string;
  pickupAddress: string;
  trackingId: string;
  customerName: string;
  customerNumber: string;
  area: string | null;
  city: string;
  originCity: string;
  deliveryAddress: string;
  customerReference: string;
  amount: number;
  service: string;
  orderDateTime: string;
  expDeliveryDate: string;
  status: string;
  pickupDate: string | null;
  pickupTime: string | null;
  pickedUpBy: string | null;
  weight: number;
  pickedUpStatusAddedBy: string | null;
}

export interface PickupReportData {
  page: number;
  pageSize: number;
  totalCount: number;
  items: PickupReportItem[];
}

export interface GetPickupReportParams {
  clientId?: number;
  riderId?: number;
  cityId?: number;
  pickupDateFrom?: string;
  pickupDateTo?: string;
  page?: number;
  pageSize?: number;
}
