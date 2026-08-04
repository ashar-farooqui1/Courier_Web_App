import { NextResponse } from 'next/server';
import { createLoadsheet, getLoadsheets } from '@/lib/api/loadsheet';
import { ApiError } from '@/lib/api/http';
import { parseApiErrorMessage } from '@/lib/api/errors';
import { readAppRequestContext, resolveOrdersClientId } from '@/lib/api/app-request-context';

function getBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}

function readOrderIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => Number(entry))
    .filter((orderId) => Number.isInteger(orderId) && orderId > 0);
}

/** Proxies GET /api/Order/GetLoadsheets (optional ?clientId=) */
export async function GET(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clientIdParam = searchParams.get('clientId');
  const clientId = clientIdParam ? Number(clientIdParam) : undefined;

  if (
    clientIdParam &&
    (clientId === undefined || !Number.isInteger(clientId) || clientId < 1)
  ) {
    return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
  }

  const ctx = readAppRequestContext(request);
  const scoped = resolveOrdersClientId(ctx, clientId);

  if (scoped.error) {
    return NextResponse.json({ message: scoped.error }, { status: scoped.status ?? 403 });
  }

  try {
    const loadsheets = await getLoadsheets(token, scoped.clientId);
    return NextResponse.json(loadsheets);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: parseApiErrorMessage(error.body, error.message), details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to fetch loadsheets';
    return NextResponse.json({ message }, { status: 500 });
  }
}

/** Proxies POST /api/Order/CreateLoadsheet */
export async function POST(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  const orderIds = readOrderIds(body.orderIds);

  if (orderIds.length === 0) {
    return NextResponse.json({ message: 'Select at least one order' }, { status: 400 });
  }

  try {
    const message = await createLoadsheet(orderIds, token);
    return NextResponse.json({ success: true, message });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: parseApiErrorMessage(error.body, error.message), details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to create loadsheet';
    return NextResponse.json({ message }, { status: 500 });
  }
}
