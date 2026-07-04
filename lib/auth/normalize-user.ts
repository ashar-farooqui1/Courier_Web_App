import { mapRoleNameToLoginRole, normalizeRoleName } from "@/lib/auth/map-role";
import type { AuthUser, LoginResponseData } from "@/lib/types/user";

function pickString(data: LoginResponseData, keys: string[]): string {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function pickNumber(data: LoginResponseData, keys: string[]): number {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "number" && !Number.isNaN(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return 0;
}

export function normalizeAuthUser(data: LoginResponseData, fallbackEmail: string): AuthUser {
  const email = pickString(data, ["email", "adminEmail", "clientEmail", "userEmail"]) || fallbackEmail;
  const displayName =
    pickString(data, [
      "displayName",
      "userName",
      "name",
      "adminName",
      "clientName",
      "fullName",
    ]) || email;

  const roleName = pickString(data, ["roleName", "RoleName"]);
  const roleId = pickNumber(data, ["roleId", "RoleId"]);

  if (!roleName) {
    throw new Error("Login response did not include a role.");
  }

  if (!mapRoleNameToLoginRole(roleName)) {
    throw new Error(`Unsupported role: ${roleName}`);
  }

  const normalizedRole = normalizeRoleName(roleName);
  let userIdKeys: string[];

  if (normalizedRole === "client") {
    userIdKeys = ["clientId", "ClientId", "userId", "id"];
  } else if (normalizedRole === "admin" || normalizedRole === "superadmin") {
    userIdKeys = ["adminId", "AdminId", "userId", "id"];
  } else if (normalizedRole === "rider") {
    userIdKeys = ["riderId", "RiderId", "userId", "id"];
  } else {
    userIdKeys = ["userId", "id", "clientId", "adminId", "riderId"];
  }

  return {
    userId: pickNumber(data, userIdKeys),
    email,
    displayName,
    roleId,
    roleName,
  };
}

export function extractToken(data: LoginResponseData): string | undefined {
  return pickString(data, ["token", "accessToken", "jwtToken", "authToken"]) || undefined;
}
