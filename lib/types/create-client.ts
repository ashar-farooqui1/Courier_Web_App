export interface CreateClientResponse {
  message: string;
}

export interface CreateClientFormValues {
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
  defaultPickingRiderId: string;
  services: string;
  arrivalAt: string;
  roleId: string;
}

export const defaultCreateClientFormValues: CreateClientFormValues = {
  status: 'active',
  brandName: '',
  clientName: '',
  pocNumber: '',
  contactNumber: '',
  clientEmail: '',
  clientBillingAddress: '',
  clientPickupAddress: '',
  baseTown: '',
  city: '',
  defaultPickingRiderId: '1',
  services: '',
  arrivalAt: new Date().toISOString().slice(0, 16),
  roleId: '1',
};
