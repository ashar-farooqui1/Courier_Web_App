import { API_BASE_URL, API_ROUTES } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { apiGet } from "@/lib/api/http";
import { parseApiErrorMessage } from "@/lib/api/errors";
import type { Rider } from "@/lib/types/rider";

interface RiderApiResponse<T> {
  success?: boolean;
  message?: string | null;
  data?: T;
  details?: unknown;
}

function unwrapRiders(response: RiderApiResponse<Rider[]> | Rider[]): Rider[] {
  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response.data) ? response.data : [];
}

function unwrapRider(response: RiderApiResponse<Rider> | Rider): Rider {
  if ("riderId" in response && typeof response.riderId === "number") {
    return response;
  }

  if ("data" in response) {
    const rider = response.data;
    if (rider && typeof rider === "object" && "riderId" in rider) {
      return rider;
    }
  }

  throw new ApiError("Rider not found", 404, response);
}

export async function getAllRiders(): Promise<Rider[]> {
  const response = await apiGet<RiderApiResponse<Rider[]> | Rider[]>(API_ROUTES.riders);
  return unwrapRiders(response);
}

export async function getRiderById(riderId: number): Promise<Rider> {
  const response = await apiGet<RiderApiResponse<Rider> | Rider>(
    API_ROUTES.riderById(riderId)
  );
  return unwrapRider(response);
}

export interface CreateRiderResult {
  riderId?: number;
  message?: string;
}

async function parseMutationResponse(
  response: Response,
  fallbackError: string,
  successMessage: string
): Promise<{ message: string; riderId?: number }> {
  const text = await response.text();

  if (!response.ok) {
    let message = `${fallbackError} (${response.status})`;
    try {
      message = parseApiErrorMessage(JSON.parse(text), message);
    } catch {
      message = parseApiErrorMessage(text, message);
    }
    if (response.status === 500 && !text.trim()) {
      message =
        "Server could not update rider. Try uploading Image and License files, or contact backend support.";
    }
    const error = new Error(message) as Error & { status: number };
    error.status = response.status;
    throw error;
  }

  if (!text.trim()) {
    return { message: successMessage };
  }

  try {
    const data = JSON.parse(text) as CreateRiderResult & RiderApiResponse<unknown>;

    if (data.success === false) {
      const message = parseApiErrorMessage(data, fallbackError);
      const error = new Error(message) as Error & { status: number };
      error.status = response.status;
      throw error;
    }

    return {
      riderId: data.riderId,
      message: data.message ?? successMessage,
    };
  } catch (err) {
    if (err instanceof Error && "status" in err) {
      throw err;
    }
    return { message: successMessage };
  }
}

export async function createRiderFormData(formData: FormData): Promise<CreateRiderResult> {
  const response = await fetch(`${API_BASE_URL}${API_ROUTES.riders}`, {
    method: "POST",
    body: formData,
  });
  return parseMutationResponse(
    response,
    "Failed to create rider",
    "Rider created successfully"
  );
}

export async function updateRiderFormData(
  riderId: number,
  formData: FormData
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${API_ROUTES.riderById(riderId)}`, {
    method: "PUT",
    body: formData,
  });
  const result = await parseMutationResponse(
    response,
    "Failed to update rider",
    "Rider updated successfully"
  );
  return result.message;
}

export async function deleteRider(riderId: number): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${API_ROUTES.riderById(riderId)}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const text = await response.text();
  let body: RiderApiResponse<unknown> = {};

  if (text.trim()) {
    try {
      body = JSON.parse(text) as RiderApiResponse<unknown>;
    } catch {
      body = {};
    }
  }

  if (!response.ok || body.success === false) {
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to delete rider (${response.status})`),
      response.status,
      body
    );
  }

  return body.message ?? "Rider deleted successfully";
}
