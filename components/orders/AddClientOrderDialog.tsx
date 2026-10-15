"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/hooks/useAuthRole";
import { buildAppAuthHeaders } from "@/lib/api/app-request-context";
import { buildClientsRequestHeaders, clientsApiUrl, parseClientsPayload } from "@/lib/clients/clients-request";
import { logout } from "@/lib/auth/role";
import { getDefaultWarehouse } from "@/lib/auth/warehouse";
import type { CreateOrderPayload, OrderPickupLocationDetails } from "@/lib/types/order";
import type { City } from "@/lib/types/city";
import type { Client } from "@/lib/types/client";
import type { PickupLocation } from "@/lib/types/pickup-location";
import type { Service } from "@/lib/types/service";
import { FieldError, fieldErrorInputClass } from "@/components/ui/FieldError";
import {
  FIX_FIELDS_MESSAGE,
  clearFieldError,
  hasErrors,
  rules,
  sanitize,
  validateFields,
  type FieldErrors,
} from "@/lib/validation";

function unwrapServices(payload: unknown): Service[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const data = record.data ?? record.Data;
    if (Array.isArray(data)) {
      return data as Service[];
    }
  }

  return [];
}

const inputClass =
  "w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300 disabled:opacity-70 disabled:cursor-not-allowed";

const labelClass =
  "text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1";

const initialForm = {
  customerName: "",
  customerPhone: "",
  customerReference: "",
  deliveryAddress: "",
  destinationCityId: "",
  area: "",
  productName: "",
  amount: "",
  weight: "1",
  quantity: "1",
  customerRemarks: "",
  isReplacement: false,
};

type OrderFormErrors = FieldErrors<
  typeof initialForm & { clientId: string; pickupLocationId: string; serviceId: string }
>;

/** Input filters applied while typing so a field can never hold the wrong kind of value. */
const ORDER_FIELD_SANITIZERS: Partial<Record<keyof typeof initialForm, (value: string) => string>> = {
  customerName: sanitize.name,
  customerPhone: sanitize.phone,
  amount: (value) => sanitize.decimal(value, 2),
  quantity: (value) => sanitize.digits(value, 4),
  weight: (value) => sanitize.decimal(value, 2),
};

const ORDER_FIELD_RULES = {
  customerName: rules.name("Customer name", { required: true }),
  customerPhone: rules.mobile("Customer phone", { required: true }),
  customerReference: rules.text("Customer reference", { min: 1, max: 50 }),
  deliveryAddress: rules.address("Delivery address", { required: true }),
  destinationCityId: rules.selected("Destination city"),
  area: rules.text("Area", { max: 100 }),
  productName: rules.text("Product name", { max: 150 }),
  amount: rules.amount("COD amount", { required: true }),
  quantity: rules.integer("Quantity", { required: true, min: 1, max: 1000 }),
  weight: rules.weight("Weight", { required: true, max: 100 }),
  customerRemarks: rules.text("Customer remarks", { min: 1, max: 500 }),
};

