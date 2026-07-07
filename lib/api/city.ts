import { API_BASE_URL, API_ROUTES } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { apiGet } from "@/lib/api/http";
import { parseApiErrorMessage } from "@/lib/api/errors";
import type {
  BulkUploadCitiesResult,
  BulkUploadCitiesStats,
  City,
  CityApiResponse,
  CreateCityPayload,
  UpdateCityPayload,
} from "@/lib/types/city";

function unwrapCities(response: CityApiResponse<City[]> | City[]): City[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (response.success === false) {
    throw new ApiError(
      parseApiErrorMessage(response, "Failed to fetch cities"),
      500,
      response
    );
  }

  return Array.isArray(response.data) ? response.data : [];
}

async function parseCityMutationResponse(
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

  if (text === "true") return successMessage;
  if (text === "false") {
    throw new ApiError(`${fallbackError}: request was not applied`, response.status, text);
  }

  if (!text) return successMessage;

  try {
    const data = JSON.parse(text) as CityApiResponse<boolean | string | null>;

    if (data.success === false) {
      throw new ApiError(
        parseApiErrorMessage(data, fallbackError),
        response.status,
        data
      );
    }

    if (data.data === false) {
      throw new ApiError(`${fallbackError}: request was not applied`, response.status, data);
    }

    if (typeof data.message === "string" && data.message) {
      return data.message;
    }

    return successMessage;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    return text || successMessage;
  }
}

async function postCityJson(path: string, payload: CreateCityPayload): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  return parseCityMutationResponse(response, "Create city failed", "City created successfully");
}

async function putCityJson(
  cityId: number,
  payload: UpdateCityPayload
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${API_ROUTES.updateCity(cityId)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  return parseCityMutationResponse(response, "Update city failed", "City updated successfully");
}

async function deleteCityRequest(cityId: number): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${API_ROUTES.deleteCity(cityId)}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  return parseCityMutationResponse(response, "Delete city failed", "City deleted successfully");
}

export async function getAllCities(): Promise<City[]> {
  const response = await apiGet<CityApiResponse<City[]> | City[]>(API_ROUTES.cities);
  return unwrapCities(response);
}

export async function searchCities(keyword: string): Promise<City[]> {
  const query = keyword.trim();
  if (!query) return getAllCities();
  const response = await apiGet<CityApiResponse<City[]> | City[]>(API_ROUTES.searchCities(query));
  return unwrapCities(response);
}

export async function createCity(payload: CreateCityPayload): Promise<string> {
  return postCityJson(API_ROUTES.createCity, payload);
}

export async function updateCity(cityId: number, payload: UpdateCityPayload): Promise<string> {
  return putCityJson(cityId, payload);
}

export async function deleteCity(cityId: number): Promise<string> {
  return deleteCityRequest(cityId);
}

function parseBulkUploadCitiesStats(data: unknown): BulkUploadCitiesStats | null {
  if (!data || typeof data !== "object") return null;

  const record = data as Record<string, unknown>;
  const totalRows = Number(record.totalRows);
  const successRows = Number(record.successRows);
  const failedRows = Number(record.failedRows);
  const errors = Array.isArray(record.errors)
    ? record.errors.filter((entry): entry is string => typeof entry === "string" && Boolean(entry))
    : [];

  if (!Number.isFinite(totalRows) && !Number.isFinite(successRows) && !Number.isFinite(failedRows)) {
    return null;
  }

  return {
    totalRows: Number.isFinite(totalRows) ? totalRows : 0,
    successRows: Number.isFinite(successRows) ? successRows : 0,
    failedRows: Number.isFinite(failedRows) ? failedRows : 0,
    errors,
  };
}

function formatBulkUploadCitiesMessage(
  payload: CityApiResponse<unknown>,
  stats: BulkUploadCitiesStats | null,
  fallback: string
): string {
  if (typeof payload.message === "string" && payload.message) {
    return payload.message;
  }

  if (stats) {
    if (stats.failedRows > 0) {
      const errorSummary = stats.errors.length > 0 ? ` ${stats.errors.join(" ")}` : "";
      return `${stats.successRows} of ${stats.totalRows} cities imported. ${stats.failedRows} row(s) failed.${errorSummary}`;
    }

    if (stats.successRows > 0) {
      return `${stats.successRows} city/cities imported successfully.`;
    }
  }

  return fallback;
}

/** POST /api/Admin/BulkUploadCities (multipart: file) */
export async function bulkUploadCities(file: Blob, fileName: string): Promise<BulkUploadCitiesResult> {
  const formData = new FormData();
  formData.append("file", file, fileName);

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.bulkUploadCities}`, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  const text = await response.text();
  let payload: CityApiResponse<unknown> = {};

  try {
    payload = text ? (JSON.parse(text) as CityApiResponse<unknown>) : {};
  } catch {
    if (!response.ok) {
      throw new ApiError(text || "Bulk city import failed", response.status, text);
    }
    return { message: text || "Cities imported successfully" };
  }

  if (!response.ok || payload.success === false) {
    throw new ApiError(
      parseApiErrorMessage(payload, "Bulk city import failed"),
      response.status,
      payload
    );
  }

  if (payload.data === false) {
    throw new ApiError("Bulk city import was not applied", response.status, payload);
  }

  const stats = parseBulkUploadCitiesStats(payload.data);

  if (stats && stats.failedRows > 0 && stats.successRows === 0) {
    throw new ApiError(
      formatBulkUploadCitiesMessage(payload, stats, "Bulk city import failed"),
      400,
      payload
    );
  }

  return {
    message: formatBulkUploadCitiesMessage(
      payload,
      stats,
      "Cities imported successfully"
    ),
    stats,
  };
}
