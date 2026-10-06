import { buildAppAuthHeaders } from "@/lib/api/app-request-context";
import { getAuthSession } from "@/lib/auth/role";

/** Session headers so GET /api/clients can scope the list by role. */
export function buildClientsRequestHeaders(): Record<string, string> {
  const session = getAuthSession();
  return buildAppAuthHeaders(
    session?.token,
    session?.role ?? null,
    session?.user.userId ?? 0,
    undefined,
    session?.user.roleId
  );
}
