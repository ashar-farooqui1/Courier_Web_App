import { NextResponse } from 'next/server';
import { getOrdersNotInLoadsheet } from '@/lib/api/order';
import { ApiError } from '@/lib/api/http';
import { parseApiErrorMessage } from '@/lib/api/errors';
import { readAppRequestContext, resolveOrdersClientId } from '@/lib/api/app-request-context';

function getBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}

/** Proxies GET /api/Order/GetOrdersNotInLoadsheet?clientId= — orders eligible to add to a loadsheet. */
export async function GET(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clientIdParam = searchParams.get('clientId');
  const clientId = clientIdParam ? Number(clientIdParam) : undefined;

  if (
    !clientIdParam ||
    clientId === undefined ||
    !Number.isInteger(clientId) ||
    clientId < 1
  ) {
    return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
  }

  const ctx = readAppRequestContext(request);
  const scoped = resolveOrdersClientId(ctx, clientId);

  if (scoped.error) {
    return NextResponse.json({ message: scoped.error }, { status: scoped.status ?? 403 });
  }

  if (!scoped.clientId) {
    return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
  }

  try {
    const orders = await getOrdersNotInLoadsheet(scoped.clientId, token);
    return NextResponse.json(orders);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: parseApiErrorMessage(error.body, error.message), details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to fetch available orders';
    return NextResponse.json({ message: parseApiErrorMessage(message, message) }, { status: 500 });
  }
}
