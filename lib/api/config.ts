/** Host only — paths in API_ROUTES must start with `/api/`. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api-courier.threecircle.io";

export const API_ROUTES = {
  clients: "/api/Client",
  createClient: "/api/Client/CreateClient",
  clientById: (clientId: number | string) => `/api/Client/${clientId}`,
  clientAssignedServices: (clientId: number | string) =>
    `/api/Client/GetClientAssignedServices?clientId=${clientId}`,
  assignClientService: "/api/Client/AssignService",
  removeClientService: "/api/Client/RemoveClientService",
  clientCitiesByClientId: (clientId: number | string) =>
    `/api/Client/GetCitiesByClientId?clientId=${clientId}`,
  clientPickupLocations: (clientId: number | string) =>
    `/api/Client/GetPickupLocations?ClientId=${clientId}`,
  addPickupLocation: "/api/Client/AddPickupLocations",
  updatePickupLocation: (pickupLocationId: number | string) =>
    `/api/Client/UpdatePickupLocations?pickupLocationId=${pickupLocationId}`,
  deletePickupLocation: (pickupLocationId: number | string) =>
    `/api/Client/DeletePickupLocations?PickupId=${pickupLocationId}`,

  orderPickupLocation: (pickupLocationId: number | string) =>
    `/api/Order/GetOrderPickupLocation?pickupLocationId=${pickupLocationId}`,
  createOrder: "/api/Order/CreateOrder",
  ordersByClient: (clientId: number | string) =>
    `/api/Order/GetOrdersByClient?clientId=${clientId}`,
  bulkUploadOrders: "/api/Order/BulkUpload",

  admins: "/api/Admin/GetAllAdmin",
  createAdmin: "/api/Admin/CreateAdmin",
  adminById: (adminId: number | string) => `/api/Admin/admin/${adminId}`,

  cities: "/api/Admin/GetAllCities",
  createCity: "/api/Admin/CreateCity",
  updateCity: (cityId: number | string) => `/api/Admin/UpdateCity?id=${cityId}`,
  deleteCity: (cityId: number | string) => `/api/Admin/DeleteCity?id=${cityId}`,
  searchCities: (keyword: string) =>
    `/api/Admin/SearchCities?keyword=${encodeURIComponent(keyword)}`,
  services: "/api/Admin/GellAllService",

  roles: "/api/Auth/GetRoles",
  accountLogin: "/api/Account/login",
  /** Backend route is misspelled: `otpverfication` (not verification). */
  otpVerification: "/api/Account/otpverfication",

  riders: "/api/Rider",
  riderById: (riderId: number | string) => `/api/Rider/${riderId}`,
} as const;
