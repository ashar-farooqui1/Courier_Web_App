import { NextResponse } from "next/server";
import { getWarehousesByAdminId } from "@/lib/api/warehouse";

/** Proxies GET /api/Admin/GetWarehousesByAdminId?adminId= */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const adminId = Number(searchParams.get("adminId"));

  if (!Number.isInteger(adminId) || adminId < 1) {
    return NextResponse.json({ message: "Invalid admin ID" }, { status: 400 });
  }

  try {
    const warehouses = await getWarehousesByAdminId(adminId);
    return NextResponse.json(warehouses);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch warehouses";
    return NextResponse.json({ message }, { status: 500 });
  }
}
