import { API_BASE_URL, API_ROUTES } from '@/lib/api/config';
import { ApiError } from '@/lib/api/http';
import { parseApiErrorMessage } from '@/lib/api/errors';
import type {
  CreatePickupLocationPayload,
  PickupLocation,
  UpdatePickupLocationPayload,
} from '@/lib/types/pickup-location';

interface PickupLocationsApiResponse {
  success?: boolean;
  message?: string | null;
  data?: unknown[];
  details?: unknown;
}

function unwrapPickupLocations(
  response: PickupLocationsApiResponse | unknown[]
): unknown[] {
  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response.data) ? response.data : [];
}

async function parsePickupMutationResponse(
  response: Response,
  fallbackError: string,
  successMessage: string
): Promise<string> {
  const text = await response.text();

  if (!response.ok) {
    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : text;
    } catch {
      /* plain text or empty */
    }
    throw new ApiError(
      parseApiErrorMessage(body, `${fallbackError} (${response.status})`),
      response.status,
      body
    );
  }

  if (text === 'true') return successMessage;
  if (text === 'false') {
    throw new ApiError(`${fallbackError}: request was not applied`, response.status, text);
  }

  if (!text) return successMessage;

  try {
    const data = JSON.parse(text) as {
      message?: string | null;
      success?: boolean;
    };

    if (data.success === false) {
      throw new ApiError(
        parseApiErrorMessage(data, fallbackError),
        response.status,
        data
      );
    }

    return data.message ?? successMessage;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    return text || successMessage;
  }
}

function pickString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string') return value;
  }
  return '';
}

function pickNumber(record: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = Number(record[key]);
    if (Number.isFinite(value)) return value;
  }
  return 0;
}

function pickBoolean(record: Record<string, unknown>, keys: string[]): boolean {
  for (const key of keys) {
    const value = record[key];
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
  }
  return false;
}

export function normalizePickupLocation(raw: unknown): PickupLocation | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const pickupLocationId = pickNumber(record, ['pickupLocationId', 'PickupLocationId']);

  if (!pickupLocationId) return null;

  return {
    pickupLocationId,
    clientId: pickNumber(record, ['clientId', 'ClientId']),
    brandName: pickString(record, ['brandName', 'BrandName']) || undefined,
    contactPerson: pickString(record, ['contactPerson', 'ContactPerson']),
    contactPhone: pickString(record, ['contactPhone', 'ContactPhone']),
    locationName: pickString(record, ['locationName', 'LocationName']),
    address: pickString(record, ['address', 'Address']),
    area: pickString(record, ['area', 'Area']),
    cityId: pickNumber(record, ['cityId', 'CityId']),
    cityName: pickString(record, ['cityName', 'CityName']) || undefined,
    isDefault: pickBoolean(record, ['isDefault', 'IsDefault']),
  };
}

async function fetchPickupLocations(path: string): Promise<PickupLocation[]> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  const text = await response.text();

  if (!response.ok) {
    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : text;
    } catch {
      /* plain text or empty */
    }
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to fetch pickup locations (${response.status})`),
      response.status,
      body
    );
  }

  if (!text) return [];

  try {
    const data = JSON.parse(text) as PickupLocationsApiResponse | unknown[];
    return unwrapPickupLocations(data)
      .map(normalizePickupLocation)
      .filter((location): location is PickupLocation => location !== null);
  } catch {
    return [];
  }
}

/** GET /api/Client/GetPickupLocations?ClientId={clientId} */
export async function getPickupLocationsByClientId(
  clientId: number
): Promise<PickupLocation[]> {
  return fetchPickupLocations(API_ROUTES.clientPickupLocations(clientId));
}

export async function addPickupLocation(
  payload: CreatePickupLocationPayload
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${API_ROUTES.addPickupLocation}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(buildPickupLocationBody(payload)),
    cache: 'no-store',
  });

  return parsePickupMutationResponse(
    response,
    'Failed to add pickup location',
    'Pickup location added successfully'
  );
}

function buildPickupLocationBody(payload: CreatePickupLocationPayload) {
  return {
    clientId: payload.clientId,
    brandName: payload.brandName,
    contactPerson: payload.contactPerson,
    contactPhone: payload.contactPhone,
    locationName: payload.locationName,
    address: payload.address,
    area: payload.area,
    cityId: payload.cityId,
    isDefault: payload.isDefault,
  };
}

/** PUT /api/Client/UpdatePickupLocations?pickupLocationId={id} */
export async function updatePickupLocation(
  pickupLocationId: number,
  payload: UpdatePickupLocationPayload
): Promise<string> {
  const response = await fetch(
    `${API_BASE_URL}${API_ROUTES.updatePickupLocation(pickupLocationId)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(buildPickupLocationBody(payload)),
      cache: 'no-store',
    }
  );

  return parsePickupMutationResponse(
    response,
    'Failed to update pickup location',
    'Pickup location updated successfully'
  );
}

/** DELETE /api/Client/DeletePickupLocations?PickupId={pickupLocationId} */
export async function deletePickupLocation(pickupLocationId: number): Promise<string> {
  const response = await fetch(
    `${API_BASE_URL}${API_ROUTES.deletePickupLocation(pickupLocationId)}`,
    {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    }
  );

  return parsePickupMutationResponse(
    response,
    'Failed to delete pickup location',
    'Pickup location deleted successfully'
  );
}
