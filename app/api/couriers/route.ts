import { NextResponse } from "next/server";
import { getAllCouriers } from "@/lib/api/courier";

export async function GET() {
  try {
    const couriers = await getAllCouriers();
    return NextResponse.json(couriers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch couriers";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
