import { NextResponse } from 'next/server';
import { createClient, getClients } from '@/lib/api/clients';
import { readAppRequestContext } from '@/lib/api/app-request-context';
import { parseApiErrorMessage } from '@/lib/api/errors';
import { ApiError } from '@/lib/api/http';
import { DEFAULT_CLIENTS_PAGE_SIZE } from '@/lib/types/paged-list';

function readPageParam(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Proxies GET /api/Client?adminId=&pageNum=&pageSize=&search=.
 * Super Admin omits adminId. Other roles: adminId={their id}.
 */
export async function GET(request: Request) {
  const ctx = readAppRequestContext(request);

  if (ctx.role !== 'super-admin' && ctx.userId < 1) {
    return NextResponse.json(
      { message: 'Session not found. Please log in again.' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const pageNum = readPageParam(searchParams.get('pageNum'), 1);
  const pageSize = readPageParam(searchParams.get('pageSize'), DEFAULT_CLIENTS_PAGE_SIZE);
  const search = searchParams.get('search')?.trim() || undefined;
  const adminId = ctx.role === 'super-admin' ? null : ctx.userId;

  try {
    const clients = await getClients({ adminId, pageNum, pageSize, search });
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
