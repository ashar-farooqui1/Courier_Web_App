"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AppDialog,
  DialogBody,
  DialogError,
  DialogFormFooter,
  DialogLoading,
} from "@/components/ui/AppDialog";
import type { City } from "@/lib/types/city";
import { cn } from "@/lib/utils";
import { FieldError, fieldErrorInputClass } from "@/components/ui/FieldError";
import {
  FIX_FIELDS_MESSAGE,
  clearFieldError,
  hasErrors,
  rules,
  sanitize,
  validateFields,
  type FieldErrors,
  type FieldRules,
} from "@/lib/validation";
import type { CreatePickupLocationPayload } from "@/lib/types/pickup-location";

const FORM_ID = "create-pickup-location-form";

const inputClass =
  "w-full h-11 px-4 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-400";

const emptyForm = {
  brandName: "",
  contactPerson: "",
  contactPhone: "",
  locationName: "",
  cityId: 0,
  area: "",
  address: "",
  isDefault: false,
};

const PICKUP_FIELD_RULES: FieldRules<typeof emptyForm> = {
  brandName: rules.text("Brand name", { required: true, max: 100 }),
  contactPerson: rules.name("Contact person", { required: true }),
  contactPhone: rules.phone("Contact phone", { required: true }),
  locationName: rules.text("Location name", { required: true, max: 100 }),
  cityId: rules.selected("Pickup city"),
  area: rules.text("Area", { required: true, max: 100 }),
  address: rules.address("Address", { required: true }),
};

