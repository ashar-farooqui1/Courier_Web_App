import { API_ROUTES } from '@/lib/api/config';
import { apiGet, apiPostJson, apiDelete } from '@/lib/api/http';
import type {
  AssignClientServicePayload,
  AssignClientServiceResponse,
  ClientAssignedService,
  RemoveClientServicePayload,
  RemoveClientServiceResponse,
} from '@/lib/types/client-service';

export async function getClientAssignedServices(
  clientId: number
): Promise<ClientAssignedService[]> {
  return apiGet<ClientAssignedService[]>(API_ROUTES.clientAssignedServices(clientId));
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
