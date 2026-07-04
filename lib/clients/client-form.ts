import { getStoredAdminId } from '@/lib/auth/role';
import type { Client, UpdateClientPayload } from '@/lib/types/client';
import type { CreateClientFormValues } from '@/lib/types/create-client';

export const CREATE_CLIENT_ROLE_ID = 3;

function formatClientStatus(status: string): string {
  const normalized = status.trim().toLowerCase();
  if (normalized === 'active') return 'Active';
  if (normalized === 'inactive') return 'Inactive';
  return status.trim();
}

export function arrivalAtToDatetimeLocal(arrivalAt: string): string {
  if (!arrivalAt || arrivalAt.startsWith('0001-')) return '';
  const date = new Date(arrivalAt);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
}

export function clientToFormValues(client: Client): CreateClientFormValues {
  return {
    status: client.status?.toLowerCase() || 'active',
    brandName: client.brandName?.trim() ?? '',
    clientName: client.clientName ?? '',
    pocNumber: client.pocNumber ?? '',
    contactNumber: client.contactNumber ?? '',
    clientEmail: client.clientEmail ?? '',
    clientBillingAddress: client.clientBillingAddress ?? '',
    clientPickupAddress: client.clientPickupAddress ?? '',
    baseTown: client.baseTown ?? '',
    city: client.city ?? '',
    defaultPickingRiderId: String(client.defaultPickingRiderId ?? 0),
    services: client.services ?? '',
    arrivalAt:
      arrivalAtToDatetimeLocal(client.arrivalAt) ||
      new Date().toISOString().slice(0, 16),
    roleId: '0',
  };
}

export interface BuildClientFormDataOptions {
  /** When set, always sends this role id (create flow). */
  roleId?: number;
  /** When null, sends Services as empty (backend null). */
  services?: string | null;
  /** Override logged-in admin id for CreatedByAdminId. */
  createdByAdminId?: number;
}

export function buildClientFormData(
  values: CreateClientFormValues,
  logoFile: File | null,
  options?: BuildClientFormDataOptions
): FormData {
  const formData = new FormData();

  const append = (key: string, value: string) => {
    if (value.trim() !== '') formData.append(key, value.trim());
  };

  append('Status', values.status);
  append('BrandName', values.brandName);
  append('ClientName', values.clientName);
  append('POCNumber', values.pocNumber);
  append('ContactNumber', values.contactNumber);
  append('ClientEmail', values.clientEmail);
  append('ClientBillingAddress', values.clientBillingAddress);
  append('ClientPickupAddress', values.clientPickupAddress);
  append('BaseTown', values.baseTown);
  append('City', values.city);

  if (options?.services !== null) {
    append('Services', values.services);
  }

  if (values.defaultPickingRiderId.trim()) {
    formData.append('DefaultPickingRiderId', values.defaultPickingRiderId.trim());
  }

  const roleId =
    options?.roleId !== undefined ? String(options.roleId) : values.roleId.trim();
  if (roleId) {
    formData.append('RoleId', roleId);
  }

  const createdByAdminId = options?.createdByAdminId ?? getStoredAdminId();
  if (createdByAdminId > 0) {
    formData.append('CreatedByAdminId', String(createdByAdminId));
  }

  if (values.arrivalAt.trim()) {
    formData.append('ArrivalAt', new Date(values.arrivalAt).toISOString());
  }
  if (logoFile) {
    formData.append('ClientLogo', logoFile);
  }

  return formData;
}

export function buildClientUpdatePayload(values: CreateClientFormValues): UpdateClientPayload {
  return {
    status: formatClientStatus(values.status),
    brandName: values.brandName.trim(),
    clientName: values.clientName.trim(),
    pocNumber: values.pocNumber.trim(),
    contactNumber: values.contactNumber.trim(),
    clientEmail: values.clientEmail.trim(),
    clientBillingAddress: values.clientBillingAddress.trim(),
    clientPickupAddress: values.clientPickupAddress.trim(),
    baseTown: values.baseTown.trim(),
    city: values.city.trim(),
    defaultPickingRiderId: Number(values.defaultPickingRiderId) || 0,
    salesPersonId: 0,
    services: values.services.trim(),
    roleId: CREATE_CLIENT_ROLE_ID,
    createdByAdminId: 0,
  };
}
