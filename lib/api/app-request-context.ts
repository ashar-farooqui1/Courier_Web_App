import { isClientRole, type LoginRole } from '@/lib/auth/role';

export const APP_ROLE_HEADER = 'X-App-Role';
export const APP_USER_ID_HEADER = 'X-App-User-Id';

export interface AppRequestContext {
  role: LoginRole | null;
  userId: number;
}

function isLoginRole(value: string | null): value is LoginRole {
  return (
    value === 'client' ||
    value === 'admin' ||
    value === 'super-admin' ||
    value === 'rider'
  );
}

/** Reads role + user id sent from the browser session (Next.js API routes). */
export function readAppRequestContext(request: Request): AppRequestContext {
  const roleHeader = request.headers.get(APP_ROLE_HEADER);
  const role = isLoginRole(roleHeader) ? roleHeader : null;
  const userId = Number(request.headers.get(APP_USER_ID_HEADER));

  return {
    role,
    userId: Number.isInteger(userId) && userId > 0 ? userId : 0,
  };
}

export function resolveOrdersClientId(
  ctx: AppRequestContext,
  requestedClientId?: number
): { clientId?: number; error?: string; status?: number } {
  if (isClientRole(ctx.role)) {
    if (ctx.userId < 1) {
      return {
        error: 'Client session not found. Please log in again.',
        status: 403,
      };
    }

    return { clientId: ctx.userId };
  }

  return { clientId: requestedClientId };
}

export function resolveWriteClientId(
  ctx: AppRequestContext,
  requestedClientId: number
): { clientId: number; error?: string; status?: number } {
  if (isClientRole(ctx.role)) {
    if (ctx.userId < 1) {
      return {
        clientId: 0,
        error: 'Client session not found. Please log in again.',
        status: 403,
      };
    }

    return { clientId: ctx.userId };
  }

  if (!Number.isInteger(requestedClientId) || requestedClientId < 1) {
    return { clientId: 0, error: 'Invalid client ID', status: 400 };
  }

  return { clientId: requestedClientId };
}

/** Builds headers so API routes can scope client requests to the logged-in client. */
export function buildAppAuthHeaders(
  token: string | undefined,
  role: LoginRole | null,
  userId: number,
  extra?: Record<string, string>
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...extra,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (role) {
    headers[APP_ROLE_HEADER] = role;
  }

  if (Number.isInteger(userId) && userId > 0) {
    headers[APP_USER_ID_HEADER] = String(userId);
  }

  return headers;
}
