import { NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/api/order';
import { ApiError } from '@/lib/api/http';
import type { OrderStatus } from '@/lib/types/order';

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

function readStatus(value: unknown): OrderStatus | null {
  if (value === 'Draft' || value === 'Finalize') return value;
  return null;
}

/** Proxies PUT /api/Order/UpdateOrderStatus */
export async function PUT(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const orderIds = readOrderIds(body.orderIds);
    const status = readStatus(body.status);

    if (orderIds.length === 0) {
      return NextResponse.json({ message: 'Please select at least one order' }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ message: 'Invalid order status' }, { status: 400 });
    }

    const message = await updateOrderStatus({ orderIds, status }, token);
    return NextResponse.json({ success: true, message });
  } catch (error) {
    if (error instanceof ApiError) {
      const details = error.body as { message?: string } | undefined;
      return NextResponse.json(
        { message: details?.message ?? error.message, details: error.body },
        { status: error.status }
      );
    }
    const message =
      error instanceof Error ? error.message : 'Failed to update order status';
    return NextResponse.json({ message }, { status: 500 });
  }
}
