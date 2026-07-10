export interface PickupLocation {
  pickupLocationId: number;
  clientId: number;
  brandName?: string;
  contactPerson: string;
  contactPhone: string;
  locationName: string;
  address: string;
  area: string;
  cityId: number;
  cityName?: string;
  isDefault: boolean;
}

export interface CreatePickupLocationPayload {
  clientId: number;
  brandName: string;
  contactPerson: string;
  contactPhone: string;
  locationName: string;
  address: string;
  area: string;
  cityId: number;
  isDefault: boolean;
}

export type UpdatePickupLocationPayload = CreatePickupLocationPayload;

export interface PickupLocationMutationResponse {
  success?: boolean;
  message: string;
}
