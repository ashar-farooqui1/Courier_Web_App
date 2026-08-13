import { API_ROUTES } from '@/lib/api/config';
import { apiGet, apiPostJson } from '@/lib/api/http';
import type {
  PickupType,
  SaveZoneCourierPayload,
  SaveZoneCourierResponse,
  ZoneCourierItem,
  ZoneCourierMapping,
} from '@/lib/types/zone-courier';

interface ClientZoneCouriersApiResponse {
  success?: boolean;
  message?: string | null;
  data?: unknown;
  details?: unknown;
}

export interface ClientZoneCouriersResult {
  pickupType: PickupType | null;
  zones: ZoneCourierMapping[];
}

function normalizePickupType(value: unknown): PickupType | null {
  return value === 'Stallionex' || value === 'ThirdPartyLogistics' ? value : null;
}

function pickNumber(record: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = Number(record[key]);
    if (Number.isFinite(value)) return value;
  }
  return 0;
}

function normalizeZoneCourierItem(raw: unknown): ZoneCourierItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const courierId = pickNumber(record, ['courierId', 'CourierId']);
  if (!courierId) return null;

  return {
    courierId,
    priority: pickNumber(record, ['priority', 'Priority']),
  };
}

function normalizeZoneCourierMapping(raw: unknown): ZoneCourierMapping | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const zoneId = pickNumber(record, ['zoneId', 'ZoneId']);
  if (!zoneId) return null;

  const rawCouriers = record.couriers ?? record.Couriers;
  const couriers = Array.isArray(rawCouriers)
    ? rawCouriers
        .map(normalizeZoneCourierItem)
        .filter((item): item is ZoneCourierItem => item !== null)
    : [];

  return { zoneId, couriers };
}

/**
 * GET /api/Client/GetClientZoneCouriers?clientId={clientId}
 *
 * The backend nests the zone list under `data.zones` (with `data.pickupType` alongside
 * it), not directly under `data` — plain `data` is an object here, not an array.
 */
export async function getClientZoneCouriers(clientId: number): Promise<ClientZoneCouriersResult> {
  const response = await apiGet<ClientZoneCouriersApiResponse | ZoneCourierMapping[]>(
    API_ROUTES.clientZoneCouriers(clientId)
  );

  const data = Array.isArray(response) ? response : response.data;

  const rawZones = Array.isArray(data)
    ? data
    : data && typeof data === 'object'
      ? (data as Record<string, unknown>).zones
      : undefined;

  const pickupType =
    data && typeof data === 'object' && !Array.isArray(data)
      ? normalizePickupType((data as Record<string, unknown>).pickupType)
      : null;

  const zones = Array.isArray(rawZones)
    ? rawZones
        .map(normalizeZoneCourierMapping)
        .filter((mapping): mapping is ZoneCourierMapping => mapping !== null)
    : [];

  return { pickupType, zones };
}

/** POST /api/Client/SaveZoneCouriers */
export async function saveClientZoneCouriers(
  payload: SaveZoneCourierPayload
): Promise<SaveZoneCourierResponse> {
  const response = await apiPostJson<{ success?: boolean; message?: string | null }>(
    API_ROUTES.saveZoneCouriers,
    payload
  );

  return {
    success: response.success ?? true,
    message: response.message ?? 'Zone courier priorities saved successfully',
  };
}
