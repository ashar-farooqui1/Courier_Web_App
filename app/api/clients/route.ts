import { NextResponse } from 'next/server';
import { createClient, getClients } from '@/lib/api/clients';
import { readAppRequestContext } from '@/lib/api/app-request-context';
import { parseApiErrorMessage } from '@/lib/api/errors';
import { ApiError } from '@/lib/api/http';

/**
 * Proxies GET /api/Client.
 * Super Admin loads every client (no adminId). Other roles load only their clients.
 */
export async function GET(request: Request) {
  const ctx = readAppRequestContext(request);

  if (ctx.role !== 'super-admin' && ctx.userId < 1) {
    return NextResponse.json(
      { message: 'Session not found. Please log in again.' },
      { status: 403 }
    );
  }

  const adminId = ctx.role === 'super-admin' ? undefined : ctx.userId;

  try {
    const clients = await getClients(adminId);
    return NextResponse.json(clients);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message, details: error.body },
        { status: error.status }
      );
    }
    const message =
      error instanceof Error ? error.message : 'Failed to fetch clients';
    return NextResponse.json({ message }, { status: 500 });
  }
}

/** Proxies POST multipart to /api/Client/CreateClient */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await createClient(formData);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          message: parseApiErrorMessage(error.body, error.message),
          details: error.body,
        },
        { status: error.status }
      );
    }
    const message =
      error instanceof Error ? error.message : 'Failed to create client';
    return NextResponse.json({ message }, { status: 500 });
  }
}
