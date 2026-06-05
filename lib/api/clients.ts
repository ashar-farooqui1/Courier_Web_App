import { API_ROUTES } from '@/lib/api/config';
import { apiDelete, apiGet, apiPostForm, apiPutForm } from '@/lib/api/http';
import type { Client } from '@/lib/types/client';
import type { CreateClientResponse } from '@/lib/types/create-client';

export async function getClients(): Promise<Client[]> {
  return apiGet<Client[]>(API_ROUTES.clients);
}

export async function getClientById(clientId: number): Promise<Client> {
  return apiGet<Client>(API_ROUTES.clientById(clientId));
}

export async function createClient(formData: FormData): Promise<CreateClientResponse> {
  return apiPostForm<CreateClientResponse>(API_ROUTES.createClient, formData);
}

export async function updateClient(
  clientId: number,
  formData: FormData
): Promise<CreateClientResponse> {
  return apiPutForm<CreateClientResponse>(API_ROUTES.clientById(clientId), formData);
}

export async function deleteClient(clientId: number): Promise<CreateClientResponse> {
  return apiDelete<CreateClientResponse>(API_ROUTES.clientById(clientId));
}
