import { API_ROUTES } from "@/lib/api/config";
import { apiDelete, apiGet, apiPostForm, apiPostJson, apiPutForm } from "@/lib/api/http";
import { parseApiErrorMessage } from "@/lib/api/errors";
import type { Admin, UpdateAdminPayload } from "@/types/admin";

interface AdminsApiResponse {
  success?: boolean;
  message?: string | null;
  data?: Admin[];
  details?: unknown;
}

function unwrapAdmins(response: AdminsApiResponse | Admin[]): Admin[] {
  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response.data) ? response.data : [];
}

function normalizeAdmin(admin: Admin): Admin {
  return { ...admin, warehouses: Array.isArray(admin.warehouses) ? admin.warehouses : [] };
}

export async function getAllAdmins(): Promise<Admin[]> {
  const response = await apiGet<AdminsApiResponse | Admin[]>(API_ROUTES.admins);
  return unwrapAdmins(response).map(normalizeAdmin);
}

export async function getAdminById(adminId: number): Promise<Admin> {
  const admin = await apiGet<Admin>(API_ROUTES.adminById(adminId));
  return normalizeAdmin(admin);
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
  adminId?: number;
  message?: string;
}

interface CreateAdminApiResponse {
  success?: boolean;
  Success?: boolean;
  message?: string | null;
  Message?: string | null;
  adminId?: number | string;
  AdminId?: number | string;
  data?: unknown;
  Data?: unknown;
}

function readInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return null;
}

function readCreatedAdminId(data: CreateAdminApiResponse): number | undefined {
  const direct = readInteger(data.adminId) ?? readInteger(data.AdminId);
  if (direct !== null) return direct;

  const nested = data.data ?? data.Data;
  const nestedId = readInteger(nested);
  if (nestedId !== null) return nestedId;

  if (nested && typeof nested === "object") {
    const record = nested as Record<string, unknown>;
    return readInteger(record.adminId) ?? readInteger(record.AdminId) ?? undefined;
  }

  return undefined;
}

export async function deleteAdmin(adminId: number): Promise<string> {
  try {
    const data = await apiDelete<{ message?: string }>(API_ROUTES.adminById(adminId));
    return data.message ?? "Admin deleted successfully";
  } catch (err) {
    throw toAdminError(err, "Failed to delete admin");
  }
}

export interface AssignClientPayload {
  adminId: number;
  clientId: number;
  assignBy: number;
}

interface AssignClientApiResponse {
  success?: boolean;
  message?: string | null;
}

export async function assignClientToSaleManager(
  payload: AssignClientPayload,
  token?: string
): Promise<string> {
  try {
    const data = await apiPostJson<AssignClientApiResponse>(API_ROUTES.assignClient, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (data?.success === false) {
      throw new Error(data.message || "Failed to assign client");
    }

    return data?.message || "Client assigned successfully";
  } catch (err) {
    throw toAdminError(err, "Failed to assign client");
  }
}

export async function createAdminFormData(formData: FormData): Promise<CreateAdminResult> {
  try {
    const data = await apiPostForm<CreateAdminApiResponse>(API_ROUTES.createAdmin, formData);
    const success = data.success ?? data.Success;
    const message = data.message ?? data.Message ?? undefined;

    if (success === false) {
      throw new Error(message || "Failed to create admin");
    }

    return {
      adminId: readCreatedAdminId(data),
      message: message || "Admin created successfully",
    };
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
