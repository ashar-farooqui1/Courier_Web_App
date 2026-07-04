import { NextResponse } from 'next/server';
import { createOrder, getOrders } from '@/lib/api/order';
import { ApiError } from '@/lib/api/http';
import {
  readAppRequestContext,
  resolveOrdersClientId,
  resolveWriteClientId,
} from '@/lib/api/app-request-context';
import type { CreateOrderPayload } from '@/lib/types/order';

function readString(value: unknown): string {
  if (value == null) return '';
  return String(value).trim();
}

function readNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readBoolean(value: unknown): boolean {
  return value === true || value === 'true';
}

function getBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}

/** Proxies GET /api/Order/GetOrders (optional ?clientId=) */
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
    const orders = await getOrders(token, scoped.clientId);
    return NextResponse.json(orders);
  } catch (error) {
    if (error instanceof ApiError) {
      const details = error.body as { message?: string } | undefined;
      return NextResponse.json(
        { message: details?.message ?? error.message, details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to fetch orders';
    return NextResponse.json({ message }, { status: 500 });
  }
}

/** Proxies POST /api/Order/CreateOrder */
export async function POST(request: Request) {
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

    const requestedClientId = readNumber(body.clientId);
    const pickupLocationId = readNumber(body.pickupLocationId);
    const serviceId = readNumber(body.serviceId);
    const originCityId = readNumber(body.originCityId);
    const destinationCityId = readNumber(body.destinationCityId);
    const customerName = readString(body.customerName);
    const customerPhone = readString(body.customerPhone);
    const deliveryAddress = readString(body.deliveryAddress);

    const ctx = readAppRequestContext(request);
    const scoped = resolveWriteClientId(ctx, requestedClientId);

    if (scoped.error) {
      return NextResponse.json({ message: scoped.error }, { status: scoped.status ?? 403 });
    }

    const clientId = scoped.clientId;

    if (pickupLocationId < 1) {
      return NextResponse.json({ message: 'Please select a pickup location' }, { status: 400 });
    }

    if (serviceId < 1 || originCityId < 1) {
      return NextResponse.json(
        { message: 'Pickup location details are incomplete. Reselect pickup location.' },
        { status: 400 }
      );
    }

    if (destinationCityId < 1) {
      return NextResponse.json({ message: 'Please select destination city' }, { status: 400 });
    }

    if (!customerName || !customerPhone || !deliveryAddress) {
      return NextResponse.json(
        { message: 'Customer name, phone, and delivery address are required' },
        { status: 400 }
      );
    }

    const payload: CreateOrderPayload = {
      clientId,
      pickupLocationId,
      serviceId,
      serviceName: readString(body.serviceName),
      originAddress: readString(body.originAddress),
      originArea: readString(body.originArea),
      originCityId,
      destinationCityId,
      customerName,
      customerPhone,
      customerReference: readString(body.customerReference),
      deliveryAddress,
      area: readString(body.area),
      productName: readString(body.productName),
      amount: readNumber(body.amount),
      weight: readNumber(body.weight, 1),
      quantity: Math.max(1, Math.trunc(readNumber(body.quantity, 1))),
      customerRemarks: readString(body.customerRemarks),
      isReplacement: readBoolean(body.isReplacement),
    };

    const message = await createOrder(payload, token);
    return NextResponse.json({ success: true, message });
  } catch (error) {
    if (error instanceof ApiError) {
      const details = error.body as { message?: string } | undefined;
      return NextResponse.json(
        { message: details?.message ?? error.message, details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to create order';
    return NextResponse.json({ message }, { status: 500 });
  }
}
