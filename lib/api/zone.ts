import { API_ROUTES } from "@/lib/api/config";
import { apiGet } from "@/lib/api/http";
import type { Zone } from "@/lib/types/zone";

interface ZonesApiResponse {
  success?: boolean;
  message?: string | null;
  data?: Zone[];
  details?: unknown;
}

export async function getAllZones(): Promise<Zone[]> {
  const response = await apiGet<ZonesApiResponse | Zone[]>(API_ROUTES.zones);

  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response.data) ? response.data : [];
}
