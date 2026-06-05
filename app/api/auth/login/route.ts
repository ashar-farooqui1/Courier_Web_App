import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, API_ROUTES } from "@/lib/api/config";

export async function POST(request: NextRequest) {
  const body = await request.text();

  const response = await fetch(`${API_BASE_URL}${API_ROUTES.accountLogin}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body,
    cache: "no-store",
  });

  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
