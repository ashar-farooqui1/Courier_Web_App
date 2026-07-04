import { NextResponse } from 'next/server';
import { bulkUploadOrders } from '@/lib/api/order';
import { ApiError } from '@/lib/api/http';
import { normalizeBulkUploadFileBuffer } from '@/lib/orders/normalize-bulk-upload-file';
import { readAppRequestContext, resolveWriteClientId } from '@/lib/api/app-request-context';
function getBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return undefined;
  const token = authHeader.slice(7).trim();
  return token || undefined;
}

/** Proxies POST /api/Order/BulkUpload (multipart: ClientId, file) */
export async function POST(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const requestedClientId = Number(formData.get('ClientId') ?? formData.get('clientId'));
    const file = formData.get('file');

    const ctx = readAppRequestContext(request);
    const scoped = resolveWriteClientId(ctx, requestedClientId);

    if (scoped.error) {
      return NextResponse.json({ message: scoped.error }, { status: scoped.status ?? 403 });
    }

    const clientId = scoped.clientId;

    if (!(file instanceof Blob) || file.size === 0) {
      return NextResponse.json({ message: 'Please select a file to upload' }, { status: 400 });
    }

    const fileName = file instanceof File ? file.name : 'orders.xlsx';
    const sourceBuffer = Buffer.from(await file.arrayBuffer());
    const normalizedBuffer = await normalizeBulkUploadFileBuffer(sourceBuffer, fileName);
    const extension = fileName.split('.').pop()?.toLowerCase() ?? 'xlsx';

    let uploadFileName = fileName;
    let uploadBlob: Blob;

    if (extension === 'csv') {
      uploadBlob = new Blob([new Uint8Array(normalizedBuffer)], { type: 'text/csv' });
    } else {
      uploadBlob = new Blob([new Uint8Array(normalizedBuffer)], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      if (!uploadFileName.toLowerCase().endsWith('.xlsx')) {
        uploadFileName = `${uploadFileName.replace(/\.[^.]+$/, '')}.xlsx`;
      }
    }

    const result = await bulkUploadOrders(clientId, uploadBlob, uploadFileName, token);
    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.shipments,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message, details: error.body },
        { status: error.status === 200 ? 400 : error.status }
      );
    }
    const message = error instanceof Error ? error.message : 'Bulk upload failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}
