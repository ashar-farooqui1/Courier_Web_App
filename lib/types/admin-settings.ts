import { rules, sanitize, type FieldRules } from "@/lib/validation";

export interface AdminSettings {
  settingId: number;
  ntn: string;
  taxInvoiceNo: string;
  gstNumber: string;
  strn: string;
  fuelFactor: number;
  petrolCurrentPrice: number;
  petrolBasePrice: number;
  capitalGSTPercentage: number;
  ajkgstPercentage: number;
  kpkgstPercentage: number;
  balochistanGSTPercentage: number;
  punjabGSTPercentage: number;
  sindhGSTPercentage: number;
}

export interface AdminSettingsValues {
  ntn: string;
  texInvNo: string;
  gstNumber: string;
  strn: string;
  fuelFactor: string;
  petrolCurrentPrice: string;
  petrolBasePrice: string;
  capitalGSTPercentage: string;
  ajkgstPercentage: string;
  kpkgstPercentage: string;
  balochistanGSTPercentage: string;
  punjabGSTPercentage: string;
  sindhGSTPercentage: string;
}

export interface UpdateAdminSettingsPayload {
  ntn: string;
  taxInvoiceNo: string;
  gstNumber: string;
  strn: string;
  fuelFactor: number;
  petrolCurrentPrice: number;
  petrolBasePrice: number;
  capitalGSTPercentage: number;
  ajkgstPercentage: number;
  kpkgstPercentage: number;
  balochistanGSTPercentage: number;
  punjabGSTPercentage: number;
  sindhGSTPercentage: number;
}

export const defaultAdminSettingsValues: AdminSettingsValues = {
  ntn: "",
  texInvNo: "",
  gstNumber: "",
  strn: "",
  fuelFactor: "",
  petrolCurrentPrice: "",
  petrolBasePrice: "",
  capitalGSTPercentage: "",
  ajkgstPercentage: "",
  kpkgstPercentage: "",
  balochistanGSTPercentage: "",
  punjabGSTPercentage: "",
  sindhGSTPercentage: "",
};

export function adminSettingsToFormValues(settings: AdminSettings): AdminSettingsValues {
  return {
    ntn: settings.ntn ?? "",
    texInvNo: settings.taxInvoiceNo ?? "",
    gstNumber: settings.gstNumber ?? "",
    strn: settings.strn ?? "",
    fuelFactor: String(settings.fuelFactor ?? ""),
    petrolCurrentPrice: String(settings.petrolCurrentPrice ?? ""),
    petrolBasePrice: String(settings.petrolBasePrice ?? ""),
    capitalGSTPercentage: String(settings.capitalGSTPercentage ?? ""),
    ajkgstPercentage: String(settings.ajkgstPercentage ?? ""),
    kpkgstPercentage: String(settings.kpkgstPercentage ?? ""),
    balochistanGSTPercentage: String(settings.balochistanGSTPercentage ?? ""),
    punjabGSTPercentage: String(settings.punjabGSTPercentage ?? ""),
    sindhGSTPercentage: String(settings.sindhGSTPercentage ?? ""),
  };
}

export function formValuesToUpdatePayload(values: AdminSettingsValues): UpdateAdminSettingsPayload {
  return {
    ntn: values.ntn.trim(),
    taxInvoiceNo: values.texInvNo.trim(),
    gstNumber: values.gstNumber.trim(),
    strn: values.strn.trim(),
    fuelFactor: Number(values.fuelFactor) || 0,
    petrolCurrentPrice: Number(values.petrolCurrentPrice) || 0,
    petrolBasePrice: Number(values.petrolBasePrice) || 0,
    capitalGSTPercentage: Number(values.capitalGSTPercentage) || 0,
    ajkgstPercentage: Number(values.ajkgstPercentage) || 0,
    kpkgstPercentage: Number(values.kpkgstPercentage) || 0,
    balochistanGSTPercentage: Number(values.balochistanGSTPercentage) || 0,
    punjabGSTPercentage: Number(values.punjabGSTPercentage) || 0,
    sindhGSTPercentage: Number(values.sindhGSTPercentage) || 0,
  };
}

const decimal = (value: string) => sanitize.decimal(value, 2);

export const ADMIN_SETTINGS_SANITIZERS: Partial<
  Record<keyof AdminSettingsValues, (value: string) => string>
> = {
  ntn: sanitize.taxNumber,
  gstNumber: sanitize.taxNumber,
  strn: sanitize.taxNumber,
  fuelFactor: decimal,
  petrolCurrentPrice: decimal,
  petrolBasePrice: decimal,
  capitalGSTPercentage: decimal,
  ajkgstPercentage: decimal,
  kpkgstPercentage: decimal,
  balochistanGSTPercentage: decimal,
  punjabGSTPercentage: decimal,
  sindhGSTPercentage: decimal,
};

export const ADMIN_SETTINGS_RULES: FieldRules<AdminSettingsValues> = {
  ntn: rules.ntn("NTN"),
  texInvNo: rules.text("Tax invoice no", { min: 1, max: 50 }),
  gstNumber: rules.ntn("GST #"),
  strn: rules.ntn("STRN"),
  fuelFactor: rules.number("Fuel factor", { required: true, max: 100 }),
  petrolCurrentPrice: rules.amount("Petrol current price", { required: true }),
  petrolBasePrice: rules.amount("Petrol base price", { required: true }),
  capitalGSTPercentage: rules.percentage("Capital GST %", { required: true }),
  ajkgstPercentage: rules.percentage("AJK GST %", { required: true }),
  kpkgstPercentage: rules.percentage("KPK GST %", { required: true }),
  balochistanGSTPercentage: rules.percentage("Balochistan GST %", { required: true }),
  punjabGSTPercentage: rules.percentage("Punjab GST %", { required: true }),
  sindhGSTPercentage: rules.percentage("Sindh GST %", { required: true }),
};
