import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/http";
import { parseApiErrorMessage } from "@/lib/api/errors";

export function getBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}

export function errorResponse(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { message: parseApiErrorMessage(error.body, error.message) },
      { status: error.status }
    );
  }
  const message = error instanceof Error ? error.message : fallback;
  return NextResponse.json({ message }, { status: 500 });
}
