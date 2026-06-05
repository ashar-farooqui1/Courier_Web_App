import { API_ROUTES } from "@/lib/api/config";
import { apiGet } from "@/lib/api/http";
import type { Role } from "@/types/role";

export async function getRoles(): Promise<Role[]> {
  return apiGet<Role[]>(API_ROUTES.roles);
}
