export interface City {
  cityId: number;
  cityName: string;
  zoneId: number;
  zoneName: string;
  shortForm: string;
  province: string | null;
  status: string;
}

export interface CityApiResponse<T = unknown> {
  success?: boolean;
  message?: string | null;
  data?: T;
  details?: unknown;
}

export interface CreateCityPayload {
  cityName: string;
  zoneId: number;
  shortForm: string;
  province: string;
  status: string;
}

export type UpdateCityPayload = CreateCityPayload;

export interface BulkUploadCitiesStats {
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors: string[];
}

export interface BulkUploadCitiesResult {
  message: string;
  stats?: BulkUploadCitiesStats | null;
}
