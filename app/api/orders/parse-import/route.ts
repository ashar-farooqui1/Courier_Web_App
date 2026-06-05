import { NextResponse } from "next/server";
import { parseOrderImportBuffer } from "@/lib/orders/parse-import-file";

/** Parses import file for preview only — does not create orders. */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof Blob) || file.size === 0) {
      return NextResponse.json({ message: "Please select a file to upload" }, { status: 400 });
    }

    const fileName = file instanceof File ? file.name : "import.csv";
    const buffer = Buffer.from(await file.arrayBuffer());
    const rows = await parseOrderImportBuffer(buffer, fileName);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "No valid shipment rows found in the file." },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: rows, count: rows.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to parse import file";
    return NextResponse.json({ message }, { status: 400 });
  }
}
