import { NextResponse } from 'next/server';
import { deletePickupLocation, updatePickupLocation } from '@/lib/api/pickup-location';
import { ApiError } from '@/lib/api/http';

type RouteContext = { params: Promise<{ id: string; pickupLocationId: string }> };

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

function parsePickupLocationId(id: string): number | null {
  const pickupLocationId = Number(id);
  if (!Number.isInteger(pickupLocationId) || pickupLocationId < 1) return null;
  return pickupLocationId;
}

/** Proxies PUT /api/Client/UpdatePickupLocations?pickupLocationId={pickupLocationId} */
export async function PUT(request: Request, context: RouteContext) {
  const { id, pickupLocationId: pickupLocationIdParam } = await context.params;
  const clientId = parseClientId(id);
  const pickupLocationId = parsePickupLocationId(pickupLocationIdParam);

  if (clientId === null || pickupLocationId === null) {
    return NextResponse.json({ message: 'Invalid client or pickup location ID' }, { status: 400 });
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const contactPerson = readString(body.contactPerson);
    const contactPhone = readString(body.contactPhone);
    const locationName = readString(body.locationName);
    const area = readString(body.area);
    const address = readString(body.address);
    const cityId = Number(body.cityId);
    const isDefault = readBoolean(body.isDefault);

    if (!contactPerson || !contactPhone || !locationName || !area || !address) {
      return NextResponse.json({ message: 'Please fill in all required fields' }, { status: 400 });
    }

    if (!Number.isInteger(cityId) || cityId < 1) {
      return NextResponse.json({ message: 'Please select a pickup city' }, { status: 400 });
    }

    const message = await updatePickupLocation(pickupLocationId, {
      clientId,
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
      error instanceof Error ? error.message : 'Failed to update pickup location';
    return NextResponse.json({ message }, { status: 500 });
  }
}

/** Proxies DELETE /api/Client/DeletePickupLocations?PickupId={pickupLocationId} */
export async function DELETE(_request: Request, context: RouteContext) {
  const { id, pickupLocationId: pickupLocationIdParam } = await context.params;
  const clientId = parseClientId(id);
  const pickupLocationId = parsePickupLocationId(pickupLocationIdParam);

  if (clientId === null || pickupLocationId === null) {
    return NextResponse.json({ message: 'Invalid client or pickup location ID' }, { status: 400 });
  }

  try {
    const message = await deletePickupLocation(pickupLocationId);
    return NextResponse.json({ success: true, message });
  } catch (error) {
    if (error instanceof ApiError) {
      const details = error.body as { message?: string } | undefined;
      return NextResponse.json(
        { message: details?.message ?? error.message, details: error.body },
        { status: error.status === 200 ? 400 : error.status }
      );
    }
    const message =
      error instanceof Error ? error.message : 'Failed to delete pickup location';
    return NextResponse.json({ message }, { status: 500 });
  }
}
