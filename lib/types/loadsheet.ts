export interface Loadsheet {
  loadsheetId: number;
  clientId: number;
  clientName: string;
  totalConsignments: number;
  createdAt: string;
}

export interface LoadsheetOrder {
  orderId: number;
  awbNo: string;
  customerName: string;
  status: string;
  courierTrackingNo: string;
  destinationCity: string;
  amount: number;
  weight: number;
  quantity: number;
}

export interface LoadsheetDetail extends Loadsheet {
  orders: LoadsheetOrder[];
}

export interface CreateLoadsheetPayload {
  orderIds: number[];
}

export interface AddOrdersToLoadsheetPayload {
  loadsheetId: number;
  orderIds: number[];
}

export interface RemoveOrdersFromLoadsheetPayload {
  loadsheetId: number;
  orderIds: number[];
}
