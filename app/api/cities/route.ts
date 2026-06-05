import { NextResponse } from "next/server";
import { createCity, getAllCities } from "@/lib/api/city";
import { parseApiErrorMessage } from "@/lib/api/errors";
import type { CreateCityPayload } from "@/lib/types/city";

export async function GET() {
  try {
    const cities = await getAllCities();
    return NextResponse.json(cities);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch cities";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateCityPayload;

    const cityName = String(body.cityName ?? "").trim();
    const shortForm = String(body.shortForm ?? "").trim();
    const status = String(body.status ?? "").trim();
    const serviceId = Number(body.serviceId);

    if (!cityName || !shortForm || !status || !Number.isFinite(serviceId)) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const message = await createCity({
      cityName,
      serviceId,
      shortForm,
      status,
    });

    return NextResponse.json({ message });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create city";
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
