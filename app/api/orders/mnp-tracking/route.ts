import { NextResponse } from 'next/server';
import { getMnpBulkTracking } from '@/lib/api/mnp';
import { ApiError } from '@/lib/api/http';
import { parseApiErrorMessage } from '@/lib/api/errors';
import type { MnpTrackingDetail } from '@/lib/types/mnp';

/** M&P bulk tracking can drop or truncate large batches — keep requests small. */
const MNP_CONSIGNMENT_CHUNK_SIZE = 50;

function getBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}

function normalizeConsignments(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return Array.from(
    new Set(
      raw
        .map((value) => String(value ?? '').trim())
        .filter(Boolean)
    )
  );
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Looks up live M&P tracking status for the given consignment numbers.
 *
 * POST body: { consignments: string[] }
 *
 * Callers must pass the tracking numbers for the orders currently on screen
 * (or the full list, chunked here). Do not rely on re-fetching page 1 of orders —
 * that left later pages with empty Courier Tracking Status.
 */
export async function POST(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { consignments?: unknown };
    const consignments = normalizeConsignments(body.consignments);

    if (consignments.length === 0) {
      return NextResponse.json({ tracking_Details: [] as MnpTrackingDetail[] });
    }

    const tracking_Details: MnpTrackingDetail[] = [];

    for (const chunk of chunkArray(consignments, MNP_CONSIGNMENT_CHUNK_SIZE)) {
      const results = await getMnpBulkTracking(chunk);
      for (const result of results) {
        tracking_Details.push(...(result.tracking_Details ?? []));
      }
    }

    return NextResponse.json({ tracking_Details });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: parseApiErrorMessage(error.body, error.message), details: error.body },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to fetch M&P tracking';
    return NextResponse.json({ message: parseApiErrorMessage(message, message) }, { status: 500 });
  }
}
