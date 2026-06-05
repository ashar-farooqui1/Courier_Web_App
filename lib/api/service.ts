import { API_ROUTES } from "@/lib/api/config";
import { apiGet } from "@/lib/api/http";
import type { Service } from "@/lib/types/service";

export async function getAllServices(): Promise<Service[]> {
  return apiGet<Service[]>(API_ROUTES.services);
}
