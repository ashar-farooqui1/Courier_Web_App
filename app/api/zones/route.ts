import { NextResponse } from "next/server";
import { getAllZones } from "@/lib/api/zone";

export async function GET() {
  try {
    const zones = await getAllZones();
    return NextResponse.json(zones);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch zones";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
