import { API_ROUTES } from "@/lib/api/config";
import { apiDelete, apiGet, apiPostForm, apiPutForm } from "@/lib/api/http";
import { parseApiErrorMessage } from "@/lib/api/errors";
import type { Admin, UpdateAdminPayload } from "@/types/admin";

export async function getAllAdmins(): Promise<Admin[]> {
  return apiGet<Admin[]>(API_ROUTES.admins);
}

export async function getAdminById(adminId: number): Promise<Admin> {
  return apiGet<Admin>(API_ROUTES.adminById(adminId));
}

function buildAdminFormData(payload: UpdateAdminPayload): FormData {
  const formData = new FormData();
  formData.append("AdminName", payload.AdminName);
  formData.append("CNIC", payload.CNIC);
  formData.append("ContactNumber", payload.ContactNumber);
  formData.append("AdminEmail", payload.AdminEmail);
  formData.append("Designation", payload.Designation);
  formData.append("RoleId", String(payload.RoleId));
  if (payload.AdminImage) {
    formData.append("AdminImage", payload.AdminImage);
  }
  return formData;
}

export async function updateAdminFormData(
  adminId: number,
  formData: FormData
): Promise<string> {
  try {
    const data = await apiPutForm<{ message?: string }>(
      API_ROUTES.adminById(adminId),
      formData
    );
    return data.message ?? "Admin updated successfully";
  } catch (err) {
    throw toAdminError(err, "Failed to update admin");
  }
}

export async function updateAdmin(
  adminId: number,
  payload: UpdateAdminPayload
): Promise<string> {
  return updateAdminFormData(adminId, buildAdminFormData(payload));
}

export interface CreateAdminResult {
  adminId: number;
  message?: string;
}

export async function deleteAdmin(adminId: number): Promise<string> {
  try {
    const data = await apiDelete<{ message?: string }>(API_ROUTES.adminById(adminId));
    return data.message ?? "Admin deleted successfully";
  } catch (err) {
    throw toAdminError(err, "Failed to delete admin");
  }
}

export async function createAdminFormData(formData: FormData): Promise<CreateAdminResult> {
  try {
    const data = await apiPostForm<{ adminId?: number; message?: string }>(
      API_ROUTES.createAdmin,
      formData
    );
    if (typeof data.adminId !== "number") {
      throw new Error("Invalid response from server");
    }
    return { adminId: data.adminId, message: data.message };
  } catch (err) {
    throw toAdminError(err, "Failed to create admin");
  }
}

function toAdminError(err: unknown, fallback: string): Error & { status: number } {
  if (err && typeof err === "object" && "status" in err && "body" in err) {
    const apiErr = err as { status: number; body?: unknown; message: string };
    const message = parseApiErrorMessage(apiErr.body, apiErr.message || fallback);
    const error = new Error(message) as Error & { status: number };
    error.status = apiErr.status;
    return error;
  }
  if (err instanceof Error) {
    const error = err as Error & { status: number };
    error.status = error.status ?? 500;
    return error;
  }
  const error = new Error(fallback) as Error & { status: number };
  error.status = 500;
  return error;
}
