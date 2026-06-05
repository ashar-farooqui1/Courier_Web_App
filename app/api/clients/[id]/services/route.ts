import { NextResponse } from 'next/server';
import { assignClientServices, getClientAssignedServices, removeClientService } from '@/lib/api/client-services';
import { ApiError } from '@/lib/api/http';

type RouteContext = { params: Promise<{ id: string }> };

function parseClientId(id: string): number | null {
  const clientId = Number(id);
  if (!Number.isInteger(clientId) || clientId < 1) return null;
  return clientId;
}

/** Proxies GET /api/Client/GetClientAssignedServices?clientId={id} */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const clientId = parseClientId(id);
  if (clientId === null) {
    return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
  }

  try {
    const services = await getClientAssignedServices(clientId);
    return NextResponse.json(services);
  } catch (error) {
    if (error instanceof ApiError) {
      const details = error.body as { message?: string } | undefined;
      return NextResponse.json(
        { message: details?.message ?? error.message, details: error.body },
        { status: error.status }
      );
    }
    const message =
      error instanceof Error ? error.message : 'Failed to fetch client services';
    return NextResponse.json({ message }, { status: 500 });
  }
}

/** Proxies POST /api/Client/AssignService */
export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const clientId = parseClientId(id);
  if (clientId === null) {
    return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
  }

  try {
    const body = (await request.json()) as {
      clientId?: unknown;
      serviceIds?: unknown;
    };

    const bodyClientId = Number(body.clientId);
    const resolvedClientId =
      Number.isInteger(bodyClientId) && bodyClientId > 0 ? bodyClientId : clientId;

    if (resolvedClientId !== clientId) {
      return NextResponse.json({ message: 'Client ID mismatch' }, { status: 400 });
    }

    const serviceIds = Array.isArray(body.serviceIds)
      ? body.serviceIds
          .map((value) => Number(value))
          .filter((value) => Number.isInteger(value) && value > 0)
      : [];

    if (serviceIds.length === 0) {
      return NextResponse.json({ message: 'Select at least one service' }, { status: 400 });
    }

    const result = await assignClientServices({ clientId: resolvedClientId, serviceIds });
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
      error instanceof Error ? error.message : 'Failed to assign services';
    return NextResponse.json({ message }, { status: 500 });
  }
}

/** Proxies DELETE /api/Client/RemoveClientService */
export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const clientId = parseClientId(id);
  if (clientId === null) {
    return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
  }

  try {
    const body = (await request.json()) as {
      clientId?: unknown;
      serviceId?: unknown;
    };

    const bodyClientId = Number(body.clientId);
    const resolvedClientId =
      Number.isInteger(bodyClientId) && bodyClientId > 0 ? bodyClientId : clientId;

    if (resolvedClientId !== clientId) {
      return NextResponse.json({ message: 'Client ID mismatch' }, { status: 400 });
    }

    const serviceId = Number(body.serviceId);
    if (!Number.isInteger(serviceId) || serviceId < 1) {
      return NextResponse.json({ message: 'Invalid service ID' }, { status: 400 });
    }

    const result = await removeClientService({ clientId: resolvedClientId, serviceId });
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
      error instanceof Error ? error.message : 'Failed to remove service';
    return NextResponse.json({ message }, { status: 500 });
  }
}
