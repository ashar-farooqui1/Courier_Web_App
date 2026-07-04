/** Client entity from GET /api/Client */
export interface Client {
  clientId: number;
  clientCode: string;
  status: string;
  brandName: string;
  clientName: string;
  pocNumber: string;
  contactNumber: string;
  clientLogo: string | null;
  clientEmail: string;
  clientBillingAddress: string;
  clientPickupAddress: string;
  baseTown: string;
  city: string;
  defaultPickingRiderId: number;
  salesPersonId: number | null;
  services: string;
  arrivalAt: string;
  deliverySettings?: unknown;
}

export interface UpdateClientPayload {
  status: string;
  brandName: string;
  clientName: string;
  pocNumber: string;
  contactNumber: string;
  clientEmail: string;
  clientBillingAddress: string;
  clientPickupAddress: string;
  baseTown: string;
  city: string;
  defaultPickingRiderId: number;
  salesPersonId: number;
  services: string;
  roleId: number;
  createdByAdminId: number;
}
