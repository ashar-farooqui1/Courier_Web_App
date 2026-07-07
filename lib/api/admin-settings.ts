import { API_BASE_URL, API_ROUTES } from "@/lib/api/config";
import { ApiError, apiGet } from "@/lib/api/http";
import { parseApiErrorMessage } from "@/lib/api/errors";
import type { AdminSettings, UpdateAdminSettingsPayload } from "@/lib/types/admin-settings";

interface AdminSettingsApiResponse {
  success?: boolean;
  Success?: boolean;
  message?: string | null;
  Message?: string | null;
  data?: AdminSettings | null;
  Data?: AdminSettings | null;
  details?: unknown;
  Details?: unknown;
}

function unwrapAdminSettings(
  response: AdminSettingsApiResponse | AdminSettings
): AdminSettings {
  if ("settingId" in response && typeof response.settingId === "number") {
    return response;
  }

  const data = response.data ?? response.Data;
  if (data && typeof data === "object" && "settingId" in data) {
    return data;
  }

  throw new ApiError("Admin settings not found", 404, response);
}

function readApiSuccess(payload: AdminSettingsApiResponse): boolean | undefined {
  if (typeof payload.success === "boolean") return payload.success;
  if (typeof payload.Success === "boolean") return payload.Success;
  return undefined;
}

function readApiMessage(payload: AdminSettingsApiResponse, fallback: string): string {
  if (typeof payload.message === "string" && payload.message) return payload.message;
  if (typeof payload.Message === "string" && payload.Message) return payload.Message;
  return fallback;
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const response = await apiGet<AdminSettingsApiResponse | AdminSettings>(
    API_ROUTES.adminSettings
  );
  return unwrapAdminSettings(response);
}

export async function updateAdminSettings(
  payload: UpdateAdminSettingsPayload
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${API_ROUTES.adminSettings}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await response.text();
  let body: AdminSettingsApiResponse = {};

  if (text.trim()) {
    try {
      body = JSON.parse(text) as AdminSettingsApiResponse;
    } catch {
      body = {};
    }
  }

  const apiSuccess = readApiSuccess(body);
  if (!response.ok || apiSuccess === false) {
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to update admin settings (${response.status})`),
      response.status,
      body
    );
  }

  return readApiMessage(body, "Settings saved successfully");
}
