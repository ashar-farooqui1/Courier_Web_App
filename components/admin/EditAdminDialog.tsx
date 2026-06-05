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
import type { Admin } from "@/types/admin";
import type { Role } from "@/types/role";

interface EditAdminDialogProps {
  admin: Admin | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FORM_ID = "edit-admin-form";

export default function EditAdminDialog({
  admin,
  isOpen,
  onClose,
  onSuccess,
}: EditAdminDialogProps) {
  const [values, setValues] = useState<AdminFormValues | null>(null);
  const [adminImage, setAdminImage] = useState<File | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !admin) return;

    setValues({
      adminName: admin.adminName,
      cnic: admin.cnic,
      contactNumber: admin.contactNumber,
      adminEmail: admin.adminEmail,
      designation: admin.designation,
      roleId: String(admin.roleId),
    });
    setAdminImage(null);
    setError(null);
  }, [isOpen, admin]);

  useEffect(() => {
    if (!isOpen) return;

    const loadRoles = async () => {
      setLoadingRoles(true);
      try {
        const response = await fetch("/api/roles");
        if (!response.ok) throw new Error("Failed to load roles");
        const data: Role[] = await response.json();
        setRoles(data);
      } catch {
        setRoles([]);
      } finally {
        setLoadingRoles(false);
      }
    };

    loadRoles();
  }, [isOpen]);

  const setField = (field: keyof AdminFormValues, value: string) => {
    setValues((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin || !values) return;

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("AdminName", values.adminName.trim());
    formData.append("CNIC", values.cnic.trim());
    formData.append("ContactNumber", values.contactNumber.trim());
    formData.append("AdminEmail", values.adminEmail.trim());
    formData.append("Designation", values.designation.trim());
    formData.append("RoleId", values.roleId);
    if (adminImage) {
      formData.append("AdminImage", adminImage);
    }

    try {
      const response = await fetch(`/api/admin/${admin.adminId}`, {
        method: "PUT",
        body: formData,
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = parseApiErrorMessage(
          body,
          `Update failed (${response.status})`
        );
        throw new Error(
          admin.adminId === 1 && message === "Failed to update admin"
            ? "Super Admin (ID 1) cannot be updated — backend API rejects this record. Try editing another admin or ask backend team to fix."
            : message
        );
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update admin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppDialog
      isOpen={isOpen && admin !== null}
      onClose={onClose}
      title={admin ? `Edit Admin #${admin.adminId}` : "Edit Admin"}
      titleId="edit-admin-title"
      maxWidth="2xl"
      disableClose={submitting}
      footer={
        values ? (
          <DialogFormFooter
            onCancel={onClose}
            submitLabel="Update"
            submittingLabel="Updating…"
            submitting={submitting}
            formId={FORM_ID}
          />
        ) : undefined
      }
    >
      {values && admin ? (
        <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <DialogBody>
            {error && <DialogError message={error} />}
            <AdminFormFields
              values={values}
              onChange={setField}
              adminImage={adminImage}
              onImageChange={setAdminImage}
              showRole
              roles={roles}
              loadingRoles={loadingRoles}
              existingImageUrl={admin.adminImage}
              existingImageAlt={admin.adminName}
            />
          </DialogBody>
        </form>
      ) : null}
    </AppDialog>
  );
}
