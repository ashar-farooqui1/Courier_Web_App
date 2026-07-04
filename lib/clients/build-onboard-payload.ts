import { getStoredAdminId } from '@/lib/auth/role';
import { CREATE_CLIENT_ROLE_ID } from '@/lib/clients/client-form';
import { buildSaveDeliverySettingsPayload } from '@/lib/clients/delivery-charges-form';
import type { City } from "@/lib/types/city";
import type {
  DeliverySettingsValues,
  OnboardClientInfoValues,
  OnboardClientRequest,
  ServiceChargeConfig,
} from "@/lib/types/onboard-client";

export function buildOnboardClientPayload(
  info: OnboardClientInfoValues,
  settings: DeliverySettingsValues,
  serviceCharges: ServiceChargeConfig[],
  cities: City[]
): OnboardClientRequest {
  const selectedCity = cities.find((city) => city.cityId === Number(info.cityId));

  const deliveryCharge = serviceCharges
    .filter((service) => service.enabled)
    .flatMap((service) =>
      service.zoneCharges
        .filter((zone) => zone.enabled)
        .map((zone) => ({
          clientId: 0,
          serviceId: service.serviceId,
          zoneId: zone.zoneId,
          fixedCharges: zone.fixedCharges.map((slab) => ({
            weight: Number(slab.weight) || 0,
            charges: Number(slab.charges) || 0,
          })),
          additionalCharges: zone.additionalCharges.map((slab) => ({
            weight: Number(slab.weight) || 0,
            charges: Number(slab.charges) || 0,
          })),
        }))
    );

  const enabledServiceIds = [...new Set(deliveryCharge.map((charge) => charge.serviceId))];

  return {
    client: {
      status: "Active",
      brandName: info.brandName.trim(),
      clientName: info.clientName.trim(),
      pocNumber: info.pocNumber.trim(),
      contactNumber: info.contactNumber.trim(),
      clientEmail: info.clientEmail.trim(),
      clientBillingAddress: info.clientAddress.trim(),
      clientPickupAddress: info.pickupAddress.trim() || info.clientAddress.trim(),
      baseTown: info.clientArea.trim(),
      city: selectedCity?.cityName ?? "",
      defaultPickingRiderId: Number(info.defaultPickingRiderId),
      salesPersonId: Number(info.salesPersonId),
      services: enabledServiceIds.join(","),
      roleId: CREATE_CLIENT_ROLE_ID,
      createdByAdminId: getStoredAdminId(),
      deliverySettings: buildSaveDeliverySettingsPayload(0, settings),
    },
    pickupLocation: {
      clientId: 0,
      contactPerson: info.pickupContactPerson.trim(),
      contactPhone: info.pickupContactPhone.trim(),
      locationName: info.pickupLocationName.trim(),
      address: info.pickupAddress.trim(),
      area: info.pickupArea.trim(),
      cityId: Number(info.pickupCityId),
      isDefault: info.pickupIsDefault,
    },
    deliveryCharge,
  };
}
