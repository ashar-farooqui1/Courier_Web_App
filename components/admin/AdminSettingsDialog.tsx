"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { FieldError, fieldErrorInputClass } from "@/components/ui/FieldError";
import {
  FIX_FIELDS_MESSAGE,
  clearFieldError,
  hasErrors,
  validateFields,
  type FieldErrors,
} from "@/lib/validation";
import {
  AppDialog,
  DialogBody,
  DialogError,
  DialogFormFooter,
  DialogLoading,
} from "@/components/ui/AppDialog";
import { dialogInputClass, dialogLabelClass } from "@/components/ui/dialog-styles";
import { parseApiErrorMessage } from "@/lib/api/errors";
import {
  ADMIN_SETTINGS_RULES,
  ADMIN_SETTINGS_SANITIZERS,
  adminSettingsToFormValues,
  defaultAdminSettingsValues,
  formValuesToUpdatePayload,
  type AdminSettings,
  type AdminSettingsValues,
} from "@/lib/types/admin-settings";

interface AdminSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const FORM_ID = "admin-settings-form";

const textareaClass = `${dialogInputClass} min-h-[88px] py-3 resize-y`;

export function AdminSettingsDialog({ isOpen, onClose }: AdminSettingsDialogProps) {
  const [values, setValues] = useState<AdminSettingsValues>(defaultAdminSettingsValues);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<AdminSettingsValues>>({});

  useEffect(() => {
    if (!isOpen) return;

    setValues(defaultAdminSettingsValues);
    setSubmitting(false);
    setError(null);
    setFieldErrors({});
    setLoading(true);

    fetch("/api/admin/settings")
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(parseApiErrorMessage(body, `Failed to load settings (${response.status})`));
        }

        const data: AdminSettings = await response.json();
        setValues(adminSettingsToFormValues(data));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load admin settings");
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  const setField = (field: keyof AdminSettingsValues, value: string) => {
    const sanitizer = ADMIN_SETTINGS_SANITIZERS[field];
    setValues((prev) => ({ ...prev, [field]: sanitizer ? sanitizer(value) : value }));
    setFieldErrors((prev) => clearFieldError(prev, field));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const errors = validateFields(values, ADMIN_SETTINGS_RULES);
    setFieldErrors(errors);
    if (hasErrors(errors)) {
      setError(FIX_FIELDS_MESSAGE);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValuesToUpdatePayload(values)),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(parseApiErrorMessage(body, `Save failed (${response.status})`));
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save admin settings");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Settings"
      titleId="admin-settings-title"
      maxWidth="2xl"
      disableClose={submitting || loading}
      footer={
        <DialogFormFooter
          onCancel={onClose}
          submitLabel="Save"
          submittingLabel="Saving…"
          submitting={submitting}
          formId={FORM_ID}
        />
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col min-h-0 flex-1">
        <DialogBody>
          {error ? <DialogError message={error} /> : null}

          {loading ? (
            <DialogLoading message="Loading settings…" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={dialogLabelClass}>NTN</label>
                <textarea
                  maxLength={50}
                  value={values.ntn}
                  onChange={(e) => setField("ntn", e.target.value)}
                  className={cn(textareaClass, fieldErrors.ntn && fieldErrorInputClass)}
                />
                <FieldError message={fieldErrors.ntn} />
              </div>

              <div className="space-y-1">
                <label className={dialogLabelClass}>TexInvNo</label>
                <textarea
                  maxLength={50}
                  value={values.texInvNo}
                  onChange={(e) => setField("texInvNo", e.target.value)}
                  className={cn(textareaClass, fieldErrors.texInvNo && fieldErrorInputClass)}
                />
                <FieldError message={fieldErrors.texInvNo} />
              </div>

              <div className="space-y-1">
                <label className={dialogLabelClass}>GST #</label>
                <input
                  inputMode="numeric"
                  maxLength={20}
                  type="text"
                  value={values.gstNumber}
                  onChange={(e) => setField("gstNumber", e.target.value)}
                  className={cn(dialogInputClass, fieldErrors.gstNumber && fieldErrorInputClass)}
                />
                <FieldError message={fieldErrors.gstNumber} />
              </div>

              <div className="space-y-1">
                <label className={dialogLabelClass}>STRN</label>
                <input
                  inputMode="numeric"
                  maxLength={20}
                  type="text"
                  value={values.strn}
                  onChange={(e) => setField("strn", e.target.value)}
                  className={cn(dialogInputClass, fieldErrors.strn && fieldErrorInputClass)}
                />
                <FieldError message={fieldErrors.strn} />
              </div>

              <div className="space-y-1">
                <label className={dialogLabelClass}>Fuel Factor</label>
                <input
                  inputMode="decimal"
                  type="text"
                  value={values.fuelFactor}
                  onChange={(e) => setField("fuelFactor", e.target.value)}
                  className={cn(dialogInputClass, fieldErrors.fuelFactor && fieldErrorInputClass)}
                />
                <FieldError message={fieldErrors.fuelFactor} />
              </div>

              <div className="space-y-1">
                <label className={dialogLabelClass}>Petrol Current Price</label>
                <input
                  inputMode="decimal"
                  type="text"
                  value={values.petrolCurrentPrice}
                  onChange={(e) => setField("petrolCurrentPrice", e.target.value)}
                  className={cn(dialogInputClass, fieldErrors.petrolCurrentPrice && fieldErrorInputClass)}
                />
                <FieldError message={fieldErrors.petrolCurrentPrice} />
              </div>

              <div className="space-y-1">
                <label className={dialogLabelClass}>Petrol Base Price</label>
                <input
                  inputMode="decimal"
                  type="text"
                  value={values.petrolBasePrice}
                  onChange={(e) => setField("petrolBasePrice", e.target.value)}
                  className={cn(dialogInputClass, fieldErrors.petrolBasePrice && fieldErrorInputClass)}
                />
                <FieldError message={fieldErrors.petrolBasePrice} />
              </div>

              <div className="space-y-1">
                <label className={dialogLabelClass}>Capital GST %</label>
                <input
                  inputMode="decimal"
                  type="text"
                  value={values.capitalGSTPercentage}
                  onChange={(e) => setField("capitalGSTPercentage", e.target.value)}
                  className={cn(dialogInputClass, fieldErrors.capitalGSTPercentage && fieldErrorInputClass)}
                />
                <FieldError message={fieldErrors.capitalGSTPercentage} />
              </div>

              <div className="space-y-1">
                <label className={dialogLabelClass}>AJK GST %</label>
                <input
                  inputMode="decimal"
                  type="text"
                  value={values.ajkgstPercentage}
                  onChange={(e) => setField("ajkgstPercentage", e.target.value)}
                  className={cn(dialogInputClass, fieldErrors.ajkgstPercentage && fieldErrorInputClass)}
                />
                <FieldError message={fieldErrors.ajkgstPercentage} />
              </div>

              <div className="space-y-1">
                <label className={dialogLabelClass}>KPK GST %</label>
                <input
                  inputMode="decimal"
                  type="text"
                  value={values.kpkgstPercentage}
                  onChange={(e) => setField("kpkgstPercentage", e.target.value)}
                  className={cn(dialogInputClass, fieldErrors.kpkgstPercentage && fieldErrorInputClass)}
                />
                <FieldError message={fieldErrors.kpkgstPercentage} />
              </div>

              <div className="space-y-1">
                <label className={dialogLabelClass}>Balochistan GST %</label>
                <input
                  inputMode="decimal"
                  type="text"
                  value={values.balochistanGSTPercentage}
                  onChange={(e) => setField("balochistanGSTPercentage", e.target.value)}
                  className={cn(dialogInputClass, fieldErrors.balochistanGSTPercentage && fieldErrorInputClass)}
                />
                <FieldError message={fieldErrors.balochistanGSTPercentage} />
              </div>

              <div className="space-y-1">
                <label className={dialogLabelClass}>Punjab GST %</label>
                <input
                  inputMode="decimal"
                  type="text"
                  value={values.punjabGSTPercentage}
                  onChange={(e) => setField("punjabGSTPercentage", e.target.value)}
                  className={cn(dialogInputClass, fieldErrors.punjabGSTPercentage && fieldErrorInputClass)}
                />
                <FieldError message={fieldErrors.punjabGSTPercentage} />
              </div>

              <div className="space-y-1">
                <label className={dialogLabelClass}>Sindh GST %</label>
                <input
                  inputMode="decimal"
                  type="text"
                  value={values.sindhGSTPercentage}
                  onChange={(e) => setField("sindhGSTPercentage", e.target.value)}
                  className={cn(dialogInputClass, fieldErrors.sindhGSTPercentage && fieldErrorInputClass)}
                />
                <FieldError message={fieldErrors.sindhGSTPercentage} />
              </div>
            </div>
          )}
        </DialogBody>
      </form>
    </AppDialog>
  );
}
