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
import { buildRiderFormData, riderToFormValues } from "@/lib/riders/rider-form";
import { displayFileRef, isBrowserImageUrl } from "@/lib/riders/rider-display";
import type { CreateRiderFormValues } from "@/lib/types/create-rider";
import type { Rider } from "@/lib/types/rider";

interface EditRiderDialogProps {
  riderId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const FORM_ID = "edit-rider-form";

export function EditRiderDialog({
  riderId,
  isOpen,
  onClose,
  onSuccess,
}: EditRiderDialogProps) {
  const [values, setValues] = useState<CreateRiderFormValues | null>(null);
  const [existingRider, setExistingRider] = useState<Rider | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || riderId === null) return;

    let cancelled = false;

    const loadRider = async () => {
      setLoading(true);
      setLoadError(null);
      setSubmitError(null);
      setImageFile(null);
      setLicenseFile(null);
      setValues(null);
      setExistingRider(null);

      try {
        const response = await fetch(`/api/riders/${riderId}`);
        const payload = (await response.json().catch(() => null)) as Rider & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload?.error ?? `Failed to load rider (${response.status})`);
        }

        if (!cancelled) {
          setExistingRider(payload);
          setValues(riderToFormValues(payload));
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Failed to load rider");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadRider();
    return () => {
      cancelled = true;
    };
  }, [isOpen, riderId]);

  const setField = (field: keyof CreateRiderFormValues, value: string) => {
    setValues((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values || riderId === null) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`/api/riders/${riderId}`, {
        method: "PUT",
        body: buildRiderFormData(values, imageFile, licenseFile),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          parseApiErrorMessage(body, `Failed to update rider (${response.status})`)
        );
      }

      const message =
        (body as { message?: string }).message ?? "Rider updated successfully";
      onSuccess(message);
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to update rider");
    } finally {
      setSubmitting(false);
    }
  };

  const existingImageUrl =
    existingRider && isBrowserImageUrl(existingRider.image)
      ? existingRider.image
      : null;

  return (
    <AppDialog
      isOpen={isOpen && riderId !== null}
      onClose={onClose}
      title={riderId !== null ? `Edit Rider #${riderId}` : "Edit Rider"}
      titleId="edit-rider-title"
      maxWidth="3xl"
      disableClose={submitting}
      footer={
        values && !loading && !loadError ? (
          <DialogFormFooter
            onCancel={onClose}
            submitLabel="Update"
            submittingLabel="Updating…"
            submitting={submitting}
            formId={FORM_ID}
          />
        ) : loadError ? (
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-6 border border-slate-200 text-slate-600 text-[11px] font-bold rounded uppercase hover:bg-slate-50"
          >
            Close
          </button>
        ) : undefined
      }
    >
      {loading ? (
        <DialogLoading message="Loading rider…" />
      ) : loadError ? (
        <DialogBody>
          <DialogError message={loadError} />
        </DialogBody>
      ) : values ? (
        <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <DialogBody>
            {submitError && <DialogError message={submitError} />}
            <RiderFormFields
              values={values}
              onChange={setField}
              imageFile={imageFile}
              onImageChange={setImageFile}
              licenseFile={licenseFile}
              onLicenseChange={setLicenseFile}
              existingImageUrl={existingImageUrl}
              existingLicenseRef={displayFileRef(existingRider?.license)}
            />
          </DialogBody>
        </form>
      ) : null}
    </AppDialog>
  );
}
