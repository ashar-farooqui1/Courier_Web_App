import { NextResponse } from 'next/server';
import { getOrderPickupLocation } from '@/lib/api/order';
import { ApiError } from '@/lib/api/http';

/** Proxies GET /api/Order/GetOrderPickupLocation?pickupLocationId={pickupLocationId} */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pickupLocationId = Number(searchParams.get('pickupLocationId'));

  if (!Number.isInteger(pickupLocationId) || pickupLocationId < 1) {
    return NextResponse.json({ message: 'Invalid pickup location ID' }, { status: 400 });
  }

  try {
    const details = await getOrderPickupLocation(pickupLocationId);
    return NextResponse.json(details);
  } catch (error) {
    if (error instanceof ApiError) {
      const details = error.body as { message?: string } | undefined;
      return NextResponse.json(
        { message: details?.message ?? error.message, details: error.body },
        { status: error.status }
      );
    }
    const message =
      error instanceof Error ? error.message : 'Failed to fetch order pickup location';
    return NextResponse.json({ message }, { status: 500 });
  }
}
