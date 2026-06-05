import { NextResponse } from "next/server";
import { deleteCity, updateCity } from "@/lib/api/city";import { parseApiErrorMessage } from "@/lib/api/errors";
import type { CreateCityPayload } from "@/lib/types/city";

type RouteContext = { params: Promise<{ cityId: string }> };

function parseCityId(cityId: string): number | null {
  const id = Number(cityId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parsePayload(body: CreateCityPayload): CreateCityPayload | null {
  const cityName = String(body.cityName ?? "").trim();
  const shortForm = String(body.shortForm ?? "").trim();
  const status = String(body.status ?? "").trim();
  const serviceId = Number(body.serviceId);

  if (!cityName || !shortForm || !status || !Number.isFinite(serviceId) || serviceId <= 0) {
    return null;
  }

  return { cityName, serviceId, shortForm, status };
}

export async function PUT(request: Request, context: RouteContext) {
  const { cityId } = await context.params;
  const id = parseCityId(cityId);

  if (id === null) {
    return NextResponse.json({ error: "Invalid city ID" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as CreateCityPayload;
    const payload = parsePayload(body);

    if (!payload) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const message = await updateCity(id, payload);
    return NextResponse.json({ message });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update city";
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

export async function DELETE(_request: Request, context: RouteContext) {
  const { cityId } = await context.params;
  const id = parseCityId(cityId);

  if (id === null) {
    return NextResponse.json({ error: "Invalid city ID" }, { status: 400 });
  }

  try {
    const message = await deleteCity(id);
    return NextResponse.json({ message });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete city";
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
