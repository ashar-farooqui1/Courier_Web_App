import type { Client } from '@/lib/types/client';

export interface ClientSearchFilters {
  clientId: string;
  clientName: string;
  pocNumber: string;
  clientEmail: string;
  contactNumber: string;
}

export const emptyClientSearchFilters: ClientSearchFilters = {
  clientId: '',
  clientName: '',
  pocNumber: '',
  clientEmail: '',
  contactNumber: '',
};

function clientSearchableText(client: Client): string {
  return [
    client.clientId,
    client.clientCode,
    client.status,
    client.brandName,
    client.clientName,
    client.pocNumber,
    client.contactNumber,
    client.clientEmail,
    client.clientBillingAddress,
    client.clientPickupAddress,
    client.baseTown,
    client.city,
    client.defaultPickingRiderId,
    client.services,
    client.arrivalAt,
  ]
    .map((value) => String(value ?? '').toLowerCase())
    .join(' ');
}

function matchesQuery(client: Client, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return clientSearchableText(client).includes(q);
}

export function hasActiveClientFilters(filters: ClientSearchFilters): boolean {
  return Object.values(filters).some((value) => value.trim() !== '');
}

/** Each filled filter must match somewhere on the client (AND across filters). */
export function filterClients(clients: Client[], filters: ClientSearchFilters): Client[] {
  const queries = [
    filters.clientId,
    filters.clientName,
    filters.pocNumber,
    filters.clientEmail,
    filters.contactNumber,
  ].map((q) => q.trim()).filter(Boolean);

  if (queries.length === 0) return clients;

  return clients.filter((client) => queries.every((query) => matchesQuery(client, query)));
}
