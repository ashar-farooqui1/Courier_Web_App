export const MP_COURIER_CODE = "M&P";

export interface CourierLocationMapping {
  cityId: number;
  cityName: string;
  courierCode: string;
  externalLocationId: string;
  externalLocationName: string;
}

export interface CourierExternalLocation {
  externalLocationId: string;
  externalLocationName: string;
}

export interface CourierLocationSyncUnmatched {
  locationId: string;
  locationName: string;
  reason: string;
}

export interface CourierLocationSyncResult {
  courierCode: string;
  totalLocations: number;
  matched: number;
  unmatched: CourierLocationSyncUnmatched[];
}

export interface SetCourierLocationMappingPayload {
  courierCode: string;
  cityId: number;
  externalLocationId: string;
  externalLocationName: string;
}

export interface CourierLocationApiResponse<T = unknown> {
  success?: boolean;
  message?: string | null;
  data?: T;
  details?: unknown;
}
