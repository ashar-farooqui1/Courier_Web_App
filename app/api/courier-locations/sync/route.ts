import { NextResponse } from "next/server";
import { syncCourierLocations } from "@/lib/api/courier-location";
import { parseApiErrorMessage } from "@/lib/api/errors";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { courierCode?: string };
    const courierCode = String(body.courierCode ?? "").trim();

    if (!courierCode) {
      return NextResponse.json({ error: "courierCode is required" }, { status: 400 });
    }

    const result = await syncCourierLocations(courierCode);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sync courier locations";
    const status =
      error instanceof Error && "status" in error && typeof error.status === "number"
        ? error.status
        : 500;
    return NextResponse.json(
      { error: parseApiErrorMessage(message, message) },
      { status }
    );
  }
}
