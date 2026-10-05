import { NextResponse } from "next/server";
import { isSaleManagerAdmin } from "@/lib/admin/sale-manager";
import { assignClientToSaleManager, getAllAdmins } from "@/lib/api/admin";
import { readAppRequestContext } from "@/lib/api/app-request-context";
import { parseApiErrorMessage } from "@/lib/api/errors";

function getBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}

/** Proxies POST /api/Admin/AssignClient. Only a Super Admin may assign a client to a Sale Manager. */
export async function POST(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  const ctx = readAppRequestContext(request);
  if (ctx.role !== "super-admin" || ctx.userId < 1) {
    return NextResponse.json(
      { message: "Only a Super Admin can assign a client." },
      { status: 403 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const adminId = Number(body.adminId);
  const clientId = Number(body.clientId);

  if (!Number.isInteger(adminId) || adminId < 1) {
    return NextResponse.json({ message: "Select a Sale Manager." }, { status: 400 });
  }

  if (!Number.isInteger(clientId) || clientId < 1) {
    return NextResponse.json({ message: "Invalid client ID" }, { status: 400 });
  }

  try {
    const admins = await getAllAdmins();
    const saleManager = admins.find((admin) => admin.adminId === adminId);

    if (!saleManager || !isSaleManagerAdmin(saleManager)) {
      return NextResponse.json(
        { message: "Clients can only be assigned to a Sale Manager." },
        { status: 400 }
      );
    }

    const message = await assignClientToSaleManager(
      { adminId, clientId, assignBy: ctx.userId },
      token
    );

    return NextResponse.json({ success: true, message });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to assign client";
    const status =
      error instanceof Error && "status" in error && typeof error.status === "number"
        ? error.status
        : 500;
    return NextResponse.json(
      { message: parseApiErrorMessage(message, message) },
      { status }
    );
  }
}
