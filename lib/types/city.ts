export interface City {
  cityId: number;
  cityName: string;
  zoneId: number;
  zoneName: string;
  shortForm: string;
  status: string;
}

export interface CreateCityPayload {
  cityName: string;
  zoneId: number;
  shortForm: string;
  status: string;
}

export type UpdateCityPayload = CreateCityPayload;
