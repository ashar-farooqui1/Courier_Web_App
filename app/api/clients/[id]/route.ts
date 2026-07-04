import { NextResponse } from 'next/server';
import { deleteClient, getClientById, updateClient, uploadClientLogo } from '@/lib/api/clients';
import { parseApiErrorMessage } from '@/lib/api/errors';
import { ApiError } from '@/lib/api/http';
import type { UpdateClientPayload } from '@/lib/types/client';

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
    const client = await getClientById(clientId);
    return NextResponse.json(client);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: parseApiErrorMessage(error.body, error.message), details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to fetch client';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const clientId = parseClientId(id);
  if (clientId === null) {
    return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
  }

  try {
    const body = (await request.json()) as UpdateClientPayload;

    if (!body.clientName?.trim()) {
      return NextResponse.json({ message: 'Client name is required' }, { status: 400 });
    }

    const message = await updateClient(clientId, body);
    return NextResponse.json({ message });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: parseApiErrorMessage(error.body, error.message), details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to update client';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const clientId = parseClientId(id);
  if (clientId === null) {
    return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
  }

  try {
    const message = await deleteClient(clientId);
    return NextResponse.json({ message });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: parseApiErrorMessage(error.body, error.message), details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to delete client';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const clientId = parseClientId(id);
  if (clientId === null) {
    return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const logo = formData.get('logo');

    if (!(logo instanceof File) || logo.size === 0) {
      return NextResponse.json({ message: 'Logo file is required' }, { status: 400 });
    }

    await uploadClientLogo(clientId, logo);
    return NextResponse.json({ message: 'Client logo uploaded successfully' });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: parseApiErrorMessage(error.body, error.message), details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to upload client logo';
    return NextResponse.json({ message }, { status: 500 });
  }
}
