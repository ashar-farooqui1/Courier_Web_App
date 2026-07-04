"use client";

import { useEffect, useState } from "react";
import {
  getAuthSession,
  getStoredClientId,
  isClientRole,
  type AuthSession,
  type LoginRole,
} from "@/lib/auth/role";
import type { AuthUser } from "@/lib/types/user";

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(getAuthSession());
    setReady(true);
  }, []);

  const role: LoginRole | null = session?.role ?? null;
  const user: AuthUser | null = session?.user ?? null;
  const username = user?.displayName || user?.email || "";

  const clientId = isClientRole(role) ? getStoredClientId() : 0;

  return { role, user, username, token: session?.token, clientId, ready };
}
