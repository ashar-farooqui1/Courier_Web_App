import { NextResponse } from 'next/server';
import { addOrderRemark } from '@/lib/api/order';
import { ApiError } from '@/lib/api/http';
import { parseApiErrorMessage } from '@/lib/api/errors';
import { readAppRequestContext } from '@/lib/api/app-request-context';

function getBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}

/** Proxies POST /api/Order/AddOrderRemark — remarkById/remarkByRoleId come from the logged-in session, not the client body. */
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

  const orderId = Number(body.orderId);
  const remark = typeof body.remark === 'string' ? body.remark.trim() : '';

  if (!Number.isInteger(orderId) || orderId < 1) {
    return NextResponse.json({ message: 'Invalid order ID' }, { status: 400 });
  }

  if (!remark) {
    return NextResponse.json({ message: 'Remark is required' }, { status: 400 });
  }

  const ctx = readAppRequestContext(request);

  if (ctx.userId < 1 || ctx.roleId < 1) {
    return NextResponse.json({ message: 'Session not found. Please log in again.' }, { status: 403 });
  }

  try {
    const message = await addOrderRemark(
      { orderId, remark, remarkById: ctx.userId, remarkByRoleId: ctx.roleId },
      token
    );
    return NextResponse.json({ success: true, message });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: parseApiErrorMessage(error.body, error.message), details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to add remark';
    return NextResponse.json({ message: parseApiErrorMessage(message, message) }, { status: 500 });
  }
}
