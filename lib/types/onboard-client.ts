export interface DeliveryChargeSlab {
  weight: number;
  charges: number;
}

export interface OnboardClientInfoValues {
  clientName: string;
  brandName: string;
  pocNumber: string;
  contactNumber: string;
  clientEmail: string;
  clientAddress: string;
  clientArea: string;
  cityId: string;
  salesPersonId: string;
  defaultPickingRiderId: string;
  pickupCityId: string;
  pickupContactPerson: string;
  pickupContactPhone: string;
  pickupLocationName: string;
  pickupArea: string;
  pickupAddress: string;
  pickupIsDefault: boolean;
}

export interface DeliverySettingsValues {
  isPerKg: boolean;
  isMonthlyInvoicing: boolean;
  isFixedFuelSurcharge: boolean;
  isFlexibleFuelSurcharge: boolean;
  isReturnCharges: boolean;
  fuelSurchargeValue: string;
}

export interface ZoneChargeConfig {
  zoneId: number;
  zoneName: string;
  enabled: boolean;
  fixedCharges: DeliveryChargeSlab[];
  additionalCharges: DeliveryChargeSlab[];
}

export interface ServiceChargeConfig {
  serviceId: number;
  serviceName: string;
  enabled: boolean;
  zoneCharges: ZoneChargeConfig[];
}

export interface OnboardClientRequest {
  client: {
    status: string;
    brandName: string;
    clientName: string;
    pocNumber: string;
    contactNumber: string;
    clientEmail: string;
    clientBillingAddress: string;
    clientPickupAddress: string;
    baseTown: string;
    city: string;
    defaultPickingRiderId: number;
    salesPersonId: number;
    services: string;
    roleId: number;
    createdByAdminId: number;
    deliverySettings: {
      clientId: number;
      isPerKg: boolean;
      isMonthlyInvoicing: boolean;
      isFixedFuelSurcharge: boolean;
      isFlexibleFuelSurcharge: boolean;
      isReturnCharges: boolean;
      fuelSurchargeValue: number;
    };
  };
  pickupLocation: {
    clientId: number;
    contactPerson: string;
    contactPhone: string;
    locationName: string;
    address: string;
    area: string;
    cityId: number;
    isDefault: boolean;
  };
  deliveryCharge: Array<{
    clientId: number;
    serviceId: number;
    zoneId: number;
    fixedCharges: DeliveryChargeSlab[];
    additionalCharges: DeliveryChargeSlab[];
  }>;
}

export interface OnboardClientResponse {
  message?: string;
  clientId?: number;
  data?: { clientId?: number };
}

export const defaultOnboardClientInfoValues: OnboardClientInfoValues = {
  clientName: "",
  brandName: "",
  pocNumber: "",
  contactNumber: "",
  clientEmail: "",
  clientAddress: "",
  clientArea: "",
  cityId: "",
  salesPersonId: "",
  defaultPickingRiderId: "",
  pickupCityId: "",
  pickupContactPerson: "",
  pickupContactPhone: "",
  pickupLocationName: "",
  pickupArea: "",
  pickupAddress: "",
  pickupIsDefault: true,
};

export const defaultDeliverySettingsValues: DeliverySettingsValues = {
  isPerKg: true,
  isMonthlyInvoicing: false,
  isFixedFuelSurcharge: true,
  isFlexibleFuelSurcharge: false,
  isReturnCharges: false,
  fuelSurchargeValue: "0",
};

export function createDefaultChargeSlabs(): DeliveryChargeSlab[] {
  return [
    { weight: 0.5, charges: 0 },
    { weight: 1, charges: 0 },
  ];
}
