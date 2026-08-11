export interface ZoneCourierItem {
  courierId: number;
  priority: number;
}

export interface ZoneCourierMapping {
  zoneId: number;
  couriers: ZoneCourierItem[];
}

export type PickupType = 'Stallionex' | 'ThirdPartyLogistics';

export interface SaveZoneCourierPayload {
  clientId: number;
  pickupType: PickupType;
  zones: ZoneCourierMapping[];
}

export interface SaveZoneCourierResponse {
  success: boolean;
  message: string;
}
