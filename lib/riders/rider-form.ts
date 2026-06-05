import { getPlaceholderImageFile } from "@/lib/riders/placeholder-file";
import type { CreateRiderFormValues } from "@/lib/types/create-rider";
import type { Rider } from "@/lib/types/rider";

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
