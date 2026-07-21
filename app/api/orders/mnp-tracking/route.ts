import { NextResponse } from 'next/server';
import { getOrders, getOrdersByClient } from '@/lib/api/order';
import { getMnpBulkTracking } from '@/lib/api/mnp';
import { ApiError } from '@/lib/api/http';
import { parseApiErrorMessage } from '@/lib/api/errors';
import { readAppRequestContext, resolveOrdersClientId } from '@/lib/api/app-request-context';
import { isClientRole } from '@/lib/auth/role';
import type { MnpTrackingDetail } from '@/lib/types/mnp';

const MNP_COURIER_NAME = 'M&P';

function getBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}

/**
 * Fetches this app's orders, keeps only those booked via the M&P third-party
 * courier, and looks up their live status from M&P's Bulk_Consignment_Tracking_New API.
 */
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
    const orders = isClientRole(ctx.role)
      ? await getOrdersByClient(scoped.clientId as number, token)
      : await getOrders(token, scoped.clientId);

    const consignments = Array.from(
      new Set(
        orders
          .filter((order) => order.courierName.trim().toUpperCase() === MNP_COURIER_NAME)
          .map((order) => order.courierTrackingNo.trim())
          .filter(Boolean)
      )
    );

    if (consignments.length === 0) {
      return NextResponse.json({ tracking_Details: [] as MnpTrackingDetail[] });
    }

    const results = await getMnpBulkTracking(consignments);
    const tracking_Details = results.flatMap((result) => result.tracking_Details ?? []);

    return NextResponse.json({ tracking_Details });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: parseApiErrorMessage(error.body, error.message), details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to fetch M&P tracking';
    return NextResponse.json({ message: parseApiErrorMessage(message, message) }, { status: 500 });
  }
}
