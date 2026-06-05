import { API_ROUTES } from '@/lib/api/config';
import { apiGet } from '@/lib/api/http';
import type { ClientCity } from '@/lib/types/client-city';

export async function getCitiesByClientId(clientId: number): Promise<ClientCity[]> {
  return apiGet<ClientCity[]>(API_ROUTES.clientCitiesByClientId(clientId));
}
