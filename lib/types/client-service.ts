import type { Service } from '@/lib/types/service';

export type ClientAssignedService = Service;

export interface AssignClientServicePayload {
  clientId: number;
  serviceIds: number[];
}

export interface AssignClientServiceResponse {
  success: boolean;
  message: string;
}

export interface RemoveClientServicePayload {
  clientId: number;
  serviceId: number;
}

export type RemoveClientServiceResponse = AssignClientServiceResponse;
