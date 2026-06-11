import { mapRoleNameToLoginRole } from "@/lib/auth/map-role";
import type { AuthUser } from "@/lib/types/user";

export type LoginRole = "client" | "admin" | "super-admin" | "rider";

const ROLE_KEY = "courier_login_role";
const USER_KEY = "courier_auth_user";
const TOKEN_KEY = "courier_auth_token";
const REMEMBER_KEY = "courier_remember_me";

const SESSION_KEYS = [ROLE_KEY, USER_KEY, TOKEN_KEY] as const;

function readSessionFrom(storage: Storage): AuthSession | null {
  const role = storage.getItem(ROLE_KEY);
  if (role !== "client" && role !== "admin" && role !== "super-admin" && role !== "rider") {
    return null;
  }

  const raw = storage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    const user = JSON.parse(raw) as AuthUser;
    return {
      role,
      user,
      token: storage.getItem(TOKEN_KEY) ?? undefined,
    };
  } catch {
    return null;
  }
}

function clearStorageKeys(storage: Storage): void {
  for (const key of SESSION_KEYS) {
    storage.removeItem(key);
  }
}

export interface AuthSession {
  role: LoginRole;
  user: AuthUser;
  token?: string;
}

export function saveAuthSession(session: AuthSession, remember = false): void {
  if (typeof window === "undefined") return;

  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;

  storage.setItem(ROLE_KEY, session.role);
  storage.setItem(USER_KEY, JSON.stringify(session.user));
  if (session.token) {
    storage.setItem(TOKEN_KEY, session.token);
  } else {
    storage.removeItem(TOKEN_KEY);
  }

  clearStorageKeys(otherStorage);

  if (remember) {
    localStorage.setItem(REMEMBER_KEY, "true");
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }
}

export function isRememberMeEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(REMEMBER_KEY) === "true";
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
  return getAuthSession()?.role ?? null;
}

export function getStoredUser(): AuthUser | null {
  return getAuthSession()?.user ?? null;
}

export function getStoredToken(): string | null {
  return getAuthSession()?.token ?? null;
}

/** @deprecated Use getStoredUser()?.displayName */
export function getStoredUsername(): string {
  const user = getStoredUser();
  if (user?.displayName) return user.displayName;
  if (user?.email) return user.email;
  return "";
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  return readSessionFrom(localStorage) ?? readSessionFrom(sessionStorage);
}

export function clearLoginSession(): void {
  if (typeof window === "undefined") return;
  clearStorageKeys(localStorage);
  clearStorageKeys(sessionStorage);
  localStorage.removeItem(REMEMBER_KEY);
}

/** Clears all auth data (including localStorage) and redirects to login. */
export function logout(): void {
  clearLoginSession();
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
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
