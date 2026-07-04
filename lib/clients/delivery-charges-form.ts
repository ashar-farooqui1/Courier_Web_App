import type { ClientDeliverySettings, ClientPricingEntry, SaveDeliverySettingsPayload } from '@/lib/types/client-delivery';
import {
  createDefaultChargeSlabs,
  defaultDeliverySettingsValues,
  type DeliverySettingsValues,
  type ServiceChargeConfig,
} from '@/lib/types/onboard-client';
import type { Service } from '@/lib/types/service';
import type { Zone } from '@/lib/types/zone';

function pickBoolean(record: Record<string, unknown>, keys: string[]): boolean {
  for (const key of keys) {
    const value = record[key];
    if (value === true || value === 'true' || value === 1) return true;
    if (value === false || value === 'false' || value === 0) return false;
  }
  return false;
}

function pickNumber(record: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = Number(record[key]);
    if (Number.isFinite(value)) return value;
  }
  return 0;
}

export function normalizeDeliverySettings(raw: unknown): ClientDeliverySettings | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const clientId = pickNumber(record, ['clientId', 'ClientId']);

  if (!clientId) return null;

  return {
    clientId,
    isPerKg: pickBoolean(record, ['isPerKg', 'IsPerKg']),
    isMonthlyInvoicing: pickBoolean(record, ['isMonthlyInvoicing', 'IsMonthlyInvoicing']),
    isFixedFuelSurcharge: pickBoolean(record, ['isFixedFuelSurcharge', 'IsFixedFuelSurcharge']),
    isFlexibleFuelSurcharge: pickBoolean(record, [
      'isFlexibleFuelSurcharge',
      'IsFlexibleFuelSurcharge',
    ]),
    isReturnCharges: pickBoolean(record, ['isReturnCharges', 'IsReturnCharges']),
    fuelSurchargeValue: pickNumber(record, ['fuelSurchargeValue', 'FuelSurchargeValue']),
  };
}

/** Backend accepts only one fuel surcharge mode at a time. */
export function applyFuelSurchargeExclusivity(
  settings: DeliverySettingsValues
): DeliverySettingsValues {
  if (settings.isFixedFuelSurcharge && settings.isFlexibleFuelSurcharge) {
    return { ...settings, isFlexibleFuelSurcharge: false };
  }

  return settings;
}

export function settingsToFormValues(settings: ClientDeliverySettings | null): DeliverySettingsValues {
  const normalized = settings ? normalizeDeliverySettings(settings) : null;

  if (!normalized) {
    return { ...defaultDeliverySettingsValues };
  }

  return applyFuelSurchargeExclusivity({
    isPerKg: normalized.isPerKg,
    isMonthlyInvoicing: normalized.isMonthlyInvoicing,
    isFixedFuelSurcharge: normalized.isFixedFuelSurcharge,
    isFlexibleFuelSurcharge: normalized.isFlexibleFuelSurcharge,
    isReturnCharges: normalized.isReturnCharges,
    fuelSurchargeValue: String(normalized.fuelSurchargeValue ?? 0),
  });
}

export function unwrapDeliverySettingsResponse(body: unknown): unknown {
  if (
    body &&
    typeof body === 'object' &&
    'data' in body &&
    (body as { data?: unknown }).data &&
    typeof (body as { data?: unknown }).data === 'object'
  ) {
    return (body as { data: unknown }).data;
  }

  return body;
}

export function buildSaveDeliverySettingsPayload(
  clientId: number,
  settings: DeliverySettingsValues
): SaveDeliverySettingsPayload {
  const resolved = applyFuelSurchargeExclusivity(settings);

  return {
    clientId,
    isPerKg: resolved.isPerKg,
    isMonthlyInvoicing: resolved.isMonthlyInvoicing,
    isFixedFuelSurcharge: resolved.isFixedFuelSurcharge,
    isFlexibleFuelSurcharge: resolved.isFlexibleFuelSurcharge,
    isReturnCharges: resolved.isReturnCharges,
    fuelSurchargeValue: Number(resolved.fuelSurchargeValue) || 0,
  };
}

export function pricingToServiceCharges(
  pricing: ClientPricingEntry[],
  services: Service[],
  zones: Zone[]
): ServiceChargeConfig[] {
  const pricingMap = new Map<string, ClientPricingEntry>();
  for (const entry of pricing) {
    pricingMap.set(`${entry.serviceId}-${entry.zoneId}`, entry);
  }

  return services.map((service) => {
    const servicePricing = pricing.filter((entry) => entry.serviceId === service.serviceId);

    return {
      serviceId: service.serviceId,
      serviceName: service.serviceName,
      enabled: servicePricing.length > 0,
      zoneCharges: zones.map((zone) => {
        const entry = pricingMap.get(`${service.serviceId}-${zone.zoneId}`);

        return {
          zoneId: zone.zoneId,
          zoneName: zone.zoneName,
          enabled: !!entry,
          fixedCharges: entry
            ? entry.fixedCharges.map((slab) => ({
                weight: Number(slab.weight) || 0,
                charges: Number(slab.charges) || 0,
              }))
            : createDefaultChargeSlabs(),
          additionalCharges: entry
            ? entry.additionalCharges.map((slab) => ({
                weight: Number(slab.weight) || 0,
                charges: Number(slab.charges) || 0,
              }))
            : createDefaultChargeSlabs(),
        };
      }),
    };
  });
}

export function initEmptyServiceCharges(services: Service[], zones: Zone[]): ServiceChargeConfig[] {
  return services.map((service) => ({
    serviceId: service.serviceId,
    serviceName: service.serviceName,
    enabled: false,
    zoneCharges: zones.map((zone) => ({
      zoneId: zone.zoneId,
      zoneName: zone.zoneName,
      enabled: false,
      fixedCharges: createDefaultChargeSlabs(),
      additionalCharges: createDefaultChargeSlabs(),
    })),
  }));
}
