export interface AdminSettings {
  settingId: number;
  ntn: string;
  taxInvoiceNo: string;
  gstNumber: string;
  strn: string;
  fuelFactor: number;
  petrolCurrentPrice: number;
}

export interface AdminSettingsValues {
  ntn: string;
  texInvNo: string;
  gstNumber: string;
  strn: string;
  fuelFactor: string;
  petrolCurrentPrice: string;
}

export interface UpdateAdminSettingsPayload {
  ntn: string;
  taxInvoiceNo: string;
  gstNumber: string;
  strn: string;
  fuelFactor: number;
  petrolCurrentPrice: number;
}

export const defaultAdminSettingsValues: AdminSettingsValues = {
  ntn: "",
  texInvNo: "",
  gstNumber: "",
  strn: "",
  fuelFactor: "",
  petrolCurrentPrice: "",
};

export function adminSettingsToFormValues(settings: AdminSettings): AdminSettingsValues {
  return {
    ntn: settings.ntn ?? "",
    texInvNo: settings.taxInvoiceNo ?? "",
    gstNumber: settings.gstNumber ?? "",
    strn: settings.strn ?? "",
    fuelFactor: String(settings.fuelFactor ?? ""),
    petrolCurrentPrice: String(settings.petrolCurrentPrice ?? ""),
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
  };
}
