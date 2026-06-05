"use client";

import React from "react";
import {
  dialogFileInputClass,
  dialogInputClass,
  dialogLabelClass,
} from "@/components/ui/dialog-styles";
import type { CreateRiderFormValues } from "@/lib/types/create-rider";

interface RiderFormFieldsProps {
  values: CreateRiderFormValues;
  onChange: (field: keyof CreateRiderFormValues, value: string) => void;
  imageFile: File | null;
  onImageChange: (file: File | null) => void;
  licenseFile: File | null;
  onLicenseChange: (file: File | null) => void;
  existingImageUrl?: string | null;
  existingLicenseRef?: string | null;
}

export function RiderFormFields({
  values,
  onChange,
  imageFile,
  onImageChange,
  licenseFile,
  onLicenseChange,
  existingImageUrl,
  existingLicenseRef,
}: RiderFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1 sm:col-span-2">
        <label className={dialogLabelClass}>
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
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
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={values.email}
          onChange={(e) => onChange("email", e.target.value)}
          className={dialogInputClass}
          required
        />
      </div>

      <div className="space-y-1 sm:col-span-2">
        <label className={dialogLabelClass}>Address</label>
        <input
          type="text"
          value={values.address}
          onChange={(e) => onChange("address", e.target.value)}
          className={dialogInputClass}
        />
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>Area</label>
        <input
          type="text"
          value={values.area}
          onChange={(e) => onChange("area", e.target.value)}
          className={dialogInputClass}
        />
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>City</label>
        <input
          type="text"
          value={values.city}
          onChange={(e) => onChange("city", e.target.value)}
          className={dialogInputClass}
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
        <label className={dialogLabelClass}>Vehicle Registered Number</label>
        <input
          type="text"
          value={values.vehicleRegisteredNumber}
          onChange={(e) => onChange("vehicleRegisteredNumber", e.target.value)}
          className={dialogInputClass}
        />
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>Image</label>
        {existingImageUrl &&
          (existingImageUrl.startsWith("http://") ||
            existingImageUrl.startsWith("https://")) && (
            <img
              src={existingImageUrl}
              alt="Current rider"
              className="h-16 w-16 rounded object-cover border border-slate-200 mb-2"
            />
          )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
          className={dialogFileInputClass}
        />
        {imageFile ? (
          <p className="text-[10px] text-slate-400 truncate">{imageFile.name}</p>
        ) : existingImageUrl ? (
          <p className="text-[10px] text-slate-400">Leave empty to keep current image</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>License</label>
        {existingLicenseRef && (
          <p className="text-[10px] text-slate-500 truncate mb-1">
            Current: {existingLicenseRef}
          </p>
        )}
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => onLicenseChange(e.target.files?.[0] ?? null)}
          className={dialogFileInputClass}
        />
        {licenseFile ? (
          <p className="text-[10px] text-slate-400 truncate">{licenseFile.name}</p>
        ) : existingLicenseRef ? (
          <p className="text-[10px] text-slate-400">Leave empty to keep current license</p>
        ) : null}
      </div>
    </div>
  );
}
