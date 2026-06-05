export interface CreateRiderFormValues {
  name: string;
  contactNumber: string;
  email: string;
  address: string;
  area: string;
  city: string;
  cnic: string;
  vehicleRegisteredNumber: string;
}

export const defaultCreateRiderFormValues: CreateRiderFormValues = {
  name: "",
  contactNumber: "",
  email: "",
  address: "",
  area: "",
  city: "",
  cnic: "",
  vehicleRegisteredNumber: "",
};
