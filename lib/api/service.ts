import { API_ROUTES } from "@/lib/api/config";
import { apiGet } from "@/lib/api/http";
import type { Service } from "@/lib/types/service";

interface ServicesApiResponse {
  success?: boolean;
  message?: string | null;
  data?: Service[];
  details?: unknown;
}

export async function getAllServices(): Promise<Service[]> {
  const response = await apiGet<ServicesApiResponse | Service[]>(API_ROUTES.services);

  if (Array.isArray(response)) {
    return response;
  }

  const data = response.data ?? (response as { Data?: Service[] }).Data;
  return Array.isArray(data) ? data : [];
}
