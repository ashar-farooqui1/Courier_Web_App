import { NextResponse } from 'next/server';
import { getClientPricing } from '@/lib/api/client-delivery';
import { parseApiErrorMessage } from '@/lib/api/errors';
import { ApiError } from '@/lib/api/http';

type RouteContext = { params: Promise<{ id: string }> };

function parseClientId(id: string): number | null {
  const clientId = Number(id);
  if (!Number.isInteger(clientId) || clientId < 1) return null;
  return clientId;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const clientId = parseClientId(id);

  if (clientId === null) {
    return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
  }

  try {
    const pricing = await getClientPricing(clientId);
    return NextResponse.json(pricing);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: parseApiErrorMessage(error.body, error.message), details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to fetch client pricing';
    return NextResponse.json({ message }, { status: 500 });
  }
}
