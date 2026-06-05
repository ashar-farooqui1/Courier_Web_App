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
  services: string;
  arrivalAt: string;
}
