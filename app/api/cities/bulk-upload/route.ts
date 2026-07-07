import { NextResponse } from "next/server";
import { bulkUploadCities } from "@/lib/api/city";
import { ApiError } from "@/lib/api/http";
import { parseApiErrorMessage } from "@/lib/api/errors";

/** Proxies POST /api/Admin/BulkUploadCities (multipart: file) */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof Blob) || file.size === 0) {
      return NextResponse.json({ error: "Please select a file to upload" }, { status: 400 });
    }

    const fileName = file instanceof File ? file.name : "cities.xlsx";
    const result = await bulkUploadCities(file, fileName);

    return NextResponse.json({
      message: result.message,
      stats: result.stats ?? null,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: parseApiErrorMessage(error.message, error.message), details: error.body },
        { status: error.status === 200 ? 400 : error.status }
      );
    }

    const message = error instanceof Error ? error.message : "Bulk city import failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
