import { NextResponse } from "next/server";
import { createRiderFormData, getAllRiders } from "@/lib/api/rider";
import { parseApiErrorMessage } from "@/lib/api/errors";

export async function GET() {
  try {
    const riders = await getAllRiders();
    return NextResponse.json(riders);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch riders";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = String(formData.get("Name") ?? "").trim();
    const contactNumber = String(formData.get("ContactNumber") ?? "").trim();
    const email = String(formData.get("Email") ?? "").trim();
    const cnic = String(formData.get("CNIC") ?? "").trim();

    if (!name || !contactNumber || !email || !cnic) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    const result = await createRiderFormData(formData);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create rider";
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
