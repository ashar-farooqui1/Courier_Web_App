'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { FieldError, fieldErrorInputClass } from '@/components/ui/FieldError';
import { CLIENT_FIELD_SANITIZERS } from '@/lib/clients/client-form';
import type { FieldErrors } from '@/lib/validation';
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
  errors?: FieldErrors<CreateClientFormValues>;
}

export function ClientFormFields({
  values,
  onChange,
  logoFile,
  onLogoChange,
  hideRoleAndServices = false,
  errors = {},
}: ClientFormFieldsProps) {
  const change = (field: keyof CreateClientFormValues, value: string) => {
    const sanitizer = CLIENT_FIELD_SANITIZERS[field];
    onChange(field, sanitizer ? sanitizer(value) : value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className={labelClass}>Status</label>
        <select
          value={values.status}
          onChange={(e) => change('status', e.target.value)}
          className={inputClass}
        >
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Brand Name</label>
        <input
          maxLength={100}
          type="text"
          value={values.brandName}
          onChange={(e) => change('brandName', e.target.value)}
          className={cn(inputClass, errors.brandName && fieldErrorInputClass)}
        />
        <FieldError message={errors.brandName} />
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Client Name</label>
        <input
          maxLength={100}
          type="text"
          value={values.clientName}
          onChange={(e) => change('clientName', e.target.value)}
          className={cn(inputClass, errors.clientName && fieldErrorInputClass)}
          required
        />
        <FieldError message={errors.clientName} />
      </div>
      <div className="space-y-1">
        <label className={labelClass}>POC #</label>
        <input
          inputMode="tel"
          placeholder="03001234567"
          type="text"
          value={values.pocNumber}
          onChange={(e) => change('pocNumber', e.target.value)}
          className={cn(inputClass, errors.pocNumber && fieldErrorInputClass)}
        />
        <FieldError message={errors.pocNumber} />
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Contact #</label>
        <input
          inputMode="tel"
          placeholder="03001234567"
          type="text"
          value={values.contactNumber}
          onChange={(e) => change('contactNumber', e.target.value)}
          className={cn(inputClass, errors.contactNumber && fieldErrorInputClass)}
        />
        <FieldError message={errors.contactNumber} />
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Client Email</label>
        <input
          maxLength={100}
          placeholder="name@example.com"
          type="email"
          value={values.clientEmail}
          onChange={(e) => change('clientEmail', e.target.value)}
          className={cn(inputClass, errors.clientEmail && fieldErrorInputClass)}
        />
        <FieldError message={errors.clientEmail} />
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
          maxLength={250}
          type="text"
          value={values.clientBillingAddress}
          onChange={(e) => change('clientBillingAddress', e.target.value)}
          className={cn(inputClass, errors.clientBillingAddress && fieldErrorInputClass)}
        />
        <FieldError message={errors.clientBillingAddress} />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <label className={labelClass}>Client Pickup Address</label>
        <input
          maxLength={250}
          type="text"
          value={values.clientPickupAddress}
          onChange={(e) => change('clientPickupAddress', e.target.value)}
          className={cn(inputClass, errors.clientPickupAddress && fieldErrorInputClass)}
        />
        <FieldError message={errors.clientPickupAddress} />
      </div>
      <div className="space-y-1">
        <label className={labelClass}>Base Town</label>
        <input
          maxLength={100}
          type="text"
          value={values.baseTown}
          onChange={(e) => change('baseTown', e.target.value)}
          className={cn(inputClass, errors.baseTown && fieldErrorInputClass)}
        />
        <FieldError message={errors.baseTown} />
      </div>
      <div className="space-y-1">
        <label className={labelClass}>City</label>
        <input
          maxLength={100}
          type="text"
          value={values.city}
          onChange={(e) => change('city', e.target.value)}
          className={cn(inputClass, errors.city && fieldErrorInputClass)}
        />
        <FieldError message={errors.city} />
      </div>
      {!hideRoleAndServices && (
        <div className="space-y-1">
          <label className={labelClass}>Role Id</label>
          <input
            type="text"
            inputMode="numeric"
            value={values.roleId}
            onChange={(e) => change('roleId', e.target.value)}
            className={inputClass}
          />
        </div>
      )}
    </div>
  );
}
