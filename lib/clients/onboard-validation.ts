import { rules, sanitize, type FieldRules } from "@/lib/validation";
import type {
  BankDetailsValues,
  OnboardClientInfoValues,
  ServiceChargeConfig,
} from "@/lib/types/onboard-client";

/** Typing filters for the onboarding "Client Details" + "Pickup Location" fields. */
export const ONBOARD_INFO_SANITIZERS: Partial<
  Record<keyof OnboardClientInfoValues, (value: string) => string>
> = {
  pocNumber: sanitize.phone,
  contactNumber: sanitize.phone,
  cnicNumber: sanitize.cnic,
  ntn: sanitize.taxNumber,
  pickupContactPerson: sanitize.name,
  pickupContactPhone: sanitize.phone,
};

export const ONBOARD_INFO_RULES: FieldRules<OnboardClientInfoValues> = {
  clientName: rules.text("Client name", { required: true, max: 100 }),
  brandName: rules.text("Brand name", { max: 100 }),
  pocNumber: rules.phone("POC number"),
  contactNumber: rules.phone("Contact number", { required: true }),
  clientEmail: rules.email("Client email", { required: true }),
  cnicNumber: rules.cnic("CNIC number"),
  ntn: rules.ntn("NTN"),
  clientAddress: rules.address("Client address"),
  clientArea: rules.text("Client area", { max: 100 }),
  cityId: rules.selected("City"),
  salesPersonId: rules.selected("Sale person"),
  pickupContactPerson: rules.name("Contact person", { required: true }),
  pickupContactPhone: rules.phone("Contact phone", { required: true }),
  pickupLocationName: rules.text("Location name", { required: true, max: 100 }),
  pickupCityId: rules.selected("Pickup city"),
  pickupArea: rules.text("Area", { required: true, max: 100 }),
  pickupAddress: rules.address("Address", { required: true }),
};

export const BANK_DETAILS_SANITIZERS: Partial<
  Record<keyof BankDetailsValues, (value: string) => string>
> = {
  bankName: sanitize.name,
  accountTitle: sanitize.name,
  bankCity: sanitize.name,
  iban: sanitize.iban,
  accountNumber: (value) => sanitize.digits(value, 20),
};

export const BANK_DETAILS_RULES: FieldRules<BankDetailsValues> = {
  bankName: rules.name("Bank name"),
  accountTitle: rules.name("Account title"),
  branchName: rules.text("Branch name", { max: 100 }),
  iban: rules.iban("IBAN"),
  accountNumber: rules.accountNumber("Account number"),
  bankCity: rules.name("Bank city"),
};

/** Every enabled service/zone needs slabs with weight > 0, charges > 0 and no repeated weights. */
export function validateServiceCharges(serviceCharges: ServiceChargeConfig[]): string | null {
  for (const service of serviceCharges) {
    if (!service.enabled) continue;

    for (const zone of service.zoneCharges) {
      if (!zone.enabled) continue;

      const where = `${service.serviceName} / ${zone.zoneName}`;
      const groups = [
        ["Fixed charges", zone.fixedCharges],
        ["Additional charges", zone.additionalCharges],
      ] as const;

      for (const [title, slabs] of groups) {
        const seen = new Set<number>();
        for (const slab of slabs) {
          if (!(slab.weight > 0)) return `${where}: ${title} weight must be greater than 0.`;
          if (slab.weight > 100) return `${where}: ${title} weight cannot be more than 100 kg.`;
          if (!(slab.charges > 0)) return `${where}: ${title} charges must be greater than 0.`;
          if (slab.charges > 1_000_000) return `${where}: ${title} charges are too large.`;
          if (seen.has(slab.weight)) return `${where}: ${title} has the weight ${slab.weight} kg twice.`;
          seen.add(slab.weight);
        }
      }
    }
  }

  return null;
}
