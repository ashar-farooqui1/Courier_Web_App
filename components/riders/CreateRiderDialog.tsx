"use client";

import React, { useEffect, useState } from "react";
import { RiderFormFields } from "@/components/riders/RiderFormFields";
import {
  AppDialog,
  DialogBody,
  DialogError,
  DialogFormFooter,
  DialogLoading,
} from "@/components/ui/AppDialog";
import { parseApiErrorMessage } from "@/lib/api/errors";
import { buildRiderFormData } from "@/lib/riders/rider-form";
import {
  defaultCreateRiderFormValues,
  type CreateRiderFormValues,
} from "@/lib/types/create-rider";
import type { City } from "@/lib/types/city";

const FORM_ID = "create-rider-form";

interface CreateRiderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function CreateRiderDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreateRiderDialogProps) {
  const [values, setValues] = useState<CreateRiderFormValues>(defaultCreateRiderFormValues);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setValues(defaultCreateRiderFormValues);
    setImageFile(null);
    setLicenseFile(null);
    setError(null);
    setSubmitting(false);
    setLoadingCities(true);

    fetch("/api/cities")
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? `Failed to load cities (${response.status})`);
        }
        const data: City[] = await response.json();
        setCities(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setCities([]);
        setError(err instanceof Error ? err.message : "Failed to load cities");
      })
      .finally(() => setLoadingCities(false));
  }, [isOpen]);

  const setField = (field: keyof CreateRiderFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/riders", {
        method: "POST",
        body: buildRiderFormData(values, imageFile, licenseFile),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          parseApiErrorMessage(body, `Failed to create rider (${response.status})`)
        );
      }

      const message =
        (body as { message?: string }).message ?? "Rider created successfully";
      onSuccess(message);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create rider");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Rider"
      titleId="create-rider-title"
      maxWidth="3xl"
      disableClose={submitting}
      footer={
        <DialogFormFooter
          onCancel={onClose}
          submitLabel="Add"
          submittingLabel="Adding…"
          submitting={submitting || loadingCities}
          formId={FORM_ID}
        />
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
        <DialogBody>
          {error && <DialogError message={error} />}
          {loadingCities ? (
            <DialogLoading message="Loading cities…" />
          ) : (
            <RiderFormFields
              values={values}
              onChange={setField}
              imageFile={imageFile}
              onImageChange={setImageFile}
              licenseFile={licenseFile}
              onLicenseChange={setLicenseFile}
              cities={cities}
            />
          )}
        </DialogBody>
      </form>
    </AppDialog>
  );
}
