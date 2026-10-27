import { API_ROUTES } from "@/lib/api/config";
import { ApiError, apiGet, apiPostJson } from "@/lib/api/http";
import { parseApiErrorMessage } from "@/lib/api/errors";
import type {
  CourierExternalLocation,
  CourierLocationApiResponse,
  CourierLocationMapping,
  CourierLocationSyncResult,
  CourierLocationSyncUnmatched,
  SetCourierLocationMappingPayload,
} from "@/lib/types/courier-location";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function pickNumber(record: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = Number(record[key]);
    if (Number.isFinite(value)) return value;
  }
  return 0;
}

function unwrapData<T>(
  response: CourierLocationApiResponse<T> | T,
  fallbackError: string
): T {
  if (response && typeof response === "object" && "success" in (response as object)) {
    const wrapped = response as CourierLocationApiResponse<T>;
    if (wrapped.success === false) {
      throw new ApiError(
        parseApiErrorMessage(wrapped, fallbackError),
        400,
        wrapped
      );
    }
    return wrapped.data as T;
  }

  return response as T;
}

function normalizeMapping(raw: unknown): CourierLocationMapping | null {
  const record = asRecord(raw);
  if (!record) return null;

  const cityId = pickNumber(record, ["cityId", "CityId"]);
  const externalLocationId = pickString(record, [
    "externalLocationId",
    "ExternalLocationId",
  ]);
  if (!cityId || !externalLocationId) return null;

  return {
    cityId,
    cityName: pickString(record, ["cityName", "CityName"]),
    courierCode: pickString(record, ["courierCode", "CourierCode"]),
    externalLocationId,
    externalLocationName: pickString(record, [
      "externalLocationName",
      "ExternalLocationName",
    ]),
  };
}

function normalizeExternalLocation(raw: unknown): CourierExternalLocation | null {
  const record = asRecord(raw);
  if (!record) return null;

  const externalLocationId = pickString(record, [
    "externalLocationId",
    "ExternalLocationId",
    "locationId",
    "LocationId",
  ]);
  if (!externalLocationId) return null;

  return {
    externalLocationId,
    externalLocationName: pickString(record, [
      "externalLocationName",
      "ExternalLocationName",
      "locationName",
      "LocationName",
    ]),
  };
}

function normalizeUnmatched(raw: unknown): CourierLocationSyncUnmatched | null {
  const record = asRecord(raw);
  if (!record) return null;

  const locationId = pickString(record, [
    "locationId",
    "LocationId",
    "externalLocationId",
    "ExternalLocationId",
  ]);
  if (!locationId) return null;

  return {
    locationId,
    locationName: pickString(record, [
      "locationName",
      "LocationName",
      "externalLocationName",
      "ExternalLocationName",
    ]),
    reason: pickString(record, ["reason", "Reason"]) || "Unmatched",
  };
}

function normalizeSyncResult(raw: unknown): CourierLocationSyncResult {
  const record = asRecord(raw) ?? {};
  const unmatchedRaw = record.unmatched ?? record.Unmatched;
  const unmatched = Array.isArray(unmatchedRaw)
    ? unmatchedRaw
        .map(normalizeUnmatched)
        .filter((item): item is CourierLocationSyncUnmatched => item !== null)
    : [];

  return {
    courierCode: pickString(record, ["courierCode", "CourierCode"]),
    totalLocations: pickNumber(record, ["totalLocations", "TotalLocations"]),
    matched: pickNumber(record, ["matched", "Matched"]),
    unmatched,
  };
}

/** GET /api/Admin/GetCourierLocationMappings?courierCode=… */
export async function getCourierLocationMappings(
  courierCode: string
): Promise<CourierLocationMapping[]> {
  const response = await apiGet<
    CourierLocationApiResponse<unknown> | unknown
  >(API_ROUTES.courierLocationMappings(courierCode));

  const data = unwrapData(response, "Failed to fetch courier location mappings");
  const list = Array.isArray(data) ? data : [];

  return list
    .map(normalizeMapping)
    .filter((item): item is CourierLocationMapping => item !== null);
}

/** POST /api/Admin/SyncCourierLocations */
export async function syncCourierLocations(
  courierCode: string
): Promise<CourierLocationSyncResult> {
  const response = await apiPostJson<CourierLocationApiResponse<unknown> | unknown>(
    API_ROUTES.syncCourierLocations,
    { courierCode }
  );

  const data = unwrapData(response, "Failed to sync courier locations");
  return normalizeSyncResult(data);
}

/** GET /api/Admin/GetCourierLocations?courierCode=… */
export async function getCourierLocations(
  courierCode: string
): Promise<CourierExternalLocation[]> {
  const response = await apiGet<
    CourierLocationApiResponse<unknown> | unknown
  >(API_ROUTES.courierLocations(courierCode));

  const data = unwrapData(response, "Failed to fetch courier locations");
  const list = Array.isArray(data) ? data : [];

  return list
    .map(normalizeExternalLocation)
    .filter((item): item is CourierExternalLocation => item !== null);
}

/** POST /api/Admin/SetCourierLocationMapping */
export async function setCourierLocationMapping(
  payload: SetCourierLocationMappingPayload
): Promise<CourierLocationMapping> {
  const response = await apiPostJson<CourierLocationApiResponse<unknown> | unknown>(
    API_ROUTES.setCourierLocationMapping,
    payload
  );

  const data = unwrapData(response, "Failed to save courier location mapping");
  const mapping = normalizeMapping(data);

  if (!mapping) {
    throw new ApiError("Invalid mapping response from server", 500, response);
  }

  return mapping;
}
