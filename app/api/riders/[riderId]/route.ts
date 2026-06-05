import { NextResponse } from "next/server";
import { deleteRider, getRiderById, updateRiderFormData } from "@/lib/api/rider";
import { parseApiErrorMessage } from "@/lib/api/errors";

type RouteContext = { params: Promise<{ riderId: string }> };

function parseRiderId(riderId: string): number | null {
  const id = Number(riderId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_request: Request, context: RouteContext) {
  const { riderId } = await context.params;
  const id = parseRiderId(riderId);

  if (id === null) {
    return NextResponse.json({ error: "Invalid rider ID" }, { status: 400 });
  }

  try {
    const rider = await getRiderById(id);
    return NextResponse.json(rider);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch rider";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { riderId } = await context.params;
  const id = parseRiderId(riderId);

  if (id === null) {
    return NextResponse.json({ error: "Invalid rider ID" }, { status: 400 });
  }

  try {
    const formData = await request.formData();

    const name = String(formData.get("Name") ?? "").trim();
    const contactNumber = String(formData.get("ContactNumber") ?? "").trim();
    const email = String(formData.get("Email") ?? "").trim();
    const cnic = String(formData.get("CNIC") ?? "").trim();

    if (!name || !contactNumber || !email || !cnic) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    const message = await updateRiderFormData(id, formData);
    return NextResponse.json({ success: true, message });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update rider";
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
  const { riderId } = await context.params;
  const id = parseRiderId(riderId);

  if (id === null) {
    return NextResponse.json({ error: "Invalid rider ID" }, { status: 400 });
  }

  try {
    const message = await deleteRider(id);
    return NextResponse.json({ success: true, message });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete rider";
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
