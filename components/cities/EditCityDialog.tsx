"use client";

import React, { useEffect, useState } from "react";
import {
  AppDialog,
  DialogBody,
  DialogError,
  DialogFormFooter,
  DialogLoading,
} from "@/components/ui/AppDialog";
import { parseApiErrorMessage } from "@/lib/api/errors";
import { CITY_FIELD_RULES, CityFormFields } from "@/components/cities/CityFormFields";
import {
  FIX_FIELDS_MESSAGE,
  clearFieldError,
  hasErrors,
  validateFields,
  type FieldErrors,
} from "@/lib/validation";
import type { City, CreateCityPayload, UpdateCityPayload } from "@/lib/types/city";
import type { Zone } from "@/lib/types/zone";

const FORM_ID = "edit-city-form";

interface EditCityDialogProps {
  city: City | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function EditCityDialog({ city, onClose, onSuccess }: EditCityDialogProps) {
  const isOpen = city !== null;
  const [values, setValues] = useState<UpdateCityPayload>({
    cityName: "",
    zoneId: 0,
    shortForm: "",
    province: "",
    status: "Active",
  });
  const [zones, setZones] = useState<Zone[]>([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<CreateCityPayload>>({});

  useEffect(() => {
    if (!city) return;

    setValues({
      cityName: city.cityName,
      zoneId: city.zoneId,
      shortForm: city.shortForm,
      province: city.province ?? "",
      status: city.status,
    });
    setError(null);
    setFieldErrors({});
    setSubmitting(false);
    setLoadingZones(true);

    fetch("/api/zones")
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? `Failed to load zones (${response.status})`);
        }
        const data: Zone[] = await response.json();
        setZones(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setZones([]);
        setError(err instanceof Error ? err.message : "Failed to load zones");
      })
      .finally(() => setLoadingZones(false));
  }, [city]);

  const setField = <K extends keyof UpdateCityPayload>(field: K, value: UpdateCityPayload[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => clearFieldError(prev, field));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) return;

    const fieldErrors = validateFields(values, CITY_FIELD_RULES);
    setFieldErrors(fieldErrors);
    if (hasErrors(fieldErrors)) {
      setError(FIX_FIELDS_MESSAGE);
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: UpdateCityPayload = {
      cityName: values.cityName.trim(),
      zoneId: Number(values.zoneId),
      shortForm: values.shortForm.trim().toUpperCase(),
      province: values.province.trim(),
      status: values.status.trim(),
    };

    if (!payload.cityName || !payload.shortForm || !payload.province || !payload.status) {
      setError("Please fill in all required fields.");
      setSubmitting(false);
      return;
    }

    if (!payload.zoneId) {
      setError("Please select a zone.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/cities/${city.cityId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(parseApiErrorMessage(body, `Update failed (${response.status})`));
      }

      onSuccess(body.message ?? "City updated successfully");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update city");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit City"
      maxWidth="lg"
      disableClose={submitting}
      footer={
        <DialogFormFooter
          formId={FORM_ID}
          onCancel={onClose}
          submitLabel="Update City"
          submittingLabel="Saving..."
          submitting={submitting || loadingZones}
        />
      }
    >
      <DialogBody>
        {error ? <DialogError message={error} /> : null}

        {loadingZones ? (
          <DialogLoading message="Loading zones…" />
        ) : (
          <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="space-y-4">
            <CityFormFields values={values} zones={zones} onChange={setField} errors={fieldErrors} />
          </form>
        )}
      </DialogBody>
    </AppDialog>
  );
}
