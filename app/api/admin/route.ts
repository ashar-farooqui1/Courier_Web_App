import { NextResponse } from "next/server";
import { createAdminFormData, getAllAdmins } from "@/lib/api/admin";
import { parseApiErrorMessage } from "@/lib/api/errors";

const CREATE_ADMIN_ROLE_ID = 2;

export async function GET() {
  try {
    const admins = await getAllAdmins();
    return NextResponse.json(admins);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch admins";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const adminName = String(formData.get("AdminName") ?? "").trim();
    const cnic = String(formData.get("CNIC") ?? "").trim();
    const contactNumber = String(formData.get("ContactNumber") ?? "").trim();
    const adminEmail = String(formData.get("AdminEmail") ?? "").trim();

    if (!adminName || !cnic || !contactNumber || !adminEmail) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    formData.set("RoleId", String(CREATE_ADMIN_ROLE_ID));

    const result = await createAdminFormData(formData);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create admin";
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
