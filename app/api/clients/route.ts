import { NextResponse } from 'next/server';
import { createClient, getClients } from '@/lib/api/clients';
import { ApiError } from '@/lib/api/http';

/** Proxies GET https://api-courier.threecircle.io/api/Client (avoids browser CORS). */
export async function GET() {
  try {
    const clients = await getClients();
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
      const details = error.body as { message?: string } | undefined;
      return NextResponse.json(
        { message: details?.message ?? error.message, details: error.body },
        { status: error.status }
      );
    }
    const message =
      error instanceof Error ? error.message : 'Failed to create client';
    return NextResponse.json({ message }, { status: 500 });
  }
}
