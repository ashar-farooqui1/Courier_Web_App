import { NextResponse } from "next/server";
import { getRoles } from "@/lib/api/role";

export async function GET() {
  try {
    const roles = await getRoles();
    return NextResponse.json(roles);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch roles";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
