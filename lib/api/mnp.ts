import { ApiError } from '@/lib/api/http';
import { parseApiErrorMessage } from '@/lib/api/errors';
import type {
  MnpBulkTrackingRequest,
  MnpBulkTrackingResult,
  MnpCredentials,
} from '@/lib/types/mnp';

const MNP_TRACKING_URL =
  process.env.MNP_TRACKING_URL ??
  'https://mnpcourier.com/mycodapi/api/Tracking/Bulk_Consignment_Tracking_New';

function getMnpCredentials(): MnpCredentials {
  const Username = process.env.MNP_USERNAME;
  const Password = process.env.MNP_PASSWORD;
  const AccountNo = process.env.MNP_ACCOUNT_NO;

  if (!Username || !Password || !AccountNo) {
    throw new Error(
      'MNP_USERNAME, MNP_PASSWORD, and MNP_ACCOUNT_NO must be set to call the M&P tracking API'
    );
  }

  return { Username, Password, AccountNo };
}

/** POST https://mnpcourier.com/mycodapi/api/Tracking/Bulk_Consignment_Tracking_New */
export async function getMnpBulkTracking(
  consignments: string[]
): Promise<MnpBulkTrackingResult[]> {
  const payload: MnpBulkTrackingRequest = {
    ...getMnpCredentials(),
    Consignments: consignments,
  };

  const response = await fetch(MNP_TRACKING_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const text = await response.text();

  if (!response.ok) {
    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : text;
    } catch {
      /* plain text or empty */
    }
    throw new ApiError(
      parseApiErrorMessage(body, `Failed to fetch M&P tracking (${response.status})`),
      response.status,
      body
    );
  }

  if (!text) return [];

  const parsed = JSON.parse(text) as unknown;
  return Array.isArray(parsed) ? (parsed as MnpBulkTrackingResult[]) : [parsed as MnpBulkTrackingResult];
}
