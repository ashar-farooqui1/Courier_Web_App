import { NextResponse } from 'next/server';
import { addPickupLocation, getPickupLocationsByClientId } from '@/lib/api/pickup-location';
import { ApiError } from '@/lib/api/http';

type RouteContext = { params: Promise<{ id: string }> };

function readString(value: unknown): string {
  if (value == null) return '';
  const text = String(value).trim();
  return text === 'null' || text === 'undefined' ? '' : text;
}

function readBoolean(value: unknown): boolean {
  return value === true || value === 'true';
}

function parseClientId(id: string): number | null {
  const clientId = Number(id);
  if (!Number.isInteger(clientId) || clientId < 1) return null;
  return clientId;
}

/** Proxies GET /api/Client/GetPickupLocations?ClientId={id} */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const clientId = parseClientId(id);
  if (clientId === null) {
    return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
  }

  try {
    const locations = await getPickupLocationsByClientId(clientId);
    return NextResponse.json(locations);
  } catch (error) {
    if (error instanceof ApiError) {
      const details = error.body as { message?: string } | undefined;
      return NextResponse.json(
        { message: details?.message ?? error.message, details: error.body },
        { status: error.status }
      );
    }
    const message =
      error instanceof Error ? error.message : 'Failed to fetch pickup locations';
    return NextResponse.json({ message }, { status: 500 });
  }
}

/** Proxies POST /api/Client/AddPickupLocations */
export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const clientId = parseClientId(id);
  if (clientId === null) {
    return NextResponse.json({ message: 'Invalid client ID' }, { status: 400 });
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const brandName = readString(body.brandName);
    const contactPerson = readString(body.contactPerson);
    const contactPhone = readString(body.contactPhone);
    const locationName = readString(body.locationName);
    const area = readString(body.area);
    const address = readString(body.address);
    const cityId = Number(body.cityId);
    const isDefault = readBoolean(body.isDefault);

    if (!brandName || !contactPerson || !contactPhone || !locationName || !area || !address) {
      return NextResponse.json({ message: 'Please fill in all required fields' }, { status: 400 });
    }

    if (!Number.isInteger(cityId) || cityId < 1) {
      return NextResponse.json({ message: 'Please select a pickup city' }, { status: 400 });
    }

    const message = await addPickupLocation({
      clientId,
      brandName,
      contactPerson,
      contactPhone,
      locationName,
      address,
      area,
      cityId,
      isDefault,
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    if (error instanceof ApiError) {
      const details = error.body as { message?: string } | undefined;
      return NextResponse.json(
        { message: details?.message ?? error.message, details: error.body },
        { status: error.status }
      );
    }
    const message =
      error instanceof Error ? error.message : 'Failed to add pickup location';
    return NextResponse.json({ message }, { status: 500 });
  }
}
