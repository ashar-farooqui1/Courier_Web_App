"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/hooks/useAuthRole";
import { buildAppAuthHeaders } from "@/lib/api/app-request-context";
import type { CreateOrderPayload, OrderPickupLocationDetails } from "@/lib/types/order";
import type { City } from "@/lib/types/city";
import type { Client } from "@/lib/types/client";
import type { PickupLocation } from "@/lib/types/pickup-location";
import type { Service } from "@/lib/types/service";

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

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className={labelClass}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
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
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pickupDetails, setPickupDetails] = useState<OrderPickupLocationDetails | null>(null);

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
  }, []);

  const loadClients = useCallback(async () => {
    if (!isAdmin) return;

    setLoadingClients(true);
    setClientsError(null);

    try {
      const response = await fetch("/api/clients");
      const payload = (await response.json().catch(() => null)) as
        | Client[]
        | { message?: string }
        | null;

      if (!response.ok) {
        const message =
          payload && !Array.isArray(payload) ? payload.message : undefined;
        throw new Error(message ?? `Failed to load clients (${response.status})`);
      }

      setClients(Array.isArray(payload) ? payload : []);
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
      const payload = (await response.json().catch(() => null)) as
        | Service[]
        | { message?: string }
        | null;

      if (!response.ok) {
        const message =
          payload && !Array.isArray(payload) ? payload.message : undefined;
        throw new Error(message ?? `Failed to load services (${response.status})`);
      }

      const allServices = Array.isArray(payload) ? payload : [];
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
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildPayload = (): CreateOrderPayload | null => {
    if (!pickupDetails) return null;

    const serviceId = Number(selectedServiceId);
    const selectedService = services.find((service) => service.serviceId === serviceId);

    if (!serviceId || !selectedService) return null;

    return {
      clientId: effectiveClientId,
      pickupLocationId: pickupDetails.pickupLocationId,
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
      amount: Number(form.amount) || 0,
      weight: Number(form.weight) || 1,
      quantity: Math.max(1, Math.trunc(Number(form.quantity) || 1)),
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

    if (isAdmin && effectiveClientId < 1) {
      setSubmitError("Please select a client.");
      return;
    }

    if (!pickupDetails) {
      setSubmitError("Please select a pickup location.");
      return;
    }

    if (!selectedServiceId) {
      setSubmitError("Please select a service.");
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
    client.clientName?.trim() ||
    client.brandName?.trim() ||
    client.clientCode ||
    `Client #${client.clientId}`;

  const canSubmit =
    !submitting &&
    !loadingDetails &&
    pickupDetails &&
    selectedServiceId &&
    (!isAdmin || effectiveClientId > 0);

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

        <form onSubmit={handleSubmit} className="p-6 max-h-[85vh] overflow-y-auto">
          {loadError && (
            <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium">
              {loadError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isAdmin && (
              <FormField label="Client" required>
                <div className="relative">
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    disabled={loadingClients || submitting}
                    className={cn(inputClass, "appearance-none cursor-pointer")}
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
            <FormField label="Pickup Location" required>
              <div className="relative">
                <select
                  value={selectedPickupLocationId}
                  onChange={(e) => setSelectedPickupLocationId(e.target.value)}
                  disabled={
                    loadingLocations ||
                    submitting ||
                    !ready ||
                    (isAdmin && !effectiveClientId)
                  }
                  className={cn(inputClass, "appearance-none cursor-pointer")}
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
            <FormField label="Service" required>
              <div className="relative">
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  disabled={loadingServices || submitting}
                  className={cn(inputClass, "appearance-none cursor-pointer")}
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
            <FormField label="Customer Name" required>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => updateField("customerName", e.target.value)}
                placeholder="Customer Name"
                className={inputClass}
                required
                disabled={submitting}
              />
            </FormField>
            <FormField label="Customer Phone" required>
              <input
                type="text"
                value={form.customerPhone}
                onChange={(e) => updateField("customerPhone", e.target.value)}
                placeholder="Customer Phone"
                className={inputClass}
                required
                disabled={submitting}
              />
            </FormField>
            <FormField label="Customer Reference">
              <input
                type="text"
                value={form.customerReference}
                onChange={(e) => updateField("customerReference", e.target.value)}
                placeholder="Customer Reference"
                className={inputClass}
                disabled={submitting}
              />
            </FormField>
            <FormField label="Delivery Address" required>
              <input
                type="text"
                value={form.deliveryAddress}
                onChange={(e) => updateField("deliveryAddress", e.target.value)}
                placeholder="Delivery Address"
                className={inputClass}
                required
                disabled={submitting}
              />
            </FormField>
            <FormField label="Destination City" required>
              <div className="relative">
                <select
                  value={form.destinationCityId}
                  onChange={(e) => updateField("destinationCityId", e.target.value)}
                  disabled={loadingCities || submitting}
                  className={cn(inputClass, "appearance-none cursor-pointer")}
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
            <FormField label="Area">
              <input
                type="text"
                value={form.area}
                onChange={(e) => updateField("area", e.target.value)}
                placeholder="Area"
                className={inputClass}
                disabled={submitting}
              />
            </FormField>
            <FormField label="Product Name">
              <input
                type="text"
                value={form.productName}
                onChange={(e) => updateField("productName", e.target.value)}
                placeholder="Product Name"
                className={inputClass}
                disabled={submitting}
              />
            </FormField>
            <FormField label="Amount">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => updateField("amount", e.target.value)}
                placeholder="Amount"
                className={inputClass}
                disabled={submitting}
              />
            </FormField>
            <FormField label="Quantity">
              <input
                type="number"
                min="1"
                step="1"
                value={form.quantity}
                onChange={(e) => updateField("quantity", e.target.value)}
                placeholder="1"
                className={inputClass}
                disabled={submitting}
              />
            </FormField>
            <FormField label="Weight">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.weight}
                onChange={(e) => updateField("weight", e.target.value)}
                placeholder="1"
                className={inputClass}
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
              <FormField label="Customer Remarks">
                <textarea
                  value={form.customerRemarks}
                  onChange={(e) => updateField("customerRemarks", e.target.value)}
                  placeholder="Customer Remarks"
                  rows={3}
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
