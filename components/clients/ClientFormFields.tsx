'use client';

import React from 'react';
import {
  dialogFileInputClass,
  dialogInputClass,
  dialogLabelClass,
} from '@/components/ui/dialog-styles';
import type { CreateClientFormValues } from '@/lib/types/create-client';

export const inputClass = dialogInputClass;
export const labelClass = dialogLabelClass;

interface ClientFormFieldsProps {
  values: CreateClientFormValues;
  onChange: (field: keyof CreateClientFormValues, value: string) => void;
  logoFile: File | null;
  onLogoChange: (file: File | null) => void;
  hideRoleAndServices?: boolean;
}

export function ClientFormFields({
  values,
  onChange,
  logoFile,
  onLogoChange,
  hideRoleAndServices = false,
}: ClientFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className={labelClass}>Status</label>
        <select
          value={values.status}
          onChange={(e) => onChange('status', e.target.value)}
          className={inputClass}
        >
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Brand Name</label>
        <input
          type="text"
          value={values.brandName}
          onChange={(e) => onChange('brandName', e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Client Name</label>
        <input
          type="text"
          value={values.clientName}
          onChange={(e) => onChange('clientName', e.target.value)}
          className={inputClass}
          required
        />
      </div>
      <div className="space-y-1">
        <label className={labelClass}>POC #</label>
        <input
          type="text"
          value={values.pocNumber}
          onChange={(e) => onChange('pocNumber', e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Contact #</label>
        <input
          type="text"
          value={values.contactNumber}
          onChange={(e) => onChange('contactNumber', e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Client Email</label>
        <input
          type="email"
          value={values.clientEmail}
          onChange={(e) => onChange('clientEmail', e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <label className={labelClass}>Client Logo</label>
        <input
          type="file"
          accept="image/*"
          key={logoFile?.name ?? 'no-file'}
          onChange={(e) => onLogoChange(e.target.files?.[0] ?? null)}
          className={dialogFileInputClass}
        />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <label className={labelClass}>Client Billing Address</label>
        <input
          type="text"
          value={values.clientBillingAddress}
          onChange={(e) => onChange('clientBillingAddress', e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <label className={labelClass}>Client Pickup Address</label>
        <input
          type="text"
          value={values.clientPickupAddress}
          onChange={(e) => onChange('clientPickupAddress', e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Base Town</label>
        <input
          type="text"
          value={values.baseTown}
          onChange={(e) => onChange('baseTown', e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        <label className={labelClass}>City</label>
        <input
          type="text"
          value={values.city}
          onChange={(e) => onChange('city', e.target.value)}
          className={inputClass}
        />
      </div>
      {!hideRoleAndServices && (
        <div className="space-y-1">
          <label className={labelClass}>Role Id</label>
          <input
            type="number"
            min={0}
            value={values.roleId}
            onChange={(e) => onChange('roleId', e.target.value)}
            className={inputClass}
          />
        </div>
      )}
    </div>
  );
}
