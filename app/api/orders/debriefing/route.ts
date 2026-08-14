import { NextResponse } from 'next/server';
import { getDeliverySheetDebriefing } from '@/lib/api/order';
import { ApiError } from '@/lib/api/http';
import { parseApiErrorMessage } from '@/lib/api/errors';

function getBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}

/** Proxies GET /api/Order/DeliverySheetDebriefing?deliverySheetId= */
export async function GET(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const deliverySheetId = Number(searchParams.get('deliverySheetId'));

  if (!Number.isInteger(deliverySheetId) || deliverySheetId < 1) {
    return NextResponse.json({ message: 'Invalid delivery sheet id' }, { status: 400 });
  }

  try {
    const data = await getDeliverySheetDebriefing(deliverySheetId, token);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: parseApiErrorMessage(error.body, error.message), details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to fetch debriefing';
    return NextResponse.json({ message }, { status: 500 });
  }
}
