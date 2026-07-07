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
  Success?: boolean;
  message?: string | null;
  Message?: string | null;
  data?: unknown;
  Data?: unknown;
  clientId?: number;
  ClientId?: number;
  details?: unknown;
  Details?: unknown;
}

function pickPositiveInt(value: unknown): number | undefined {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }
  return undefined;
}

function pickClientIdFromRecord(record: Record<string, unknown>): number | undefined {
  for (const key of ['clientId', 'ClientId', 'id', 'Id']) {
    const clientId = pickPositiveInt(record[key]);
    if (clientId) return clientId;
  }
  return undefined;
}

function extractOnboardClientId(payload: OnboardApiResponse): number | undefined {
  const record = payload as Record<string, unknown>;

  const topLevel = pickClientIdFromRecord(record);
  if (topLevel) return topLevel;

  const data = payload.data ?? payload.Data;
  if (typeof data === 'number' || typeof data === 'string') {
    const clientId = pickPositiveInt(data);
    if (clientId) return clientId;
  }

  if (data && typeof data === 'object') {
    const fromData = pickClientIdFromRecord(data as Record<string, unknown>);
    if (fromData) return fromData;

    const nested = (data as Record<string, unknown>).client ?? (data as Record<string, unknown>).Client;
    if (nested && typeof nested === 'object') {
      const fromNested = pickClientIdFromRecord(nested as Record<string, unknown>);
      if (fromNested) return fromNested;
    }
  }

  const details = payload.details ?? payload.Details;
  if (details && typeof details === 'object') {
    const fromDetails = pickClientIdFromRecord(details as Record<string, unknown>);
    if (fromDetails) return fromDetails;
  }

  return undefined;
}

function readApiSuccess(payload: OnboardApiResponse): boolean | undefined {
  if (typeof payload.success === 'boolean') return payload.success;
  if (typeof payload.Success === 'boolean') return payload.Success;
  return undefined;
}

function readApiMessage(payload: OnboardApiResponse, fallback: string): string {
  if (typeof payload.message === 'string' && payload.message) return payload.message;
  if (typeof payload.Message === 'string' && payload.Message) return payload.Message;
  return fallback;
}

function normalizeLookupValue(value: string): string {
  return value.trim().toLowerCase();
}

async function resolveOnboardedClientId(
  payload: OnboardClientRequest,
  body: OnboardApiResponse
): Promise<number | undefined> {
  const fromResponse = extractOnboardClientId(body);
  if (fromResponse) return fromResponse;

  const clientName = normalizeLookupValue(payload.client.clientName);
  const clientEmail = normalizeLookupValue(payload.client.clientEmail);
  const brandName = normalizeLookupValue(payload.client.brandName);

  const clients = await getClients();
  const strictMatches = clients.filter(
    (client) =>
      normalizeLookupValue(client.clientName) === clientName &&
      normalizeLookupValue(client.clientEmail) === clientEmail &&
      normalizeLookupValue(client.brandName) === brandName
  );

  const matches =
    strictMatches.length > 0
      ? strictMatches
      : clients.filter(
          (client) =>
            normalizeLookupValue(client.clientName) === clientName &&
            normalizeLookupValue(client.clientEmail) === clientEmail
        );

  if (matches.length === 0) return undefined;

  return Math.max(...matches.map((client) => client.clientId));
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

  const apiSuccess = readApiSuccess(body);
  if (!response.ok || apiSuccess === false) {
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to onboard client (${response.status})`),
      response.status,
      body
    );
  }

  const clientId = await resolveOnboardedClientId(payload, body);

  return {
    message: readApiMessage(body, 'Client onboarded successfully'),
    clientId,
  };
}

export async function uploadClientLogo(clientId: number, logoFile: File): Promise<void> {
  const formData = new FormData();
  formData.append('logo', logoFile);

  await apiPostForm(API_ROUTES.uploadClientLogo(clientId), formData);
}

export interface UploadClientDocumentsInput {
  logo?: File | null;
  cnicFront?: File | null;
  cnicBack?: File | null;
  blankCheque?: File | null;
}

export async function uploadClientDocuments(
  clientId: number,
  files: UploadClientDocumentsInput
): Promise<string> {
  const formData = new FormData();

  if (files.logo) formData.append('Logo', files.logo);
  if (files.cnicFront) formData.append('CnicFront', files.cnicFront);
  if (files.cnicBack) formData.append('CnicBack', files.cnicBack);
  if (files.blankCheque) formData.append('BlankCheque', files.blankCheque);

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.uploadClientDocuments(clientId)}`, {
    method: 'POST',
    body: formData,
    cache: 'no-store',
  });

  return parseClientMutationResponse(
    response,
    'Failed to upload client documents',
    'Client documents uploaded successfully'
  );
}
