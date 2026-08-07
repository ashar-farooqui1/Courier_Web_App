import { API_ROUTES } from "@/lib/api/config";
import { apiGet } from "@/lib/api/http";
import type { Role } from "@/types/role";

interface RolesApiResponse {
  success?: boolean;
  message?: string | null;
  data?: Role[];
  details?: unknown;
}

function unwrapRoles(response: RolesApiResponse | Role[]): Role[] {
  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response.data) ? response.data : [];
}

export async function getRoles(): Promise<Role[]> {
  const response = await apiGet<RolesApiResponse | Role[]>(API_ROUTES.roles);
  return unwrapRoles(response);
}
