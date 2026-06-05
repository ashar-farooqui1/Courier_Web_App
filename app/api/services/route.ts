import { NextResponse } from "next/server";
import { getAllServices } from "@/lib/api/service";

export async function GET() {
  try {
    const services = await getAllServices();
    return NextResponse.json(services);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch services";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
