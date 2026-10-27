import { NextResponse } from "next/server";
import { setCourierLocationMapping } from "@/lib/api/courier-location";
import { parseApiErrorMessage } from "@/lib/api/errors";
import type { SetCourierLocationMappingPayload } from "@/lib/types/courier-location";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SetCourierLocationMappingPayload>;
    const courierCode = String(body.courierCode ?? "").trim();
    const cityId = Number(body.cityId);
    const externalLocationId = String(body.externalLocationId ?? "").trim();
    const externalLocationName = String(body.externalLocationName ?? "").trim();

    if (
      !courierCode ||
      !Number.isFinite(cityId) ||
      cityId <= 0 ||
      !externalLocationId ||
      !externalLocationName
    ) {
      return NextResponse.json(
        { error: "courierCode, cityId, externalLocationId, and externalLocationName are required" },
        { status: 400 }
      );
    }

    const mapping = await setCourierLocationMapping({
      courierCode,
      cityId,
      externalLocationId,
      externalLocationName,
    });

    return NextResponse.json(mapping);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save courier location mapping";
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
