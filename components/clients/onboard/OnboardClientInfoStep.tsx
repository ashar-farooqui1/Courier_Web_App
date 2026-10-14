"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { FieldError, fieldErrorInputClass } from "@/components/ui/FieldError";
import {
  BANK_DETAILS_SANITIZERS,
  ONBOARD_INFO_SANITIZERS,
} from "@/lib/clients/onboard-validation";
import type { FieldErrors } from "@/lib/validation";
import {
  dialogInputClass,
  dialogLabelClass,
} from "@/components/ui/dialog-styles";
import type { Admin } from "@/types/admin";
import type { City } from "@/lib/types/city";
import type { BankDetailsValues, OnboardClientInfoValues } from "@/lib/types/onboard-client";
interface OnboardClientInfoStepProps {
  values: OnboardClientInfoValues;
  onChange: (field: keyof OnboardClientInfoValues, value: string | boolean) => void;
  bankDetails: BankDetailsValues;
  onBankDetailsChange: (field: keyof BankDetailsValues, value: string) => void;
  cities: City[];
  admins: Admin[];
  errors?: FieldErrors<OnboardClientInfoValues>;
  bankErrors?: FieldErrors<BankDetailsValues>;
}

const Required = () => <span className="text-red-500"> *</span>;

export function OnboardClientInfoStep({
  values,
  onChange,
  bankDetails,
  onBankDetailsChange,
  cities,
  admins,
  errors = {},
  bankErrors = {},
}: OnboardClientInfoStepProps) {
  const change = (field: keyof OnboardClientInfoValues, value: string) => {
    const sanitizer = ONBOARD_INFO_SANITIZERS[field];
    onChange(field, sanitizer ? sanitizer(value) : value);
  };

  const changeBank = (field: keyof BankDetailsValues, value: string) => {
    const sanitizer = BANK_DETAILS_SANITIZERS[field];
    onBankDetailsChange(field, sanitizer ? sanitizer(value) : value);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-700">Client Details:</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className={dialogLabelClass}>Client Name<Required /></label>
            <input
              maxLength={100}
              type="text"
              value={values.clientName}
              onChange={(e) => change("clientName", e.target.value)}
              placeholder="Client Name"
              className={cn(dialogInputClass, errors.clientName && fieldErrorInputClass)}
              required
            />
            <FieldError message={errors.clientName} />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Brand Name</label>
            <input
              maxLength={100}
              type="text"
              value={values.brandName}
              onChange={(e) => change("brandName", e.target.value)}
              placeholder="Brand Name"
              className={cn(dialogInputClass, errors.brandName && fieldErrorInputClass)}
            />
            <FieldError message={errors.brandName} />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>POC #</label>
            <input
              inputMode="tel"
              maxLength={13}
              type="text"
              value={values.pocNumber}
              onChange={(e) => change("pocNumber", e.target.value)}
              placeholder="POC #"
              className={cn(dialogInputClass, errors.pocNumber && fieldErrorInputClass)}
            />
            <FieldError message={errors.pocNumber} />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Contact #<Required /></label>
            <input
              inputMode="tel"
              maxLength={13}
              type="text"
              value={values.contactNumber}
              onChange={(e) => change("contactNumber", e.target.value)}
              placeholder="03001234567"
              className={cn(dialogInputClass, errors.contactNumber && fieldErrorInputClass)}
              required
            />
            <FieldError message={errors.contactNumber} />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Client Email<Required /></label>
            <input
              maxLength={100}
              type="email"
              value={values.clientEmail}
              onChange={(e) => change("clientEmail", e.target.value)}
              placeholder="Client Email"
              className={cn(dialogInputClass, errors.clientEmail && fieldErrorInputClass)}
              required
            />
            <FieldError message={errors.clientEmail} />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>CNIC Number</label>
            <input
              inputMode="numeric"
              type="text"
              value={values.cnicNumber}
              onChange={(e) => change("cnicNumber", e.target.value)}
              placeholder="42201-1234567-1"
              className={cn(dialogInputClass, errors.cnicNumber && fieldErrorInputClass)}
            />
            <FieldError message={errors.cnicNumber} />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>NTN</label>
            <input
              inputMode="numeric"
              type="text"
              value={values.ntn}
              onChange={(e) => change("ntn", e.target.value)}
              placeholder="NTN"
              className={cn(dialogInputClass, errors.ntn && fieldErrorInputClass)}
            />
            <FieldError message={errors.ntn} />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Client Address</label>
            <input
              maxLength={250}
              type="text"
              value={values.clientAddress}
              onChange={(e) => change("clientAddress", e.target.value)}
              placeholder="Client Address"
              className={cn(dialogInputClass, errors.clientAddress && fieldErrorInputClass)}
            />
            <FieldError message={errors.clientAddress} />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Client Area</label>
            <input
              maxLength={100}
              type="text"
              value={values.clientArea}
              onChange={(e) => change("clientArea", e.target.value)}
              placeholder="Client Area"
              className={cn(dialogInputClass, errors.clientArea && fieldErrorInputClass)}
            />
            <FieldError message={errors.clientArea} />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Select City<Required /></label>
            <select
              value={values.cityId}
              onChange={(e) => change("cityId", e.target.value)}
              className={cn(dialogInputClass, errors.cityId && fieldErrorInputClass)}
              required
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city.cityId} value={city.cityId}>
                  {city.cityName}
                </option>
              ))}
            </select>
            <FieldError message={errors.cityId} />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Select Sale Person<Required /></label>
            <select
              value={values.salesPersonId}
              onChange={(e) => change("salesPersonId", e.target.value)}
              className={cn(dialogInputClass, errors.salesPersonId && fieldErrorInputClass)}
              required
            >
              <option value="">Select Sale Person</option>
              {admins.map((admin) => (
                <option key={admin.adminId} value={admin.adminId}>
                  {admin.adminName.trim()} ({admin.designation})
                </option>
              ))}
            </select>
            <FieldError message={errors.salesPersonId} />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-6">
        <h2 className="text-sm font-bold text-slate-700">Pickup Location:</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className={dialogLabelClass}>Contact Person<Required /></label>
            <input
              maxLength={100}
              type="text"
              value={values.pickupContactPerson}
              onChange={(e) => change("pickupContactPerson", e.target.value)}
              placeholder="Contact Person"
              className={cn(dialogInputClass, errors.pickupContactPerson && fieldErrorInputClass)}
              required
            />
            <FieldError message={errors.pickupContactPerson} />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Contact Phone<Required /></label>
            <input
              inputMode="tel"
              maxLength={13}
              type="tel"
              value={values.pickupContactPhone}
              onChange={(e) => change("pickupContactPhone", e.target.value)}
              placeholder="03001234567"
              className={cn(dialogInputClass, errors.pickupContactPhone && fieldErrorInputClass)}
              required
            />
            <FieldError message={errors.pickupContactPhone} />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Location Name<Required /></label>
            <input
              maxLength={100}
              type="text"
              value={values.pickupLocationName}
              onChange={(e) => change("pickupLocationName", e.target.value)}
              placeholder="Location Name"
              className={cn(dialogInputClass, errors.pickupLocationName && fieldErrorInputClass)}
              required
            />
            <FieldError message={errors.pickupLocationName} />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Select Pickup City<Required /></label>
            <select
              value={values.pickupCityId}
              onChange={(e) => change("pickupCityId", e.target.value)}
              className={cn(dialogInputClass, errors.pickupCityId && fieldErrorInputClass)}
              required
            >
              <option value="">--Select Pickup City--</option>
              {cities.map((city) => (
                <option key={`pickup-${city.cityId}`} value={city.cityId}>
                  {city.cityName}
                </option>
              ))}
            </select>
            <FieldError message={errors.pickupCityId} />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Area<Required /></label>
            <input
              maxLength={100}
              type="text"
              value={values.pickupArea}
              onChange={(e) => change("pickupArea", e.target.value)}
              placeholder="Area"
              className={cn(dialogInputClass, errors.pickupArea && fieldErrorInputClass)}
              required
            />
            <FieldError message={errors.pickupArea} />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className={dialogLabelClass}>Address<Required /></label>
            <input
              maxLength={250}
              type="text"
              value={values.pickupAddress}
              onChange={(e) => change("pickupAddress", e.target.value)}
              placeholder="Address"
              className={cn(dialogInputClass, errors.pickupAddress && fieldErrorInputClass)}
              required
            />
            <FieldError message={errors.pickupAddress} />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={values.pickupIsDefault}
            onChange={(e) => onChange("pickupIsDefault", e.target.checked)}
            className="rounded border-slate-300 text-primary focus:ring-primary"
          />
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
            Set as default pickup location
          </span>
        </label>
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-6">
        <h2 className="text-sm font-bold text-slate-700">Bank Details:</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className={dialogLabelClass}>Bank Name</label>
            <input
              maxLength={100}
              type="text"
              value={bankDetails.bankName}
              onChange={(e) => changeBank("bankName", e.target.value)}
              placeholder="Bank Name"
              className={cn(dialogInputClass, bankErrors.bankName && fieldErrorInputClass)}
            />
            <FieldError message={bankErrors.bankName} />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Account Title</label>
            <input
              maxLength={100}
              type="text"
              value={bankDetails.accountTitle}
              onChange={(e) => changeBank("accountTitle", e.target.value)}
              placeholder="Account Title"
              className={cn(dialogInputClass, bankErrors.accountTitle && fieldErrorInputClass)}
            />
            <FieldError message={bankErrors.accountTitle} />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Branch Name</label>
            <input
              maxLength={100}
              type="text"
              value={bankDetails.branchName}
              onChange={(e) => changeBank("branchName", e.target.value)}
              placeholder="Branch Name"
              className={cn(dialogInputClass, bankErrors.branchName && fieldErrorInputClass)}
            />
            <FieldError message={bankErrors.branchName} />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>IBAN</label>
            <input
              placeholder="PK36SCBL0000001123456702"
              type="text"
              value={bankDetails.iban}
              onChange={(e) => changeBank("iban", e.target.value)}
              className={cn(dialogInputClass, bankErrors.iban && fieldErrorInputClass)}
            />
            <FieldError message={bankErrors.iban} />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Account Number</label>
            <input
              inputMode="numeric"
              type="text"
              value={bankDetails.accountNumber}
              onChange={(e) => changeBank("accountNumber", e.target.value)}
              placeholder="Account Number"
              className={cn(dialogInputClass, bankErrors.accountNumber && fieldErrorInputClass)}
            />
            <FieldError message={bankErrors.accountNumber} />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Bank City</label>
            <input
              maxLength={100}
              type="text"
              value={bankDetails.bankCity}
              onChange={(e) => changeBank("bankCity", e.target.value)}
              placeholder="Bank City"
              className={cn(dialogInputClass, bankErrors.bankCity && fieldErrorInputClass)}
            />
            <FieldError message={bankErrors.bankCity} />
          </div>
        </div>
      </div>
    </div>
  );
}
