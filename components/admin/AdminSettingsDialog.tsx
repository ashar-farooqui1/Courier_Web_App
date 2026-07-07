"use client";

import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!isOpen) return;

    setValues(defaultAdminSettingsValues);
    setSubmitting(false);
    setError(null);
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
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
        <DialogBody>
          {error ? <DialogError message={error} /> : null}

          {loading ? (
            <DialogLoading message="Loading settings…" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={dialogLabelClass}>NTN</label>
                <textarea
                  value={values.ntn}
                  onChange={(e) => setField("ntn", e.target.value)}
                  className={textareaClass}
                />
              </div>

              <div className="space-y-1">
                <label className={dialogLabelClass}>TexInvNo</label>
                <textarea
                  value={values.texInvNo}
                  onChange={(e) => setField("texInvNo", e.target.value)}
                  className={textareaClass}
                />
              </div>

              <div className="space-y-1">
                <label className={dialogLabelClass}>GST #</label>
                <input
                  type="text"
                  value={values.gstNumber}
                  onChange={(e) => setField("gstNumber", e.target.value)}
                  className={dialogInputClass}
                />
              </div>

              <div className="space-y-1">
                <label className={dialogLabelClass}>STRN</label>
                <input
                  type="text"
                  value={values.strn}
                  onChange={(e) => setField("strn", e.target.value)}
                  className={dialogInputClass}
                />
              </div>

              <div className="space-y-1">
                <label className={dialogLabelClass}>Fuel Factor</label>
                <input
                  type="text"
                  value={values.fuelFactor}
                  onChange={(e) => setField("fuelFactor", e.target.value)}
                  className={dialogInputClass}
                />
              </div>

              <div className="space-y-1">
                <label className={dialogLabelClass}>Petrol Current Price</label>
                <input
                  type="text"
                  value={values.petrolCurrentPrice}
                  onChange={(e) => setField("petrolCurrentPrice", e.target.value)}
                  className={dialogInputClass}
                />
              </div>
            </div>
          )}
        </DialogBody>
      </form>
    </AppDialog>
  );
}
