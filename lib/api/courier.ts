import { API_ROUTES } from "@/lib/api/config";
import { apiGet } from "@/lib/api/http";
import type { Courier } from "@/lib/types/courier";

interface CouriersApiResponse {
  success?: boolean;
  message?: string | null;
  data?: Courier[];
  details?: unknown;
}

export async function getAllCouriers(): Promise<Courier[]> {
  const response = await apiGet<CouriersApiResponse | Courier[]>(API_ROUTES.couriers);

  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response.data) ? response.data : [];
}
