import { NextResponse } from "next/server";
import {
  buildCityImportTemplateBuffer,
  CITY_IMPORT_TEMPLATE_FILENAME,
} from "@/lib/cities/city-import-template";

/** GET — download bulk city import Excel template */
export async function GET() {
  try {
    const buffer = await buildCityImportTemplateBuffer();

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${CITY_IMPORT_TEMPLATE_FILENAME}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate import template";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
