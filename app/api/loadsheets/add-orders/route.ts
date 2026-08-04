import { NextResponse } from 'next/server';
import { addOrdersToLoadsheet } from '@/lib/api/loadsheet';
import { ApiError } from '@/lib/api/http';
import { parseApiErrorMessage } from '@/lib/api/errors';

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

/** Proxies POST /api/Order/AddOrdersToLoadsheet */
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

  const loadsheetId = Number(body.loadsheetId);
  const orderIds = readOrderIds(body.orderIds);

  if (!Number.isInteger(loadsheetId) || loadsheetId < 1) {
    return NextResponse.json({ message: 'Invalid loadsheet ID' }, { status: 400 });
  }

  if (orderIds.length === 0) {
    return NextResponse.json({ message: 'Select at least one order' }, { status: 400 });
  }

  try {
    const message = await addOrdersToLoadsheet({ loadsheetId, orderIds }, token);
    return NextResponse.json({ success: true, message });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: parseApiErrorMessage(error.body, error.message), details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to add orders to loadsheet';
    return NextResponse.json({ message }, { status: 500 });
  }
}
