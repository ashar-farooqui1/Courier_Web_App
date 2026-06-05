"use client";

import React, { useEffect, useState } from "react";
import { RiderFormFields } from "@/components/riders/RiderFormFields";
import {
  AppDialog,
  DialogBody,
  DialogError,
  DialogFormFooter,
} from "@/components/ui/AppDialog";
import { parseApiErrorMessage } from "@/lib/api/errors";
import { buildRiderFormData } from "@/lib/riders/rider-form";
import {
  defaultCreateRiderFormValues,
  type CreateRiderFormValues,
} from "@/lib/types/create-rider";

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
          submitting={submitting}
          formId={FORM_ID}
        />
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
        <DialogBody>
          {error && <DialogError message={error} />}
          <RiderFormFields
            values={values}
            onChange={setField}
            imageFile={imageFile}
            onImageChange={setImageFile}
            licenseFile={licenseFile}
            onLicenseChange={setLicenseFile}
          />
        </DialogBody>
      </form>
    </AppDialog>
  );
}
