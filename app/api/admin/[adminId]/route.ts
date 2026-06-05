import { NextResponse } from "next/server";
import { deleteAdmin, getAdminById, updateAdminFormData } from "@/lib/api/admin";
import { parseApiErrorMessage } from "@/lib/api/errors";

type RouteContext = { params: Promise<{ adminId: string }> };

function parseAdminId(adminId: string): number | null {
  const id = Number(adminId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_request: Request, context: RouteContext) {
  const { adminId } = await context.params;
  const id = parseAdminId(adminId);

  if (id === null) {
    return NextResponse.json({ error: "Invalid admin ID" }, { status: 400 });
  }

  try {
    const admin = await getAdminById(id);
    return NextResponse.json(admin);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch admin";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { adminId } = await context.params;
  const id = parseAdminId(adminId);

  if (id === null) {
    return NextResponse.json({ error: "Invalid admin ID" }, { status: 400 });
  }

  try {
    const formData = await request.formData();

    const adminName = String(formData.get("AdminName") ?? "").trim();
    const cnic = String(formData.get("CNIC") ?? "").trim();
    const contactNumber = String(formData.get("ContactNumber") ?? "").trim();
    const adminEmail = String(formData.get("AdminEmail") ?? "").trim();
    const roleId = Number(formData.get("RoleId"));

    if (!adminName || !cnic || !contactNumber || !adminEmail) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }

    if (!Number.isInteger(roleId) || roleId < 1) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const message = await updateAdminFormData(id, formData);
    return NextResponse.json({ success: true, message });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update admin";
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
  const { adminId } = await context.params;
  const id = parseAdminId(adminId);

  if (id === null) {
    return NextResponse.json({ error: "Invalid admin ID" }, { status: 400 });
  }

  try {
    const message = await deleteAdmin(id);
    return NextResponse.json({ success: true, message });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete admin";
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
