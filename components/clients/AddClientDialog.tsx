'use client';

import React, { useEffect, useState } from 'react';
import { ClientFormFields } from '@/components/clients/ClientFormFields';
import {
  AppDialog,
  DialogBody,
  DialogError,
  DialogFormFooter,
} from '@/components/ui/AppDialog';
import {
  buildClientFormData,
  CLIENT_FIELD_RULES,
  CREATE_CLIENT_ROLE_ID,
} from '@/lib/clients/client-form';
import {
  defaultCreateClientFormValues,
  type CreateClientFormValues,
} from '@/lib/types/create-client';
import {
  FIX_FIELDS_MESSAGE,
  clearFieldError,
  hasErrors,
  validateFields,
  type FieldErrors,
} from '@/lib/validation';

interface AddClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const FORM_ID = 'add-client-form';

export function AddClientDialog({ isOpen, onClose, onSuccess }: AddClientDialogProps) {
  const [values, setValues] = useState<CreateClientFormValues>(defaultCreateClientFormValues);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<CreateClientFormValues>>({});

  useEffect(() => {
    if (!isOpen) return;
    setValues(defaultCreateClientFormValues);
    setLogoFile(null);
    setSubmitError(null);
    setFieldErrors({});
    setSubmitting(false);
  }, [isOpen]);

  const setField = (field: keyof CreateClientFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => clearFieldError(prev, field));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateFields(values, CLIENT_FIELD_RULES);
    setFieldErrors(errors);
    if (hasErrors(errors)) {
      setSubmitError(FIX_FIELDS_MESSAGE);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        body: buildClientFormData(values, logoFile, {
          roleId: CREATE_CLIENT_ROLE_ID,
          services: null,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? `Failed to create client (${response.status})`);
      }

      onSuccess(payload?.message ?? 'Client created successfully');
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create client');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Client"
      titleId="add-client-title"
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
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col min-h-0 flex-1">
        <DialogBody>
          {submitError && <DialogError message={submitError} />}
          <ClientFormFields
            values={values}
            onChange={setField}
            logoFile={logoFile}
            onLogoChange={setLogoFile}
            errors={fieldErrors}
            hideRoleAndServices
          />
        </DialogBody>
      </form>
    </AppDialog>
  );
}