function FormField({
  label,
  required = false,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className={labelClass}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

interface AddClientOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
  variant?: "client" | "admin";
}

export function AddClientOrderDialog({
  isOpen,
  onClose,
  onSuccess,
  variant = "client",
}: AddClientOrderDialogProps) {
  const { token, ready, clientId: sessionClientId, role } = useAuthSession();
  const isAdmin = variant === "admin";

  const [form, setForm] = useState(initialForm);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [locationsError, setLocationsError] = useState<string | null>(null);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [citiesError, setCitiesError] = useState<string | null>(null);
  const [selectedPickupLocationId, setSelectedPickupLocationId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [defaultWarehouseId, setDefaultWarehouseId] = useState<number | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pickupDetails, setPickupDetails] = useState<OrderPickupLocationDetails | null>(null);
  const [fieldErrors, setFieldErrors] = useState<OrderFormErrors>({});

  const effectiveClientId = isAdmin ? Number(selectedClientId) : sessionClientId;

  const resetForm = useCallback(() => {
    setForm(initialForm);
    setSelectedClientId("");
    setSelectedPickupLocationId("");
    setSelectedServiceId("");
    setPickupDetails(null);
    setPickupLocations([]);
    setServices([]);
    setDetailsError(null);
    setClientsError(null);
    setLocationsError(null);
    setServicesError(null);
    setCitiesError(null);
    setSubmitError(null);
    setFieldErrors({});
  }, []);

  const loadClients = useCallback(async () => {
    if (!isAdmin) return;

    setLoadingClients(true);
    setClientsError(null);

    try {
      const response = await fetch(clientsApiUrl(), { headers: buildClientsRequestHeaders() });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          payload && !Array.isArray(payload) ? payload.message : undefined;
        throw new Error(message ?? `Failed to load clients (${response.status})`);
      }

      setClients(parseClientsPayload(payload));
    } catch (err) {
      setClients([]);
      setClientsError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoadingClients(false);
    }
  }, [isAdmin]);

  const loadPickupLocations = useCallback(async (clientId: number) => {
    if (!Number.isInteger(clientId) || clientId < 1) {
      setPickupLocations([]);
      return;
    }

    setLoadingLocations(true);
    setLocationsError(null);

    try {
      const response = await fetch(`/api/clients/${clientId}/pickup-locations`);
      const payload = (await response.json().catch(() => null)) as
        | PickupLocation[]
        | { message?: string }
        | null;

      if (!response.ok) {
        const message =
          payload && !Array.isArray(payload) ? payload.message : undefined;
        throw new Error(message ?? `Failed to load pickup locations (${response.status})`);
      }

      const locations = Array.isArray(payload) ? payload : [];
      setPickupLocations(locations);

      const defaultLocation = locations.find((location) => location.isDefault);
      if (defaultLocation) {
        setSelectedPickupLocationId(String(defaultLocation.pickupLocationId));
      }
    } catch (err) {
      setPickupLocations([]);
      setLocationsError(
        err instanceof Error ? err.message : "Failed to load pickup locations"
      );
    } finally {
      setLoadingLocations(false);
    }
  }, []);

  const loadServices = useCallback(async () => {
    setLoadingServices(true);
    setServicesError(null);

    try {
      const response = await fetch("/api/services");
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && "message" in payload
            ? String((payload as { message?: string }).message ?? "")
            : undefined;
        throw new Error(message || `Failed to load services (${response.status})`);
      }

      const allServices = unwrapServices(payload);
      setServices(allServices);

      if (allServices.length === 1) {
        setSelectedServiceId(String(allServices[0].serviceId));
      }
    } catch (err) {
      setServices([]);
      setServicesError(err instanceof Error ? err.message : "Failed to load services");
    } finally {
      setLoadingServices(false);
    }
  }, []);

  const loadCities = useCallback(async () => {
    setLoadingCities(true);
    setCitiesError(null);

    try {
      const response = await fetch("/api/cities");
      const payload = (await response.json().catch(() => null)) as
        | City[]
        | { message?: string }
        | null;

      if (!response.ok) {
        const message = payload && !Array.isArray(payload) ? payload.message : undefined;
        throw new Error(message ?? `Failed to load cities (${response.status})`);
      }

      setCities(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setCities([]);
      setCitiesError(err instanceof Error ? err.message : "Failed to load cities");
    } finally {
      setLoadingCities(false);
    }
  }, []);

  const loadPickupDetails = useCallback(async (pickupLocationId: number) => {
    setLoadingDetails(true);
    setDetailsError(null);

    try {
      const response = await fetch(
        `/api/orders/pickup-location?pickupLocationId=${pickupLocationId}`
      );
      const payload = (await response.json().catch(() => null)) as
        | OrderPickupLocationDetails
        | { message?: string }
        | null;

      if (!response.ok) {
        const message =
          payload && !("pickupLocationId" in payload) ? payload.message : undefined;
        throw new Error(message ?? `Failed to load pickup details (${response.status})`);
      }

      if (!payload || !("pickupLocationId" in payload)) {
        throw new Error("Invalid pickup location details");
      }

      setPickupDetails(payload);
    } catch (err) {
      setPickupDetails(null);
      setDetailsError(
        err instanceof Error ? err.message : "Failed to load pickup location details"
      );
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }

    if (!ready) return;

    loadCities();
    loadServices();
    setDefaultWarehouseId(getDefaultWarehouse()?.warehouseId ?? null);
    if (isAdmin) {
      loadClients();
    }
  }, [isOpen, ready, isAdmin, loadCities, loadServices, loadClients, resetForm]);

  useEffect(() => {
    if (!isOpen || !ready) return;

    if (isAdmin) {
      if (!effectiveClientId) {
        setPickupLocations([]);
        setSelectedPickupLocationId("");
        setPickupDetails(null);
        return;
      }

      setSelectedPickupLocationId("");
      setPickupDetails(null);
      loadPickupLocations(effectiveClientId);
      return;
    }

    if (!Number.isInteger(sessionClientId) || sessionClientId < 1) {
      setLocationsError("Client session not found. Please log in again.");
      return;
    }

    loadPickupLocations(sessionClientId);
  }, [
    isOpen,
    ready,
    isAdmin,
    effectiveClientId,
    sessionClientId,
    loadPickupLocations,
  ]);

  useEffect(() => {
    if (!isOpen || !selectedPickupLocationId) {
      setPickupDetails(null);
      return;
    }

    const pickupLocationId = Number(selectedPickupLocationId);
    if (!Number.isInteger(pickupLocationId) || pickupLocationId < 1) return;

    loadPickupDetails(pickupLocationId);
  }, [isOpen, selectedPickupLocationId, loadPickupDetails]);

  const updateField = <K extends keyof typeof initialForm>(
    key: K,
    value: (typeof initialForm)[K]
  ) => {
    const sanitizer = ORDER_FIELD_SANITIZERS[key];
    const next = sanitizer && typeof value === "string" ? sanitizer(value) : value;
    setForm((prev) => ({ ...prev, [key]: next }));
    setFieldErrors((prev) => clearFieldError(prev, key));
  };

  const inputClassFor = (key: keyof OrderFormErrors) =>
    cn(inputClass, fieldErrors[key] && fieldErrorInputClass);

  const buildPayload = (): CreateOrderPayload | null => {
    if (!pickupDetails) return null;

    const serviceId = Number(selectedServiceId);
    const selectedService = services.find((service) => service.serviceId === serviceId);

    if (!serviceId || !selectedService) return null;

    return {
      clientId: effectiveClientId,
      pickupLocationId: pickupDetails.pickupLocationId,
      warehouseId: defaultWarehouseId,
      serviceId,
      serviceName: selectedService.serviceName,
      originAddress: pickupDetails.originAddress,
      originArea: pickupDetails.originArea,
      originCityId: pickupDetails.originCityId,
      destinationCityId: Number(form.destinationCityId),
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      customerReference: form.customerReference.trim(),
      deliveryAddress: form.deliveryAddress.trim(),
      area: form.area.trim(),
      productName: form.productName.trim(),
      amount: Number(form.amount),
      weight: Number(form.weight),
      quantity: Number(form.quantity),
      customerRemarks: form.customerRemarks.trim(),
      isReplacement: form.isReplacement,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!token) {
      setSubmitError("Authentication required. Please log in again.");
      return;
    }

    const errors: OrderFormErrors = validateFields(form, ORDER_FIELD_RULES);
    if (isAdmin && effectiveClientId < 1) errors.clientId = "Please select a client.";
    if (!selectedPickupLocationId) errors.pickupLocationId = "Please select a pickup location.";
    if (!selectedServiceId) errors.serviceId = "Please select a service.";
    setFieldErrors(errors);

    if (hasErrors(errors)) {
      setSubmitError(FIX_FIELDS_MESSAGE);
      return;
    }

    if (!pickupDetails) {
      setSubmitError("Pickup location details are still loading. Please try again.");
      return;
    }

    if (isAdmin && (!defaultWarehouseId || defaultWarehouseId < 1)) {
      setSubmitError("Default warehouse not set. Logging out...");
      logout();
      return;
    }

    const payload = buildPayload();
    if (!payload) return;

    if (!payload.customerName || !payload.customerPhone || !payload.deliveryAddress) {
      setSubmitError("Customer name, phone, and delivery address are required.");
      return;
    }

    if (payload.destinationCityId < 1) {
      setSubmitError("Please select destination city.");
      return;
    }

    if (payload.originCityId < 1) {
      setSubmitError("Pickup location origin city is missing. Please select another pickup location.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: buildAppAuthHeaders(token, role, sessionClientId, {
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(result?.message ?? `Failed to create order (${response.status})`);
      }

      const message = result?.message ?? "Order created successfully";
      resetForm();
      onClose();
      onSuccess?.(message);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const loadError =
    submitError ??
    detailsError ??
    citiesError ??
    servicesError ??
    clientsError ??
    locationsError;

  const clientLabel = (client: Client) =>
    client.brandName?.trim() ||
    client.clientName?.trim() ||
    client.clientCode ||
    `Client #${client.clientId}`;

  const canSubmit =
    !submitting &&
    !loadingDetails &&
    pickupDetails &&
    selectedServiceId &&
    (!isAdmin || (effectiveClientId > 0 && (defaultWarehouseId ?? 0) > 0));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-primary px-6 py-4 flex items-center justify-between text-white">
          <h3 className="font-bold uppercase tracking-widest text-sm">Add Order</h3>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="hover:bg-white/20 p-1 rounded-full transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 max-h-[85vh] overflow-y-auto">
          {loadError && (
            <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium">
              {loadError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isAdmin && (
              <FormField label="Client" required error={fieldErrors.clientId}>
                <div className="relative">
                  <select
                    value={selectedClientId}
                    onChange={(e) => {
                      setSelectedClientId(e.target.value);
                      setFieldErrors((prev) => clearFieldError(prev, "clientId"));
                    }}
                    disabled={loadingClients || submitting}
                    className={cn(inputClassFor("clientId"), "appearance-none cursor-pointer")}
                    required
                  >
                    <option value="">
                      {loadingClients ? "Loading clients..." : "--Select Client--"}
                    </option>
                    {clients.map((client) => (
                      <option key={client.clientId} value={client.clientId}>
                        {clientLabel(client)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    size={14}
                  />
                </div>
              </FormField>
            )}
            <FormField label="Pickup Location" required error={fieldErrors.pickupLocationId}>
              <div className="relative">
                <select
                  value={selectedPickupLocationId}
                  onChange={(e) => {
                    setSelectedPickupLocationId(e.target.value);
                    setFieldErrors((prev) => clearFieldError(prev, "pickupLocationId"));
                  }}
                  disabled={
                    loadingLocations ||
                    submitting ||
                    !ready ||
                    (isAdmin && !effectiveClientId)
                  }
                  className={cn(inputClassFor("pickupLocationId"), "appearance-none cursor-pointer")}
                  required
                >
                  <option value="">
                    {loadingLocations
                      ? "Loading pickup locations..."
                      : isAdmin && !effectiveClientId
                        ? "Select client first"
                        : "Select Pickup Location"}
                  </option>
                  {pickupLocations.map((location) => (
                    <option key={location.pickupLocationId} value={location.pickupLocationId}>
                      {location.locationName}
                      {location.isDefault ? " (Default)" : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={14}
                />
              </div>
            </FormField>
            <FormField label="Service" required error={fieldErrors.serviceId}>
              <div className="relative">
                <select
                  value={selectedServiceId}
                  onChange={(e) => {
                    setSelectedServiceId(e.target.value);
                    setFieldErrors((prev) => clearFieldError(prev, "serviceId"));
                  }}
                  disabled={loadingServices || submitting}
                  className={cn(inputClassFor("serviceId"), "appearance-none cursor-pointer")}
                  required
                >
                  <option value="">
                    {loadingServices ? "Loading services..." : "--Select Service--"}
                  </option>
                  {services.map((service) => (
                    <option key={service.serviceId} value={service.serviceId}>
                      {service.serviceName}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={14}
                />
              </div>
            </FormField>
            <FormField label="Customer Name" required error={fieldErrors.customerName}>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => updateField("customerName", e.target.value)}
                maxLength={100}
                placeholder="Customer Name"
                className={inputClassFor("customerName")}
                required
                disabled={submitting}
              />
            </FormField>
            <FormField label="Customer Phone" required error={fieldErrors.customerPhone}>
              <input
                type="text"
                value={form.customerPhone}
                onChange={(e) => updateField("customerPhone", e.target.value)}
                maxLength={13}
                inputMode="tel"
                placeholder="03001234567"
                className={inputClassFor("customerPhone")}
                required
                disabled={submitting}
              />
            </FormField>
            <FormField label="Customer Reference" error={fieldErrors.customerReference}>
              <input
                type="text"
                value={form.customerReference}
                onChange={(e) => updateField("customerReference", e.target.value)}
                maxLength={50}
                placeholder="Customer Reference"
                className={inputClassFor("customerReference")}
                disabled={submitting}
              />
            </FormField>
            <FormField label="Delivery Address" required error={fieldErrors.deliveryAddress}>
              <input
                type="text"
                value={form.deliveryAddress}
                onChange={(e) => updateField("deliveryAddress", e.target.value)}
                maxLength={250}
                placeholder="Delivery Address"
                className={inputClassFor("deliveryAddress")}
                required
                disabled={submitting}
              />
            </FormField>
            <FormField label="Destination City" required error={fieldErrors.destinationCityId}>
              <div className="relative">
                <select
                  value={form.destinationCityId}
                  onChange={(e) => updateField("destinationCityId", e.target.value)}
                  disabled={loadingCities || submitting}
                  className={cn(inputClassFor("destinationCityId"), "appearance-none cursor-pointer")}
                  required
                >
                  <option value="">
                    {loadingCities ? "Loading cities..." : "--Select City--"}
                  </option>
                  {cities.map((city) => (
                    <option key={city.cityId} value={city.cityId}>
                      {city.cityName}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={14}
                />
              </div>
            </FormField>
            <FormField label="Area" error={fieldErrors.area}>
              <input
                type="text"
                value={form.area}
                onChange={(e) => updateField("area", e.target.value)}
                maxLength={100}
                placeholder="Area"
                className={inputClassFor("area")}
                disabled={submitting}
              />
            </FormField>
            <FormField label="Product Name" error={fieldErrors.productName}>
              <input
                type="text"
                value={form.productName}
                onChange={(e) => updateField("productName", e.target.value)}
                maxLength={150}
                placeholder="Product Name"
                className={inputClassFor("productName")}
                disabled={submitting}
              />
            </FormField>
            <FormField label="COD Amount" required error={fieldErrors.amount}>
              <input
                type="text"
                inputMode="decimal"
                value={form.amount}
                onChange={(e) => updateField("amount", e.target.value)}
                placeholder="e.g. 2500"
                className={inputClassFor("amount")}
                disabled={submitting}
              />
            </FormField>
            <FormField label="Quantity" required error={fieldErrors.quantity}>
              <input
                type="text"
                inputMode="numeric"
                value={form.quantity}
                onChange={(e) => updateField("quantity", e.target.value)}
                placeholder="1"
                className={inputClassFor("quantity")}
                disabled={submitting}
              />
            </FormField>
            <FormField label="Weight (kg)" required error={fieldErrors.weight}>
              <input
                type="text"
                inputMode="decimal"
                value={form.weight}
                onChange={(e) => updateField("weight", e.target.value)}
                placeholder="1"
                className={inputClassFor("weight")}
                disabled={submitting}
              />
            </FormField>
            <FormField label="Origin Address">
              <input
                type="text"
                value={pickupDetails?.originAddress ?? ""}
                placeholder={loadingDetails ? "Loading..." : "Origin Address"}
                readOnly
                className={inputClass}
              />
            </FormField>
            <FormField label="Origin Area">
              <input
                type="text"
                value={pickupDetails?.originArea ?? ""}
                placeholder={loadingDetails ? "Loading..." : "Origin Area"}
                readOnly
                className={inputClass}
              />
            </FormField>
            <FormField label="Origin City">
              <input
                type="text"
                value={pickupDetails?.originCity ?? ""}
                placeholder={loadingDetails ? "Loading..." : "Origin City"}
                readOnly
                className={inputClass}
              />
            </FormField>
            <FormField label="Replacement Order">
              <label className="flex items-center gap-3 h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isReplacement}
                  onChange={(e) => updateField("isReplacement", e.target.checked)}
                  disabled={submitting}
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                />
                <span className="text-xs font-bold text-slate-600">Mark as replacement order</span>
              </label>
            </FormField>
            <div className="md:col-span-2">
              <FormField label="Customer Remarks" error={fieldErrors.customerRemarks}>
                <textarea
                  value={form.customerRemarks}
                  onChange={(e) => updateField("customerRemarks", e.target.value)}
                  placeholder="Customer Remarks"
                  rows={3}
                  maxLength={500}
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300 resize-none"
                />
              </FormField>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="h-10 px-8 border border-primary text-primary text-[11px] font-bold rounded uppercase hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="h-10 px-8 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
