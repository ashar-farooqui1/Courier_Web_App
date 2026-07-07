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
import type { CreateCityPayload } from "@/lib/types/city";
import type { Zone } from "@/lib/types/zone";

const FORM_ID = "create-city-form";

const emptyForm: CreateCityPayload = {
  cityName: "",
  zoneId: 0,
  shortForm: "",
  province: "",
  status: "Active",
};

interface CreateCityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function CreateCityDialog({ isOpen, onClose, onSuccess }: CreateCityDialogProps) {
  const [values, setValues] = useState<CreateCityPayload>(emptyForm);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setValues(emptyForm);
    setError(null);
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
  }, [isOpen]);

  const setField = <K extends keyof CreateCityPayload>(field: K, value: CreateCityPayload[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: CreateCityPayload = {
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
      const response = await fetch("/api/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(parseApiErrorMessage(body, `Create failed (${response.status})`));
      }

      onSuccess(body.message ?? "City created successfully");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create city");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add City"
      maxWidth="lg"
      disableClose={submitting}
      footer={
        <DialogFormFooter
          formId={FORM_ID}
          onCancel={onClose}
          submitLabel="Add City"
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
          <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
            <CityFormFields values={values} zones={zones} onChange={setField} />
          </form>
        )}
      </DialogBody>
    </AppDialog>
  );
}
