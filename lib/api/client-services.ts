import { API_ROUTES } from '@/lib/api/config';
import { apiGet, apiPostJson, apiDelete } from '@/lib/api/http';
import type {
  AssignClientServicePayload,
  AssignClientServiceResponse,
  ClientAssignedService,
  RemoveClientServicePayload,
  RemoveClientServiceResponse,
} from '@/lib/types/client-service';

interface ClientServicesApiResponse {
  success?: boolean;
  message?: string | null;
  data?: ClientAssignedService[];
  details?: unknown;
}

function unwrapClientServices(
  response: ClientServicesApiResponse | ClientAssignedService[]
): ClientAssignedService[] {
  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response.data) ? response.data : [];
}

export async function getClientAssignedServices(
  clientId: number
): Promise<ClientAssignedService[]> {
  const response = await apiGet<ClientServicesApiResponse | ClientAssignedService[]>(
    API_ROUTES.clientAssignedServices(clientId)
  );
  return unwrapClientServices(response);
}

export async function assignClientServices(
  payload: AssignClientServicePayload
): Promise<AssignClientServiceResponse> {
  return apiPostJson<AssignClientServiceResponse>(API_ROUTES.assignClientService, payload);
}

export async function removeClientService(
  payload: RemoveClientServicePayload
): Promise<RemoveClientServiceResponse> {
  return apiDelete<RemoveClientServiceResponse>(API_ROUTES.removeClientService, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
