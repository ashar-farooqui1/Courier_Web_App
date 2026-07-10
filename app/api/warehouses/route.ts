import { NextResponse } from "next/server";
import { getAllWarehouses } from "@/lib/api/warehouse";

/** Proxies GET /api/Warehouse/GetWarehouses */
export async function GET() {
  try {
    const warehouses = await getAllWarehouses();
    return NextResponse.json(warehouses);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch warehouses";
    return NextResponse.json({ message }, { status: 500 });
  }
}
