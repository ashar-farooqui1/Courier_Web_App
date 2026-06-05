import { NextResponse } from 'next/server';
import { deleteClient, getClientById, updateClient } from '@/lib/api/clients';
import { ApiError } from '@/lib/api/http';

type RouteContext = { params: Promise<{ id: string }> };

function parseClientId(id: string): number | null {
  const clientId = Number(id);
  if (!Number.isInteger(clientId) || clientId < 1) return null;
  return clientId;
}

/** Proxies GET https://api-courier.threecircle.io/api/Client/{clientId} */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const clientId = parseClientId(id);
  if (clientId === null) {
    return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
  }

  try {
    const client = await getClientById(clientId);
    return NextResponse.json(client);
  } catch (error) {
    if (error instanceof ApiError) {
      const details = error.body as { message?: string } | undefined;
      return NextResponse.json(
        { message: details?.message ?? error.message, details: error.body },
        { status: error.status }
      );
    }
    const message =
      error instanceof Error ? error.message : 'Failed to fetch client';
    return NextResponse.json({ message }, { status: 500 });
  }
}

/** Proxies PUT multipart to /api/Client/{clientId} */
export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const clientId = parseClientId(id);
  if (clientId === null) {
    return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const result = await updateClient(clientId, formData);
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
      error instanceof Error ? error.message : 'Failed to update client';
    return NextResponse.json({ message }, { status: 500 });
  }
}

/** Proxies DELETE /api/Client/{clientId} */
export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const clientId = parseClientId(id);
  if (clientId === null) {
    return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
  }

  try {
    const result = await deleteClient(clientId);
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
      error instanceof Error ? error.message : 'Failed to delete client';
    return NextResponse.json({ message }, { status: 500 });
  }
}
