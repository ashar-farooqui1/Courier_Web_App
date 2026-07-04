"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { OnboardClientInfoStep } from "@/components/clients/onboard/OnboardClientInfoStep";
import { OnboardDeliveryChargesStep } from "@/components/clients/onboard/OnboardDeliveryChargesStep";
import { buildOnboardClientPayload } from "@/lib/clients/build-onboard-payload";
import { parseApiErrorMessage } from "@/lib/api/errors";
import type { Admin } from "@/types/admin";
import type { City } from "@/lib/types/city";
import type {
  DeliverySettingsValues,
  OnboardClientInfoValues,
  ServiceChargeConfig,
} from "@/lib/types/onboard-client";
import {
  createDefaultChargeSlabs as makeDefaultSlabs,
  defaultDeliverySettingsValues as defaultSettings,
  defaultOnboardClientInfoValues as defaultInfo,
} from "@/lib/types/onboard-client";
import type { Service } from "@/lib/types/service";
import type { Zone } from "@/lib/types/zone";

type OnboardStep = "client-info" | "delivery-charges";

function initServiceCharges(services: Service[], zones: Zone[]): ServiceChargeConfig[] {
  return services.map((service) => ({
    serviceId: service.serviceId,
    serviceName: service.serviceName,
    enabled: true,
    zoneCharges: zones.map((zone) => ({
      zoneId: zone.zoneId,
      zoneName: zone.zoneName,
      enabled: false,
      fixedCharges: makeDefaultSlabs(),
      additionalCharges: makeDefaultSlabs(),
    })),
  }));
}

function hasEnabledZoneCharges(serviceCharges: ServiceChargeConfig[]): boolean {
  return serviceCharges.some(
    (service) => service.enabled && service.zoneCharges.some((zone) => zone.enabled)
  );
}

function validateClientInfo(values: OnboardClientInfoValues): string | null {
  if (!values.clientName.trim()) return "Client name is required.";
  if (!values.contactNumber.trim()) return "Contact number is required.";
  if (!values.clientEmail.trim()) return "Client email is required.";
  if (!values.cityId) return "Please select a city.";
  if (!values.salesPersonId) return "Please select a sale person.";
  if (!values.pickupCityId) return "Please select a pickup city.";
  if (!values.pickupContactPerson.trim()) return "Pickup contact person is required.";
  if (!values.pickupContactPhone.trim()) return "Pickup contact phone is required.";
  if (!values.pickupLocationName.trim()) return "Pickup location name is required.";
  if (!values.pickupArea.trim()) return "Pickup area is required.";
  if (!values.pickupAddress.trim()) return "Pickup address is required.";
  return null;
}

export default function OnboardClientPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardStep>("client-info");
  const [infoValues, setInfoValues] = useState<OnboardClientInfoValues>(defaultInfo);
  const [deliverySettings, setDeliverySettings] =
    useState<DeliverySettingsValues>(defaultSettings);
  const [serviceCharges, setServiceCharges] = useState<ServiceChargeConfig[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [cities, setCities] = useState<City[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLookups() {
      setLoading(true);
      setError(null);

      try {
        const [citiesRes, adminsRes, servicesRes, zonesRes] = await Promise.all([
          fetch("/api/cities"),
          fetch("/api/admin"),
          fetch("/api/services"),
          fetch("/api/zones"),
        ]);

        const [citiesBody, adminsBody, servicesBody, zonesBody] = await Promise.all([
          citiesRes.json().catch(() => ({})),
          adminsRes.json().catch(() => ({})),
          servicesRes.json().catch(() => ({})),
          zonesRes.json().catch(() => ({})),
        ]);

        if (!citiesRes.ok) {
          throw new Error(citiesBody.error ?? "Failed to load cities");
        }
        if (!adminsRes.ok) {
          throw new Error(adminsBody.error ?? "Failed to load admins");
        }
        if (!servicesRes.ok) {
          throw new Error(servicesBody.error ?? "Failed to load services");
        }
        if (!zonesRes.ok) {
          throw new Error(zonesBody.error ?? "Failed to load zones");
        }

        if (cancelled) return;

        const nextCities = Array.isArray(citiesBody) ? citiesBody : [];
        const nextServices = Array.isArray(servicesBody) ? servicesBody : [];
        const nextZones = Array.isArray(zonesBody) ? zonesBody : [];

        setCities(nextCities);
        setAdmins(Array.isArray(adminsBody) ? adminsBody : []);
        setServices(nextServices);
        setZones(nextZones);
        setServiceCharges(initServiceCharges(nextServices, nextZones));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load form data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLookups();
    return () => {
      cancelled = true;
    };
  }, []);

  const setInfoField = (field: keyof OnboardClientInfoValues, value: string | boolean) => {
    setInfoValues((prev) => ({ ...prev, [field]: value }));
  };

  const stepLabel = useMemo(
    () => (step === "client-info" ? "Client Details" : "Delivery Charges"),
    [step]
  );

  const handleNext = () => {
    const validationError = validateClientInfo(infoValues);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep("delivery-charges");
  };

  const handleBack = () => {
    setError(null);
    setStep("client-info");
  };

  const handleSubmit = async () => {
    const validationError = validateClientInfo(infoValues);
    if (validationError) {
      setError(validationError);
      setStep("client-info");
      return;
    }

    if (!hasEnabledZoneCharges(serviceCharges)) {
      setError("Please enable at least one service with at least one zone for delivery charges.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = buildOnboardClientPayload(
        infoValues,
        deliverySettings,
        serviceCharges,
        cities
      );

      const response = await fetch("/api/clients/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(parseApiErrorMessage(body, `Onboard failed (${response.status})`));
      }

      const clientId = (body as { clientId?: number }).clientId;

      if (logoFile && clientId) {
        const logoForm = new FormData();
        logoForm.append("clientId", String(clientId));
        logoForm.append("logo", logoFile);

        const logoResponse = await fetch("/api/clients/onboard", {
          method: "PUT",
          body: logoForm,
        });

        if (!logoResponse.ok) {
          const logoBody = await logoResponse.json().catch(() => ({}));
          throw new Error(
            parseApiErrorMessage(logoBody, "Client created but logo upload failed")
          );
        }
      }

      router.push("/dashboard/clients?onboarded=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to onboard client");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/clients"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 uppercase hover:text-primary"
          >
            <ArrowLeft size={14} />
            Back to Clients
          </Link>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
          <span className={step === "client-info" ? "text-primary" : "text-slate-400"}>
            1. Client Info
          </span>
          <span className="text-slate-300">/</span>
          <span className={step === "delivery-charges" ? "text-primary" : "text-slate-400"}>
            2. Delivery Charges
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-800">Client Add Form</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">{stepLabel}</p>
        </div>

        <div className="p-6">
          {error ? (
            <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-400 font-medium animate-pulse">Loading form…</p>
          ) : step === "client-info" ? (
            <OnboardClientInfoStep
              values={infoValues}
              onChange={setInfoField}
              cities={cities}
              admins={admins}
              logoFile={logoFile}
              onLogoChange={setLogoFile}
            />
          ) : (
            <OnboardDeliveryChargesStep
              settings={deliverySettings}
              onSettingsChange={setDeliverySettings}
              serviceCharges={serviceCharges}
              onServiceChargesChange={setServiceCharges}
            />
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          {step === "delivery-charges" ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="h-10 px-8 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md hover:bg-primary/90 disabled:opacity-50"
            >
              Back
            </button>
          ) : null}

          {step === "client-info" ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="h-10 px-8 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md hover:bg-primary/90 disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || loading}
              className="h-10 px-8 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
