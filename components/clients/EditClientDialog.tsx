'use client';

import React, { useEffect, useState } from 'react';
import { ClientFormFields } from '@/components/clients/ClientFormFields';
import {
  AppDialog,
  DialogBody,
  DialogError,
  DialogFormFooter,
  DialogLoading,
} from '@/components/ui/AppDialog';
import { buildClientFormData, clientToFormValues } from '@/lib/clients/client-form';
import type { CreateClientFormValues } from '@/lib/types/create-client';
import type { Client } from '@/lib/types/client';

interface EditClientDialogProps {
  clientId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const FORM_ID = 'edit-client-form';

export function EditClientDialog({
  clientId,
  isOpen,
  onClose,
  onSuccess,
}: EditClientDialogProps) {
  const [values, setValues] = useState<CreateClientFormValues | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || clientId === null) return;

    let cancelled = false;

    const loadClient = async () => {
      setLoading(true);
      setLoadError(null);
      setSubmitError(null);
      setLogoFile(null);
      setValues(null);

      try {
        const response = await fetch(`/api/clients/${clientId}`);
        const payload = (await response.json().catch(() => null)) as Client & {
          message?: string;
        };

        if (!response.ok) {
          throw new Error(payload?.message ?? `Failed to load client (${response.status})`);
        }

        if (!cancelled) {
          setValues(clientToFormValues(payload));
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load client');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadClient();
    return () => {
      cancelled = true;
    };
  }, [isOpen, clientId]);

  const setField = (field: keyof CreateClientFormValues, value: string) => {
    setValues((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values || clientId === null) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        body: buildClientFormData(values, logoFile),
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? `Failed to update client (${response.status})`);
      }

      onSuccess(payload?.message ?? 'Client updated successfully');
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update client');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppDialog
      isOpen={isOpen && clientId !== null}
      onClose={onClose}
      title={clientId !== null ? `Edit Client #${clientId}` : 'Edit Client'}
      titleId="edit-client-title"
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
        <DialogLoading message="Loading client…" />
      ) : loadError ? (
        <DialogBody>
          <DialogError message={loadError} />
        </DialogBody>
      ) : values ? (
        <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <DialogBody>
            {submitError && <DialogError message={submitError} />}
            <ClientFormFields
              values={values}
              onChange={setField}
              logoFile={logoFile}
              onLogoChange={setLogoFile}
            />
          </DialogBody>
        </form>
      ) : null}
    </AppDialog>
  );
}
