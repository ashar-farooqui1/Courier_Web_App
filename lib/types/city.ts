export interface City {
  cityId: number;
  cityName: string;
  serviceId: number;
  serviceName: string;
  shortForm: string;
  status: string;
}

export interface CreateCityPayload {
  cityName: string;
  serviceId: number;
  shortForm: string;
  status: string;
}
