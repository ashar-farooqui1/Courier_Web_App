import type { Client } from '@/lib/types/client';
import type { CreateClientFormValues } from '@/lib/types/create-client';

export const CREATE_CLIENT_ROLE_ID = 3;

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

  if (options?.services === null) {
    formData.append('Services', '');
  } else {
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
  if (values.arrivalAt.trim()) {
    formData.append('ArrivalAt', new Date(values.arrivalAt).toISOString());
  }
  if (logoFile) {
    formData.append('ClientLogo', logoFile);
  }

  return formData;
}
