import { NextResponse } from "next/server";
import {
  buildOrderImportTemplateBuffer,
  ORDER_IMPORT_TEMPLATE_FILENAME,
} from "@/lib/orders/order-import-template";

/** GET — download empty bulk order import Excel template */
export async function GET() {
  try {
    const buffer = await buildOrderImportTemplateBuffer();

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${ORDER_IMPORT_TEMPLATE_FILENAME}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate import template";
    return NextResponse.json({ message }, { status: 500 });
  }
}
