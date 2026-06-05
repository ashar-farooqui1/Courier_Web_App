import type { Rider } from "@/lib/types/rider";

export type RiderSearchFilters = {
  riderId: string;
  name: string;
  email: string;
  contactNumber: string;
  cnic: string;
};

export const emptyRiderSearchFilters: RiderSearchFilters = {
  riderId: "",
  name: "",
  email: "",
  contactNumber: "",
  cnic: "",
};

export function filterRiders(riders: Rider[], filters: RiderSearchFilters): Rider[] {
  const riderId = filters.riderId.trim();
  const name = filters.name.trim().toLowerCase();
  const email = filters.email.trim().toLowerCase();
  const contactNumber = filters.contactNumber.trim();
  const cnic = filters.cnic.trim().toLowerCase();

  return riders.filter((rider) => {
    if (riderId && !String(rider.riderId).includes(riderId)) return false;
    if (name && !rider.name.toLowerCase().includes(name)) return false;
    if (email && !rider.email.toLowerCase().includes(email)) return false;
    if (contactNumber && !rider.contactNumber.includes(contactNumber)) return false;
    if (cnic && !rider.cnic.toLowerCase().includes(cnic)) return false;
    return true;
  });
}

export function hasActiveRiderFilters(filters: RiderSearchFilters): boolean {
  return Object.values(filters).some((value) => value.trim() !== "");
}
