import { NextResponse } from 'next/server';
import { deleteOrders } from '@/lib/api/order';
import { ApiError } from '@/lib/api/http';

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
    .filter((entry) => Number.isInteger(entry) && entry > 0);
}

/** Proxies DELETE /api/Order/DeleteOrders */
export async function DELETE(request: Request) {
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
    return NextResponse.json({ message: 'Please select at least one order' }, { status: 400 });
  }

  try {
    const message = await deleteOrders(orderIds, token);
    return NextResponse.json({ success: true, message });
  } catch (error) {
    if (error instanceof ApiError) {
      const details = error.body as { message?: string } | undefined;
      return NextResponse.json(
        { message: details?.message ?? error.message, details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to delete orders';
    return NextResponse.json({ message }, { status: 500 });
  }
}
