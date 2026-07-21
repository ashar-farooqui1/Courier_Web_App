import { NextResponse } from 'next/server';
import { getClientZoneCouriers, saveClientZoneCouriers } from '@/lib/api/client-zone-couriers';
import { ApiError } from '@/lib/api/http';

type RouteContext = { params: Promise<{ id: string }> };

function parseClientId(id: string): number | null {
  const clientId = Number(id);
  if (!Number.isInteger(clientId) || clientId < 1) return null;
  return clientId;
}

/** Proxies GET /api/Client/GetClientZoneCouriers?clientId={id} */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const clientId = parseClientId(id);
  if (clientId === null) {
    return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
  }

  try {
    const zones = await getClientZoneCouriers(clientId);
    return NextResponse.json(zones);
  } catch (error) {
    if (error instanceof ApiError) {
      const details = error.body as { message?: string } | undefined;
      return NextResponse.json(
        { message: details?.message ?? error.message, details: error.body },
        { status: error.status }
      );
    }
    const message =
      error instanceof Error ? error.message : 'Failed to fetch zone courier priorities';
    return NextResponse.json({ message }, { status: 500 });
  }
}

/** Proxies POST /api/Client/SaveZoneCouriers */
export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const clientId = parseClientId(id);
  if (clientId === null) {
    return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
  }

  try {
    const body = (await request.json()) as {
      zones?: Array<{ zoneId?: unknown; couriers?: Array<{ courierId?: unknown; priority?: unknown }> }>;
    };

    const zones = Array.isArray(body.zones)
      ? body.zones
          .map((zone) => {
            const zoneId = Number(zone.zoneId);
            if (!Number.isInteger(zoneId) || zoneId < 1) return null;

            const couriers = Array.isArray(zone.couriers)
              ? zone.couriers
                  .map((courier) => {
                    const courierId = Number(courier.courierId);
                    const priority = Number(courier.priority);
                    if (!Number.isInteger(courierId) || courierId < 1) return null;
                    if (!Number.isInteger(priority) || priority < 1) return null;
                    return { courierId, priority };
                  })
                  .filter((courier): courier is { courierId: number; priority: number } => courier !== null)
              : [];

            return { zoneId, couriers };
          })
          .filter((zone): zone is { zoneId: number; couriers: { courierId: number; priority: number }[] } => zone !== null)
      : [];

    if (zones.length === 0) {
      return NextResponse.json({ message: 'Please set at least one zone priority' }, { status: 400 });
    }

    const result = await saveClientZoneCouriers({ clientId, zones });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      const details = error.body as { message?: string } | undefined;
      return NextResponse.json(
        { message: details?.message ?? error.message, details: error.body },
        { status: error.status }
      );
    }
    const message =
      error instanceof Error ? error.message : 'Failed to save zone courier priorities';
    return NextResponse.json({ message }, { status: 500 });
  }
}
