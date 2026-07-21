export interface ZoneCourierItem {
  courierId: number;
  priority: number;
}

export interface ZoneCourierMapping {
  zoneId: number;
  couriers: ZoneCourierItem[];
}

export interface SaveZoneCourierPayload {
  clientId: number;
  zones: ZoneCourierMapping[];
}

export interface SaveZoneCourierResponse {
  success: boolean;
  message: string;
}
