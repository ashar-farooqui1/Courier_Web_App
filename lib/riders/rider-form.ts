import { getPlaceholderImageFile } from "@/lib/riders/placeholder-file";
import type { CreateRiderFormValues } from "@/lib/types/create-rider";
import type { Rider } from "@/lib/types/rider";
import {
  rules,
  sanitize,
  validateFields,
  validateUploadFile,
  type FieldErrors,
  type FieldRules,
} from "@/lib/validation";

export type RiderFormErrors = FieldErrors<CreateRiderFormValues & { image: string; license: string }>;

export const RIDER_FIELD_SANITIZERS: Partial<
  Record<keyof CreateRiderFormValues, (value: string) => string>
> = {
  name: sanitize.name,
  contactNumber: sanitize.phone,
  cnic: sanitize.cnic,
  vehicleRegisteredNumber: (value) => sanitize.code(value, 15),
};

const RIDER_FIELD_RULES: FieldRules<CreateRiderFormValues> = {
  name: rules.name("Name", { required: true }),
  contactNumber: rules.mobile("Contact number", { required: true }),
  email: rules.email("Email", { required: true }),
  address: rules.address("Address"),
  area: rules.text("Area", { max: 100 }),
  city: rules.text("City", { max: 100 }),
  cnic: rules.cnic("CNIC", { required: true }),
  vehicleRegisteredNumber: rules.code("Vehicle registered number", { min: 3, max: 15 }),
};

export function validateRiderForm(
  values: CreateRiderFormValues,
  imageFile: File | null,
  licenseFile: File | null
): RiderFormErrors {
  const errors: RiderFormErrors = validateFields(values, RIDER_FIELD_RULES);
  const imageError = validateUploadFile(imageFile, "Image");
  const licenseError = validateUploadFile(licenseFile, "License", { allowPdf: true });
  if (imageError) errors.image = imageError;
  if (licenseError) errors.license = licenseError;
  return errors;
}

export function riderToFormValues(rider: Rider): CreateRiderFormValues {
  return {
    name: rider.name,
    contactNumber: rider.contactNumber,
    email: rider.email,
    address: rider.address,
    area: rider.area,
    city: rider.city,
    cnic: rider.cnic,
    vehicleRegisteredNumber: rider.vehicleRegisteredNumber,
  };
}

export function buildRiderFormData(
  values: CreateRiderFormValues,
  imageFile: File | null,
  licenseFile: File | null
): FormData {
  const formData = new FormData();
  formData.append("Name", values.name.trim());
  formData.append("ContactNumber", values.contactNumber.trim());
  formData.append("Email", values.email.trim());
  formData.append("Address", values.address.trim());
  formData.append("Area", values.area.trim());
  formData.append("City", values.city.trim());
  formData.append("CNIC", values.cnic.trim());
  formData.append("VehicleRegisteredNumber", values.vehicleRegisteredNumber.trim());

  // API returns 500 if Image/License are omitted — send placeholder when user keeps existing files.
  formData.append("Image", imageFile ?? getPlaceholderImageFile("image.png"));
  formData.append("License", licenseFile ?? getPlaceholderImageFile("license.png"));

  return formData;
}
