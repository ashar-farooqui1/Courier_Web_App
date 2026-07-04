import { API_BASE_URL, API_ROUTES } from '@/lib/api/config';
import { ApiError, apiGet, apiPostForm } from '@/lib/api/http';
import { parseApiErrorMessage } from '@/lib/api/errors';
import type { Client, UpdateClientPayload } from '@/lib/types/client';
import type { CreateClientResponse } from '@/lib/types/create-client';
import type { OnboardClientRequest, OnboardClientResponse } from '@/lib/types/onboard-client';

interface ClientsApiResponse<T> {
  success?: boolean;
  message?: string | null;
  data?: T;
  details?: unknown;
}

function unwrapClientsList(response: ClientsApiResponse<Client[]> | Client[]): Client[] {
  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response.data) ? response.data : [];
}

function unwrapClient(response: ClientsApiResponse<Client> | Client): Client {
  if ('clientId' in response && typeof response.clientId === 'number') {
    return response;
  }

  if ('data' in response) {
    const client = response.data;
    if (client && typeof client === 'object' && 'clientId' in client) {
      return client;
    }
  }

  throw new ApiError('Client not found', 404, response);
}

async function parseClientMutationResponse(
  response: Response,
  fallbackError: string,
  successMessage: string
): Promise<string> {
  const text = await response.text();
  let body: ClientsApiResponse<unknown> = {};

  if (text.trim()) {
    try {
      body = JSON.parse(text) as ClientsApiResponse<unknown>;
    } catch {
      body = {};
    }
  }

  if (!response.ok || body.success === false) {
    throw new ApiError(
      parseApiErrorMessage(body, `${fallbackError} (${response.status})`),
      response.status,
      body
    );
  }

  return body.message ?? successMessage;
}

export async function getClients(): Promise<Client[]> {
  const response = await apiGet<ClientsApiResponse<Client[]> | Client[]>(API_ROUTES.clients);
  return unwrapClientsList(response);
}

export async function getClientById(clientId: number): Promise<Client> {
  const response = await apiGet<ClientsApiResponse<Client> | Client>(
    API_ROUTES.clientById(clientId)
  );
  return unwrapClient(response);
}

export async function createClient(formData: FormData): Promise<CreateClientResponse> {
  return apiPostForm<CreateClientResponse>(API_ROUTES.createClient, formData);
}

export async function updateClient(
  clientId: number,
  payload: UpdateClientPayload
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${API_ROUTES.clientById(clientId)}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  return parseClientMutationResponse(response, 'Failed to update client', 'Client updated successfully');
}

export async function deleteClient(clientId: number): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${API_ROUTES.clientById(clientId)}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  return parseClientMutationResponse(response, 'Failed to delete client', 'Client deleted successfully');
}

interface OnboardApiResponse {
  success?: boolean;
  message?: string | null;
  data?: { clientId?: number } | number | null;
  clientId?: number;
  details?: unknown;
}

function extractOnboardClientId(payload: OnboardApiResponse): number | undefined {
  if (typeof payload.clientId === 'number') {
    return payload.clientId;
  }

  if (typeof payload.data === 'number') {
    return payload.data;
  }

  if (payload.data && typeof payload.data === 'object' && 'clientId' in payload.data) {
    const clientId = payload.data.clientId;
    return typeof clientId === 'number' ? clientId : undefined;
  }

  return undefined;
}

export async function onboardClient(payload: OnboardClientRequest): Promise<OnboardClientResponse> {
  const response = await fetch(`${API_BASE_URL}${API_ROUTES.onboardClient}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const text = await response.text();
  let body: OnboardApiResponse = {};

  if (text.trim()) {
    try {
      body = JSON.parse(text) as OnboardApiResponse;
    } catch {
      body = {};
    }
  }

  if (!response.ok || body.success === false) {
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to onboard client (${response.status})`),
      response.status,
      body
    );
  }

  return {
    message: body.message ?? 'Client onboarded successfully',
    clientId: extractOnboardClientId(body),
  };
}

export async function uploadClientLogo(clientId: number, logoFile: File): Promise<void> {
  const formData = new FormData();
  formData.append('logo', logoFile);

  await apiPostForm(API_ROUTES.uploadClientLogo(clientId), formData);
}
