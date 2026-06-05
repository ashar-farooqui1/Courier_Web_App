import type { LoginRole } from "@/lib/auth/role";

const ROLE_NAME_TO_LOGIN: Record<string, LoginRole> = {
  superadmin: "super-admin",
  admin: "admin",
  client: "client",
  rider: "rider",
};

const LOGIN_TO_ROLE_NAME: Record<LoginRole, string> = {
  "super-admin": "SuperAdmin",
  admin: "Admin",
  client: "Client",
  rider: "Rider",
};

export function normalizeRoleName(roleName: string): string {
  return roleName.trim().toLowerCase().replace(/\s+/g, "");
}

export function mapRoleNameToLoginRole(roleName: string): LoginRole | null {
  return ROLE_NAME_TO_LOGIN[normalizeRoleName(roleName)] ?? null;
}

export function mapLoginRoleToRoleName(role: LoginRole): string {
  return LOGIN_TO_ROLE_NAME[role];
}

export function rolesMatch(selected: LoginRole, apiRoleName: string): boolean {
  const mapped = mapRoleNameToLoginRole(apiRoleName);
  return mapped === selected;
}
