/** Host only — paths in API_ROUTES must start with `/api/`. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://192.168.100.82:5180/";

export const API_ROUTES = {
  clients: "/api/Client",
  createClient: "/api/Client/CreateClient",
  onboardClient: "/api/Client/OnboardClient",
  uploadClientLogo: (clientId: number | string) => `/api/Client/${clientId}/UploadLogo`,
  uploadClientDocuments: (clientId: number | string) =>
    `/api/Client/${clientId}/UploadDocument`,
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
  clientPricing: (clientId: number | string) =>
    `/api/Client/GetClientPricing?clientId=${clientId}`,
  clientDeliverySettings: (clientId: number | string) =>
    `/api/Client/GetDeliverySettings?clientId=${clientId}`,
  saveDeliveryCharges: '/api/Client/SaveDeliveryCharges',
  saveDeliverySettings: '/api/Client/SaveDeliverySettings',
  saveZoneCouriers: "/api/Client/SaveZoneCouriers",
  clientZoneCouriers: (clientId: number | string) =>
    `/api/Client/GetClientZoneCouriers?clientId=${clientId}`,

  orderPickupLocation: (pickupLocationId: number | string) =>
    `/api/Order/GetOrderPickupLocation?pickupLocationId=${pickupLocationId}`,
  orderById: (orderId: number | string) => `/api/Order/GetOrderById?orderId=${orderId}`,
  createOrder: "/api/Order/CreateOrder",
  /** No clientId filter support on the backend — always returns every order. */
  orders: "/api/Order/GetOrders",
  /** Only endpoint that actually filters by client. Used for both the client role and admin per-client views. */
  ordersForClient: (clientId: number | string) =>
    `/api/Order/GetOrdersByClient?clientId=${clientId}`,
  /** Orders eligible to be added to a loadsheet — excludes orders already in one. */
  ordersNotInLoadsheet: (clientId: number | string) =>
    `/api/Order/GetOrdersNotInLoadsheet?clientId=${clientId}`,
  updateOrderStatus: "/api/Order/UpdateOrderStatus",
  addOrderRemark: "/api/Order/AddOrderRemark",
  bulkUploadOrders: "/api/Order/BulkUpload",
  generateAwb: "/api/Order/generate-awb",
  deleteOrders: "/api/Order/DeleteOrders",
  retryDispatch: "/api/Order/RetryDispatch",
  reweightArrival: "/api/Order/ReweightArrival",
  createDeliverySheet: "/api/Order/CreateDeliverySheet",
  createReturnDocument: "/api/Order/CreateReturnDocument",
  generateReturnDocument: "/api/Order/GenerateReturnDocument",
  /** No filter params supported — always returns every return document; filter client-side. */
  getAllReturnDocuments: "/api/Order/GetAllReturnDocuments",
  getReturnDocumentView: (returnDocumentId: number | string) =>
    `/api/Order/GetReturnDocumentView?returnDocumentId=${returnDocumentId}`,
  generateReturnDocumentById: (returnDocumentId: number | string) =>
    `/api/Order/GenerateReturnDocumentById?returnDocumentId=${returnDocumentId}`,
  removeOrderFromReturnDocument: "/api/Order/RemoveOrderFromReturnDocument",
  updateReturnDocumentStatus: "/api/Order/UpdateReturnDocumentStatus",
  removeOrderFromDeliverySheet: "/api/Order/RemoveOrderFromDeliverySheet",
  generateDeliverySheet: "/api/Order/GenerateDeliverySheet",
  generateDeliverySheetById: (deliverySheetId: number | string) =>
    `/api/Order/GenerateDeliverySheetById?deliverySheetId=${deliverySheetId}`,
  deliverySheetDebriefing: (deliverySheetId: number | string) =>
    `/api/Order/DeliverySheetDebriefing?deliverySheetId=${deliverySheetId}`,
  /** No filter params supported — always returns every delivery sheet; filter client-side. */
  getAllDeliverySheets: "/api/Order/GetAllDeliverySheets",
  getDeliverySheetView: (sheetId: number | string) =>
    `/api/Order/GetDeliverySheetView?deliverySheetId=${sheetId}`,
  pickDeliverySheet: "/api/Order/PickDeliverySheet",
  closeDeliverySheet: "/api/Order/CloseDeliverySheet",
  updateOrderDeliveryStatus: "/api/Order/UpdateOrderDeliveryStatus",

  getAllShipperAdvices: (params: {
    listType: string;
    clientId?: number;
    page?: number;
    pageSize?: number;
  }) => {
    const query = new URLSearchParams();
    if (params.listType) query.set("ListType", params.listType);
    if (params.clientId) query.set("ClientId", String(params.clientId));
    if (params.page) query.set("Page", String(params.page));
    if (params.pageSize) query.set("PageSize", String(params.pageSize));
    return `/api/Order/GetAllShipperAdvices?${query.toString()}`;
  },
  approveShipperAdvice: "/api/Order/ApproveShipperAdvice",
  submitShipperAdviceRequest: "/api/Order/SubmitShipperAdviceRequest",

  getPickupReport: (params: {
    clientId?: number;
    riderId?: number;
    cityId?: number;
    pickupDateFrom?: string;
    pickupDateTo?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const query = new URLSearchParams();
    if (params.clientId) query.set("ClientId", String(params.clientId));
    if (params.riderId) query.set("RiderId", String(params.riderId));
    if (params.cityId) query.set("CityId", String(params.cityId));
    if (params.pickupDateFrom) query.set("PickupDateFrom", params.pickupDateFrom);
    if (params.pickupDateTo) query.set("PickupDateTo", params.pickupDateTo);
    if (params.page) query.set("Page", String(params.page));
    if (params.pageSize) query.set("PageSize", String(params.pageSize));
    return `/api/Order/GetPickupReport?${query.toString()}`;
  },

  admins: "/api/Admin/GetAllAdmin",
  createAdmin: "/api/Admin/CreateAdmin",
  adminById: (adminId: number | string) => `/api/Admin/admin/${adminId}`,
  adminSettings: "/api/Admin/settings",

  cities: "/api/Admin/GetAllCities",
  createCity: "/api/Admin/CreateCity",
  updateCity: (cityId: number | string) => `/api/Admin/UpdateCity?id=${cityId}`,
  deleteCity: (cityId: number | string) => `/api/Admin/DeleteCity?id=${cityId}`,
  searchCities: (keyword: string) =>
    `/api/Admin/SearchCities?keyword=${encodeURIComponent(keyword)}`,
  bulkUploadCities: "/api/Admin/BulkUploadCities",
  zones: "/api/Admin/GetAllZones",
  services: "/api/Admin/GellAllService",
  couriers: "/api/Admin/GetAllCouriers",

  roles: "/api/Auth/GetRoles",
  accountLogin: "/api/Account/login",
  /** Backend route is misspelled: `otpverfication` (not verification). */
  otpVerification: "/api/Account/otpverfication",

  riders: "/api/Rider",
  riderById: (riderId: number | string) => `/api/Rider/${riderId}`,

  warehouses: "/api/Warehouse/GetWarehouses",
  warehousesByAdminId: (adminId: number | string) =>
    `/api/Admin/GetWarehousesByAdminId?adminId=${adminId}`,

  loadsheets: (clientId?: number | string) =>
    clientId ? `/api/Order/GetLoadsheets?clientId=${clientId}` : `/api/Order/GetLoadsheets`,
  loadsheetById: (loadsheetId: number | string) =>
    `/api/Order/GetLoadsheet?loadsheetId=${loadsheetId}`,
  createLoadsheet: "/api/Order/CreateLoadsheet",
  addOrdersToLoadsheet: "/api/Order/AddOrdersToLoadsheet",
  removeOrdersFromLoadsheet: "/api/Order/RemoveOrdersFromLoadsheet",
  generateLoadsheetPdf: (loadsheetId: number | string) =>
    `/api/Order/GenerateLoadsheetPdf?loadsheetId=${loadsheetId}`,
} as const;