function readFormPayload(form: HTMLFormElement, clientId: number): CreatePickupLocationPayload {
  const formData = new FormData(form);

  return {
    clientId,
    brandName: String(formData.get("brandName") ?? "").trim(),
    contactPerson: String(formData.get("contactPerson") ?? "").trim(),
    contactPhone: String(formData.get("contactPhone") ?? "").trim(),
    locationName: String(formData.get("locationName") ?? "").trim(),
    cityId: Number(formData.get("cityId")),
    area: String(formData.get("area") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    isDefault: formData.get("isDefault") === "on",
  };
}

interface CreatePickupLocationDialogProps {
  clientId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function CreatePickupLocationDialog({
  clientId,
  isOpen,
  onClose,
  onSuccess,
}: CreatePickupLocationDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState(emptyForm);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<typeof emptyForm>>({});

  useEffect(() => {
    if (!isOpen) return;

    setValues(emptyForm);
    setError(null);
    setFieldErrors({});
    setSubmitting(false);
    setLoadingCities(true);

    fetch("/api/cities")
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.message ?? `Failed to load cities (${response.status})`);
        }
        const data: City[] = await response.json();
        setCities(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setCities([]);
        setError(err instanceof Error ? err.message : "Failed to load cities");
      })
      .finally(() => setLoadingCities(false));
  }, [clientId, isOpen]);

  const setField = <K extends keyof typeof emptyForm>(field: K, value: (typeof emptyForm)[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => clearFieldError(prev, field));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current ?? e.currentTarget;
    const errors = validateFields(values, PICKUP_FIELD_RULES);
    setFieldErrors(errors);
    if (hasErrors(errors)) {
      setError(FIX_FIELDS_MESSAGE);
      return;
    }

    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload = readFormPayload(form, clientId);

    if (
      !payload.brandName ||
      !payload.contactPerson ||
      !payload.contactPhone ||
      !payload.locationName ||
      !payload.area ||
      !payload.address
    ) {
      setError("Please fill in all required fields.");
      setSubmitting(false);
      return;
    }

    if (!payload.cityId) {
      setError("Please select a pickup city.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/clients/${clientId}/pickup-locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let parsed: { message?: string; success?: boolean } | null = null;
      try {
        parsed = text ? (JSON.parse(text) as { message?: string; success?: boolean }) : null;
      } catch {
        parsed = null;
      }

      if (!response.ok) {
        const errorMessage =
          (parsed && typeof parsed === "object" && parsed.message) ||
          text ||
          `Failed to add pickup location (${response.status})`;
        throw new Error(errorMessage);
      }

      onSuccess(
        (parsed && typeof parsed === "object" && parsed.message) ||
          "Pickup location added successfully"
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add pickup location");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add Client Pickup Location"
      titleId="create-pickup-location-title"
      maxWidth="3xl"
      disableClose={submitting}
      footer={
        !loadingCities ? (
          <DialogFormFooter
            onCancel={onClose}
            submitLabel="Add"
            submittingLabel="Adding…"
            submitting={submitting}
            formId={FORM_ID}
            variant="danger"
          />
        ) : undefined
      }
    >
      {loadingCities ? (
        <DialogLoading message="Loading cities…" />
      ) : (
        <form
          ref={formRef}
          id={FORM_ID}
          noValidate
          onSubmit={handleSubmit}
          className="flex flex-col min-h-0 flex-1"
          autoComplete="off"
        >
          <DialogBody>
            {error && <DialogError message={error} />}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <input
                  maxLength={100}
                  type="text"
                  name="brandName"
                  value={values.brandName}
                  onChange={(e) => setField("brandName", e.target.value)}
                  placeholder="Brand Name"
                  className={cn(inputClass, fieldErrors.brandName && fieldErrorInputClass)}
                  required
                />
                <FieldError message={fieldErrors.brandName} />
              </div>
              <div>
                <input
                  maxLength={100}
                  type="text"
                  name="contactPerson"
                  value={values.contactPerson}
                  onChange={(e) => setField("contactPerson", sanitize.name(e.target.value))}
                  placeholder="Contact Person"
                  className={cn(inputClass, fieldErrors.contactPerson && fieldErrorInputClass)}
                  required
                />
                <FieldError message={fieldErrors.contactPerson} />
              </div>
              <div>
                <input
                  inputMode="tel"
                  maxLength={13}
                  type="tel"
                  name="contactPhone"
                  value={values.contactPhone}
                  onChange={(e) => setField("contactPhone", sanitize.phone(e.target.value))}
                  placeholder="Contact Phone (03001234567)"
                  className={cn(inputClass, fieldErrors.contactPhone && fieldErrorInputClass)}
                  required
                />
                <FieldError message={fieldErrors.contactPhone} />
              </div>
              <div>
                <input
                  maxLength={100}
                  type="text"
                  name="locationName"
                  value={values.locationName}
                  onChange={(e) => setField("locationName", e.target.value)}
                  placeholder="Location Name"
                  className={cn(inputClass, fieldErrors.locationName && fieldErrorInputClass)}
                  required
                />
                <FieldError message={fieldErrors.locationName} />
              </div>
              <div>
                <select
                  name="cityId"
                  value={values.cityId || ""}
                  onChange={(e) => setField("cityId", Number(e.target.value))}
                  className={cn(`${inputClass} ${!values.cityId ? "text-slate-400" : ""}`, fieldErrors.cityId && fieldErrorInputClass)}
                  required
                >
                  <option value="">--Select Pickup City--</option>
                  {cities.map((city) => (
                    <option key={city.cityId} value={city.cityId} className="text-slate-700">
                      {city.cityName}
                    </option>
                  ))}
                </select>
                <FieldError message={fieldErrors.cityId} />
              </div>
              <div>
                <input
                  maxLength={100}
                  type="text"
                  name="area"
                  value={values.area}
                  onChange={(e) => setField("area", e.target.value)}
                  placeholder="Area"
                  className={cn(inputClass, fieldErrors.area && fieldErrorInputClass)}
                  required
                />
                <FieldError message={fieldErrors.area} />
              </div>
              <div>
                <input
                  maxLength={250}
                  type="text"
                  name="address"
                  value={values.address}
                  onChange={(e) => setField("address", e.target.value)}
                  placeholder="Address"
                  className={cn(inputClass, fieldErrors.address && fieldErrorInputClass)}
                  required
                />
                <FieldError message={fieldErrors.address} />
              </div>
            </div>
            <label className="mt-4 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isDefault"
                checked={values.isDefault}
                onChange={(e) => setField("isDefault", e.target.checked)}
                className="rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                Set as default pickup location
              </span>
            </label>
          </DialogBody>
        </form>
      )}
    </AppDialog>
  );
}
