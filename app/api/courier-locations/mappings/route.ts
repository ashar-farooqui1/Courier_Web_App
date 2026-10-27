import { NextResponse } from "next/server";
import { getCourierLocationMappings } from "@/lib/api/courier-location";
import { parseApiErrorMessage } from "@/lib/api/errors";

export async function GET(request: Request) {
  const courierCode = new URL(request.url).searchParams.get("courierCode")?.trim();

  if (!courierCode) {
    return NextResponse.json({ error: "courierCode is required" }, { status: 400 });
  }

  try {
    const mappings = await getCourierLocationMappings(courierCode);
    return NextResponse.json(mappings);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch courier location mappings";
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
