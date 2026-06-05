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
import { CityFormFields } from "@/components/cities/CityFormFields";
import type { City, CreateCityPayload } from "@/lib/types/city";
import type { Service } from "@/lib/types/service";

const FORM_ID = "edit-city-form";

interface EditCityDialogProps {
  city: City | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function EditCityDialog({ city, onClose, onSuccess }: EditCityDialogProps) {
  const isOpen = city !== null;
  const [values, setValues] = useState<CreateCityPayload>({
    cityName: "",
    serviceId: 0,
    shortForm: "",
    status: "Active",
  });
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city) return;

    setValues({
      cityName: city.cityName,
      serviceId: city.serviceId,
      shortForm: city.shortForm,
      status: city.status,
    });
    setError(null);
    setSubmitting(false);
    setLoadingServices(true);

    fetch("/api/services")
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? `Failed to load services (${response.status})`);
        }
        const data: Service[] = await response.json();
        setServices(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setServices([]);
        setError(err instanceof Error ? err.message : "Failed to load services");
      })
      .finally(() => setLoadingServices(false));
  }, [city]);

  const setField = <K extends keyof CreateCityPayload>(field: K, value: CreateCityPayload[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) return;

    setSubmitting(true);
    setError(null);

    const payload: CreateCityPayload = {
      cityName: values.cityName.trim(),
      serviceId: Number(values.serviceId),
      shortForm: values.shortForm.trim().toUpperCase(),
      status: values.status.trim(),
    };

    if (!payload.cityName || !payload.shortForm || !payload.status) {
      setError("Please fill in all required fields.");
      setSubmitting(false);
      return;
    }

    if (!payload.serviceId) {
      setError("Please select a service.");
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
          submitting={submitting || loadingServices}
        />
      }
    >
      <DialogBody>
        {error ? <DialogError message={error} /> : null}

        {loadingServices ? (
          <DialogLoading message="Loading services…" />
        ) : (
          <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
            <CityFormFields values={values} services={services} onChange={setField} />
          </form>
        )}
      </DialogBody>
    </AppDialog>
  );
}
