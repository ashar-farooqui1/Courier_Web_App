import { NextResponse } from "next/server";
import { getAllShipperAdvices } from "@/lib/api/order";
import { ApiError } from "@/lib/api/http";
import { parseApiErrorMessage } from "@/lib/api/errors";
import { readAppRequestContext, resolveOrdersClientId } from "@/lib/api/app-request-context";

function getBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}

const LIST_TYPES = ["Pending", "Published"];

/** Proxies GET /api/Order/GetAllShipperAdvices?ListType=&ClientId=&Page=&PageSize= */
export async function GET(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const listType = searchParams.get("listType") ?? "";

  if (listType !== "" && !LIST_TYPES.includes(listType)) {
    return NextResponse.json({ message: "Invalid list type" }, { status: 400 });
  }

  const clientIdParam = searchParams.get("clientId");
  const requestedClientId = clientIdParam ? Number(clientIdParam) : undefined;

  if (clientIdParam && (requestedClientId === undefined || !Number.isInteger(requestedClientId) || requestedClientId < 1)) {
    return NextResponse.json({ message: "Invalid client ID" }, { status: 400 });
  }

  const ctx = readAppRequestContext(request);
  const scoped = resolveOrdersClientId(ctx, requestedClientId);

  if (scoped.error) {
    return NextResponse.json({ message: scoped.error }, { status: scoped.status ?? 403 });
  }

  const page = Number(searchParams.get("page")) || undefined;
  const pageSize = Number(searchParams.get("pageSize")) || undefined;

  try {
    const data = await getAllShipperAdvices(
      { listType, clientId: scoped.clientId, page, pageSize },
      token
    );
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: parseApiErrorMessage(error.body, error.message), details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : "Failed to fetch shipper advices";
    return NextResponse.json({ message }, { status: 500 });
  }
}
