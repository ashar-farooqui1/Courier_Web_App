import { NextResponse } from 'next/server';
import { getLoadsheet } from '@/lib/api/loadsheet';
import { ApiError } from '@/lib/api/http';
import { parseApiErrorMessage } from '@/lib/api/errors';

type RouteContext = { params: Promise<{ loadsheetId: string }> };

function getBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}

/** Proxies GET /api/Order/GetLoadsheet?loadsheetId= */
export async function GET(request: Request, context: RouteContext) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  const { loadsheetId: loadsheetIdParam } = await context.params;
  const loadsheetId = Number(loadsheetIdParam);

  if (!Number.isInteger(loadsheetId) || loadsheetId < 1) {
    return NextResponse.json({ message: 'Invalid loadsheet ID' }, { status: 400 });
  }

  try {
    const loadsheet = await getLoadsheet(loadsheetId, token);
    if (!loadsheet) {
      return NextResponse.json({ message: 'Loadsheet not found' }, { status: 404 });
    }
    return NextResponse.json(loadsheet);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: parseApiErrorMessage(error.body, error.message), details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to fetch loadsheet';
    return NextResponse.json({ message }, { status: 500 });
  }
}
