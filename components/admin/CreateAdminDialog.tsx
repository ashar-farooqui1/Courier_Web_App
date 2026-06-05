"use client";

import React, { useEffect, useState } from "react";
import { AdminFormFields, type AdminFormValues } from "@/components/admin/AdminFormFields";
import {
  AppDialog,
  DialogBody,
  DialogError,
  DialogFormFooter,
} from "@/components/ui/AppDialog";
import { parseApiErrorMessage } from "@/lib/api/errors";

const ADMIN_ROLE_ID = 2;
const FORM_ID = "create-admin-form";

const emptyForm: AdminFormValues = {
  adminName: "",
  cnic: "",
  contactNumber: "",
  adminEmail: "",
  designation: "",
  roleId: String(ADMIN_ROLE_ID),
};

interface CreateAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAdminDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreateAdminDialogProps) {
  const [values, setValues] = useState<AdminFormValues>(emptyForm);
  const [adminImage, setAdminImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setValues(emptyForm);
    setAdminImage(null);
    setError(null);
    setSubmitting(false);
  }, [isOpen]);

  const setField = (field: keyof AdminFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("AdminName", values.adminName.trim());
    formData.append("CNIC", values.cnic.trim());
    formData.append("ContactNumber", values.contactNumber.trim());
    formData.append("AdminEmail", values.adminEmail.trim());
    formData.append("Designation", values.designation.trim());
    formData.append("RoleId", String(ADMIN_ROLE_ID));
    if (adminImage) {
      formData.append("AdminImage", adminImage);
    }

    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        body: formData,
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          parseApiErrorMessage(body, `Create failed (${response.status})`)
        );
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create admin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Admin"
      titleId="create-admin-title"
      maxWidth="2xl"
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
          <AdminFormFields
            values={values}
            onChange={setField}
            adminImage={adminImage}
            onImageChange={setAdminImage}
          />
        </DialogBody>
      </form>
    </AppDialog>
  );
}
