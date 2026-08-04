import { NextResponse } from 'next/server';
import { getOrderById } from '@/lib/api/order';
import { ApiError } from '@/lib/api/http';
import { parseApiErrorMessage } from '@/lib/api/errors';

type RouteContext = { params: Promise<{ orderId: string }> };

function getBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}

/** Proxies GET /api/Order/GetOrderById?orderId= */
export async function GET(request: Request, context: RouteContext) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  const { orderId: orderIdParam } = await context.params;
  const orderId = Number(orderIdParam);

  if (!Number.isInteger(orderId) || orderId < 1) {
    return NextResponse.json({ message: 'Invalid order ID' }, { status: 400 });
  }

  try {
    const order = await getOrderById(orderId, token);
    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: parseApiErrorMessage(error.body, error.message), details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to fetch order';
    return NextResponse.json({ message }, { status: 500 });
  }
}
