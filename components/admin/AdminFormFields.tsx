"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  dialogFileInputClass,
  dialogInputClass,
  dialogLabelClass,
} from "@/components/ui/dialog-styles";
import type { Role } from "@/types/role";

export interface AdminFormValues {
  adminName: string;
  cnic: string;
  contactNumber: string;
  adminEmail: string;
  designation: string;
  roleId: string;
}

interface AdminFormFieldsProps {
  values: AdminFormValues;
  onChange: (field: keyof AdminFormValues, value: string) => void;
  adminImage: File | null;
  onImageChange: (file: File | null) => void;
  showRole?: boolean;
  roles?: Role[];
  loadingRoles?: boolean;
  existingImageUrl?: string | null;
  existingImageAlt?: string;
}

export function AdminFormFields({
  values,
  onChange,
  adminImage,
  onImageChange,
  showRole = false,
  roles = [],
  loadingRoles = false,
  existingImageUrl,
  existingImageAlt,
}: AdminFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className={dialogLabelClass}>
          Admin Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={values.adminName}
          onChange={(e) => onChange("adminName", e.target.value)}
          className={dialogInputClass}
          required
        />
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>
          CNIC <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={values.cnic}
          onChange={(e) => onChange("cnic", e.target.value)}
          className={dialogInputClass}
          required
        />
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>
          Contact Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={values.contactNumber}
          onChange={(e) => onChange("contactNumber", e.target.value)}
          className={dialogInputClass}
          required
        />
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>
          Admin Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={values.adminEmail}
          onChange={(e) => onChange("adminEmail", e.target.value)}
          className={dialogInputClass}
          required
        />
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>Designation</label>
        <input
          type="text"
          value={values.designation}
          onChange={(e) => onChange("designation", e.target.value)}
          className={dialogInputClass}
        />
      </div>

      {showRole && (
        <div className="space-y-1">
          <label className={dialogLabelClass}>
            Role <span className="text-red-500">*</span>
          </label>
          <select
            value={values.roleId}
            onChange={(e) => onChange("roleId", e.target.value)}
            className={cn(dialogInputClass, "cursor-pointer appearance-none")}
            required
            disabled={loadingRoles}
          >
            <option value="">Select role</option>
            {roles.map((role) => (
              <option key={role.roleId} value={role.roleId}>
                {role.roleName}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-1">
        <label className={dialogLabelClass}>Admin Image</label>
        {existingImageUrl && (
          <img
            src={existingImageUrl}
            alt={existingImageAlt ?? "Admin"}
            className="h-16 w-16 rounded object-cover border border-slate-200 mb-2"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
          className={dialogFileInputClass}
        />
        {existingImageUrl && (
          <p className="text-[10px] text-slate-400">Leave empty to keep current image</p>
        )}
      </div>
    </div>
  );
}
