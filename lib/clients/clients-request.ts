import { unwrapPagedClients } from "@/lib/api/clients";
import { buildAppAuthHeaders } from "@/lib/api/app-request-context";
import { getAuthSession } from "@/lib/auth/role";
import { LOOKUP_PAGE_SIZE, type PagedList } from "@/lib/types/paged-list";
import type { Client } from "@/lib/types/client";

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

export function clientsApiUrl(pageNum = 1, pageSize = LOOKUP_PAGE_SIZE): string {
  return `/api/clients?pageNum=${pageNum}&pageSize=${pageSize}`;
}

export function parseClientsPage(payload: unknown): PagedList<Client> {
  return unwrapPagedClients(payload);
}

export function parseClientsPayload(payload: unknown): Client[] {
  return parseClientsPage(payload).items;
}
