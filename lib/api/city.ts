import { API_BASE_URL, API_ROUTES } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { apiGet } from "@/lib/api/http";
import { parseApiErrorMessage } from "@/lib/api/errors";
import type { City, CreateCityPayload } from "@/lib/types/city";

async function parseCityMutationResponse(
  response: Response,
  fallbackError: string,
  successMessage: string
): Promise<string> {
  const text = await response.text();

  if (!response.ok) {
    let body: unknown = text;
    try {
      body = JSON.parse(text);
    } catch {
      /* plain text */
    }
    throw new ApiError(
      parseApiErrorMessage(body, `${fallbackError} (${response.status})`),
      response.status,
      body
    );
  }

  if (text === "true") return successMessage;
  if (text === "false") {
    throw new ApiError(`${fallbackError}: update was not applied`, response.status, text);
  }

  try {
    const data = JSON.parse(text) as { message?: string };
    return data.message ?? successMessage;
  } catch {
    return successMessage;
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
  payload: CreateCityPayload
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
  return apiGet<City[]>(API_ROUTES.cities);
}

export async function searchCities(keyword: string): Promise<City[]> {
  const query = keyword.trim();
  if (!query) return getAllCities();
  return apiGet<City[]>(API_ROUTES.searchCities(query));
}

export async function createCity(payload: CreateCityPayload): Promise<string> {
  return postCityJson(API_ROUTES.createCity, payload);
}

export async function updateCity(cityId: number, payload: CreateCityPayload): Promise<string> {
  return putCityJson(cityId, payload);
}

export async function deleteCity(cityId: number): Promise<string> {
  return deleteCityRequest(cityId);
}
