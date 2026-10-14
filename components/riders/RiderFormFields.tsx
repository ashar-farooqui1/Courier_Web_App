"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { FieldError, fieldErrorInputClass } from "@/components/ui/FieldError";
import { RIDER_FIELD_SANITIZERS, type RiderFormErrors } from "@/lib/riders/rider-form";
import {
  dialogFileInputClass,
  dialogInputClass,
  dialogLabelClass,
} from "@/components/ui/dialog-styles";
import type { CreateRiderFormValues } from "@/lib/types/create-rider";
import type { City } from "@/lib/types/city";

interface RiderFormFieldsProps {
  values: CreateRiderFormValues;
  onChange: (field: keyof CreateRiderFormValues, value: string) => void;
  imageFile: File | null;
  onImageChange: (file: File | null) => void;
  licenseFile: File | null;
  onLicenseChange: (file: File | null) => void;
  existingImageUrl?: string | null;
  existingLicenseRef?: string | null;
  cities?: City[];
  errors?: RiderFormErrors;
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
  cities,
  errors = {},
}: RiderFormFieldsProps) {
  const change = (field: keyof CreateRiderFormValues, value: string) => {
    const sanitizer = RIDER_FIELD_SANITIZERS[field];
    onChange(field, sanitizer ? sanitizer(value) : value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1 sm:col-span-2">
        <label className={dialogLabelClass}>
          Name <span className="text-red-500">*</span>
        </label>
        <input
          maxLength={100}
          type="text"
          value={values.name}
          onChange={(e) => change("name", e.target.value)}
          className={cn(dialogInputClass, errors.name && fieldErrorInputClass)}
          required
        />
        <FieldError message={errors.name} />
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>
          Contact Number <span className="text-red-500">*</span>
        </label>
        <input
          inputMode="tel"
          maxLength={13}
          placeholder="03001234567"
          type="text"
          value={values.contactNumber}
          onChange={(e) => change("contactNumber", e.target.value)}
          className={cn(dialogInputClass, errors.contactNumber && fieldErrorInputClass)}
          required
        />
        <FieldError message={errors.contactNumber} />
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>
          Email <span className="text-red-500">*</span>
        </label>
        <input
          maxLength={100}
          placeholder="name@example.com"
          type="email"
          value={values.email}
          onChange={(e) => change("email", e.target.value)}
          className={cn(dialogInputClass, errors.email && fieldErrorInputClass)}
          required
        />
        <FieldError message={errors.email} />
      </div>

      <div className="space-y-1 sm:col-span-2">
        <label className={dialogLabelClass}>Address</label>
        <input
          maxLength={250}
          type="text"
          value={values.address}
          onChange={(e) => change("address", e.target.value)}
          className={cn(dialogInputClass, errors.address && fieldErrorInputClass)}
        />
        <FieldError message={errors.address} />
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>Area</label>
        <input
          maxLength={100}
          type="text"
          value={values.area}
          onChange={(e) => change("area", e.target.value)}
          className={cn(dialogInputClass, errors.area && fieldErrorInputClass)}
        />
        <FieldError message={errors.area} />
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>City</label>
        {cities ? (
          <select
            value={values.city}
            onChange={(e) => change("city", e.target.value)}
            className={cn(dialogInputClass, errors.city && fieldErrorInputClass)}
          >
            <option value="">Select City</option>
            {cities.map((city) => (
              <option key={city.cityId} value={city.cityName}>
                {city.cityName}
              </option>
            ))}
          </select>
        ) : (
          <input
            maxLength={100}
            type="text"
            value={values.city}
            onChange={(e) => change("city", e.target.value)}
            className={cn(dialogInputClass, errors.city && fieldErrorInputClass)}
          />
        )}
        <FieldError message={errors.city} />
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>
          CNIC <span className="text-red-500">*</span>
        </label>
        <input
          inputMode="numeric"
          placeholder="42201-1234567-1"
          type="text"
          value={values.cnic}
          onChange={(e) => change("cnic", e.target.value)}
          className={cn(dialogInputClass, errors.cnic && fieldErrorInputClass)}
          required
        />
        <FieldError message={errors.cnic} />
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>Vehicle Registered Number</label>
        <input
          placeholder="e.g. KHI-1234"
          type="text"
          value={values.vehicleRegisteredNumber}
          onChange={(e) => change("vehicleRegisteredNumber", e.target.value)}
          className={cn(dialogInputClass, errors.vehicleRegisteredNumber && fieldErrorInputClass)}
        />
        <FieldError message={errors.vehicleRegisteredNumber} />
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
          className={cn(dialogFileInputClass, errors.image && fieldErrorInputClass)}
        />
        <FieldError message={errors.image} />
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
          className={cn(dialogFileInputClass, errors.license && fieldErrorInputClass)}
        />
        <FieldError message={errors.license} />
        {licenseFile ? (
          <p className="text-[10px] text-slate-400 truncate">{licenseFile.name}</p>
        ) : existingLicenseRef ? (
          <p className="text-[10px] text-slate-400">Leave empty to keep current license</p>
        ) : null}
      </div>
    </div>
  );
}
