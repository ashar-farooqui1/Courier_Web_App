import { mapRoleNameToLoginRole } from "@/lib/auth/map-role";
import type { AuthUser } from "@/lib/types/user";

export type LoginRole = "client" | "admin" | "super-admin" | "rider";

const ROLE_KEY = "courier_login_role";
const USER_KEY = "courier_auth_user";
const TOKEN_KEY = "courier_auth_token";

export interface AuthSession {
  role: LoginRole;
  user: AuthUser;
  token?: string;
}

export function saveAuthSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ROLE_KEY, session.role);
  sessionStorage.setItem(USER_KEY, JSON.stringify(session.user));
  if (session.token) {
    sessionStorage.setItem(TOKEN_KEY, session.token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

/** @deprecated Use saveAuthSession */
export function saveLoginSession(role: LoginRole, username: string): void {
  saveAuthSession({
    role,
    user: {
      userId: 0,
      email: username,
      displayName: username,
      roleId: 0,
      roleName: role,
    },
  });
}

export function getStoredRole(): LoginRole | null {
  if (typeof window === "undefined") return null;
  const role = sessionStorage.getItem(ROLE_KEY);
  if (role === "client" || role === "admin" || role === "super-admin" || role === "rider") {
    return role;
  }
  return null;
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

/** @deprecated Use getStoredUser()?.displayName */
export function getStoredUsername(): string {
  const user = getStoredUser();
  if (user?.displayName) return user.displayName;
  if (user?.email) return user.email;
  return "";
}

export function getAuthSession(): AuthSession | null {
  const role = getStoredRole();
  const user = getStoredUser();
  if (!role || !user) return null;
  return {
    role,
    user,
    token: getStoredToken() ?? undefined,
  };
}

export function clearLoginSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ROLE_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

/** Client UI for Client and Rider (rider design not built yet). */
export function isClientRole(role: LoginRole | null): boolean {
  return role === "client" || role === "rider";
}

export function isAdminRole(role: LoginRole | null): boolean {
  return role === "admin" || role === "super-admin";
}

export function loginRoleFromUser(user: AuthUser): LoginRole {
  return mapRoleNameToLoginRole(user.roleName) ?? "client";
}
