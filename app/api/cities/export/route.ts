import { NextResponse } from "next/server";
import { getAllCities } from "@/lib/api/city";
import { buildCitiesExportBuffer, CITIES_EXPORT_FILENAME } from "@/lib/cities/city-export";
import { parseApiErrorMessage } from "@/lib/api/errors";

/** GET — export all cities as Excel (same columns as bulk import template). */
export async function GET() {
  try {
    const cities = await getAllCities();
    const buffer = await buildCitiesExportBuffer(cities);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${CITIES_EXPORT_FILENAME}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to export cities";
    return NextResponse.json(
      { error: parseApiErrorMessage(message, message) },
      { status: 500 }
    );
  }
}
