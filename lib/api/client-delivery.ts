import { API_BASE_URL, API_ROUTES } from '@/lib/api/config';
import { ApiError, apiGet } from '@/lib/api/http';
import { parseApiErrorMessage } from '@/lib/api/errors';
import type {
  ClientDeliverySettings,
  ClientPricingEntry,
  SaveDeliveryChargePayload,
  SaveDeliverySettingsPayload,
} from '@/lib/types/client-delivery';
import { normalizeDeliverySettings } from '@/lib/clients/delivery-charges-form';

interface ApiDataResponse<T> {
  success?: boolean;
  message?: string | null;
  data?: T;
  details?: unknown;
}

function unwrapData<T>(response: ApiDataResponse<T> | T): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ApiDataResponse<T>).data as T;
  }

  return response as T;
}

async function parseMutationResponse(
  response: Response,
  fallbackError: string,
  successMessage: string
): Promise<string> {
  const text = await response.text();
  let body: ApiDataResponse<unknown> = {};

  if (text.trim()) {
    try {
      body = JSON.parse(text) as ApiDataResponse<unknown>;
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

export async function getClientPricing(clientId: number): Promise<ClientPricingEntry[]> {
  const response = await apiGet<ApiDataResponse<ClientPricingEntry[]> | ClientPricingEntry[]>(
    API_ROUTES.clientPricing(clientId)
  );
  const data = unwrapData(response);
  return Array.isArray(data) ? data : [];
}

export async function getDeliverySettings(clientId: number): Promise<ClientDeliverySettings | null> {
  const response = await apiGet<
    ApiDataResponse<ClientDeliverySettings> | ClientDeliverySettings
  >(API_ROUTES.clientDeliverySettings(clientId));
  const data = unwrapData(response);
  return normalizeDeliverySettings(data);
}

export async function saveDeliveryCharge(payload: SaveDeliveryChargePayload): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${API_ROUTES.saveDeliveryCharges}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  return parseMutationResponse(response, 'Failed to save delivery charges', 'Delivery charges saved');
}

export async function saveDeliverySettings(
  payload: SaveDeliverySettingsPayload
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${API_ROUTES.saveDeliverySettings}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  return parseMutationResponse(response, 'Failed to save delivery settings', 'Delivery settings saved');
}
