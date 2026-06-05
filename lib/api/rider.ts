import { API_BASE_URL, API_ROUTES } from "@/lib/api/config";
import { apiDelete, apiGet } from "@/lib/api/http";
import { parseApiErrorMessage } from "@/lib/api/errors";
import type { Rider } from "@/lib/types/rider";

export async function getAllRiders(): Promise<Rider[]> {
  return apiGet<Rider[]>(API_ROUTES.riders);
}

export async function getRiderById(riderId: number): Promise<Rider> {
  return apiGet<Rider>(API_ROUTES.riderById(riderId));
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
    const data = JSON.parse(text) as CreateRiderResult;
    return {
      riderId: data.riderId,
      message: data.message ?? successMessage,
    };
  } catch {
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
  const data = await apiDelete<{ message?: string }>(API_ROUTES.riderById(riderId));
  return data.message ?? "Rider deleted successfully";
}
