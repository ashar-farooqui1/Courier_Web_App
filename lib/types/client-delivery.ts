import type { DeliveryChargeSlab } from '@/lib/types/onboard-client';

export interface ClientPricingSlab extends DeliveryChargeSlab {
  slabId?: number;
}

export interface ClientPricingEntry {
  clientId: number;
  serviceId: number;
  serviceName: string;
  zoneId: number;
  zoneName: string;
  fixedCharges: ClientPricingSlab[];
  additionalCharges: ClientPricingSlab[];
}

export interface ClientDeliverySettings {
  clientId: number;
  isPerKg: boolean;
  isMonthlyInvoicing: boolean;
  isFixedFuelSurcharge: boolean;
  isFlexibleFuelSurcharge: boolean;
  isReturnCharges: boolean;
  fuelSurchargeValue: number;
}

export interface SaveDeliveryChargePayload {
  clientId: number;
  serviceId: number;
  zoneId: number;
  fixedCharges: DeliveryChargeSlab[];
  additionalCharges: DeliveryChargeSlab[];
}

export interface SaveDeliverySettingsPayload {
  clientId: number;
  isPerKg: boolean;
  isMonthlyInvoicing: boolean;
  isFixedFuelSurcharge: boolean;
  isFlexibleFuelSurcharge: boolean;
  isReturnCharges: boolean;
  fuelSurchargeValue: number;
}
