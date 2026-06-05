import { NextResponse } from 'next/server';
import { getCitiesByClientId } from '@/lib/api/client-city';
import { ApiError } from '@/lib/api/http';

type RouteContext = { params: Promise<{ id: string }> };

function parseClientId(id: string): number | null {
  const clientId = Number(id);
  if (!Number.isInteger(clientId) || clientId < 1) return null;
  return clientId;
}

/** Proxies GET /api/Client/GetCitiesByClientId?clientId={id} */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const clientId = parseClientId(id);
  if (clientId === null) {
    return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
  }

  try {
    const cities = await getCitiesByClientId(clientId);
    return NextResponse.json(cities);
  } catch (error) {
    if (error instanceof ApiError) {
      const details = error.body as { message?: string } | undefined;
      return NextResponse.json(
        { message: details?.message ?? error.message, details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to fetch client cities';
    return NextResponse.json({ message }, { status: 500 });
  }
}
