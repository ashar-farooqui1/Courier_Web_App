"use client";

import React from "react";
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
}

export function OnboardClientInfoStep({
  values,
  onChange,
  bankDetails,
  onBankDetailsChange,
  cities,
  admins,
}: OnboardClientInfoStepProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-700">Client Details:</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className={dialogLabelClass}>Client Name</label>
            <input
              type="text"
              value={values.clientName}
              onChange={(e) => onChange("clientName", e.target.value)}
              placeholder="Client Name"
              className={dialogInputClass}
              required
            />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Brand Name</label>
            <input
              type="text"
              value={values.brandName}
              onChange={(e) => onChange("brandName", e.target.value)}
              placeholder="Brand Name"
              className={dialogInputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>POC #</label>
            <input
              type="text"
              value={values.pocNumber}
              onChange={(e) => onChange("pocNumber", e.target.value)}
              placeholder="POC #"
              className={dialogInputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Contact #</label>
            <input
              type="text"
              value={values.contactNumber}
              onChange={(e) => onChange("contactNumber", e.target.value)}
              placeholder="Contact #"
              className={dialogInputClass}
              required
            />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Client Email</label>
            <input
              type="email"
              value={values.clientEmail}
              onChange={(e) => onChange("clientEmail", e.target.value)}
              placeholder="Client Email"
              className={dialogInputClass}
              required
            />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>CNIC Number</label>
            <input
              type="text"
              value={values.cnicNumber}
              onChange={(e) => onChange("cnicNumber", e.target.value)}
              placeholder="CNIC Number"
              className={dialogInputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>NTN</label>
            <input
              type="text"
              value={values.ntn}
              onChange={(e) => onChange("ntn", e.target.value)}
              placeholder="NTN"
              className={dialogInputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Client Address</label>
            <input
              type="text"
              value={values.clientAddress}
              onChange={(e) => onChange("clientAddress", e.target.value)}
              placeholder="Client Address"
              className={dialogInputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Client Area</label>
            <input
              type="text"
              value={values.clientArea}
              onChange={(e) => onChange("clientArea", e.target.value)}
              placeholder="Client Area"
              className={dialogInputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Select City</label>
            <select
              value={values.cityId}
              onChange={(e) => onChange("cityId", e.target.value)}
              className={dialogInputClass}
              required
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city.cityId} value={city.cityId}>
                  {city.cityName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Select Sale Person</label>
            <select
              value={values.salesPersonId}
              onChange={(e) => onChange("salesPersonId", e.target.value)}
              className={dialogInputClass}
              required
            >
              <option value="">Select Sale Person</option>
              {admins.map((admin) => (
                <option key={admin.adminId} value={admin.adminId}>
                  {admin.adminName.trim()} ({admin.designation})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-100 pt-6">
        <h2 className="text-sm font-bold text-slate-700">Pickup Location:</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className={dialogLabelClass}>Contact Person</label>
            <input
              type="text"
              value={values.pickupContactPerson}
              onChange={(e) => onChange("pickupContactPerson", e.target.value)}
              placeholder="Contact Person"
              className={dialogInputClass}
              required
            />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Contact Phone</label>
            <input
              type="tel"
              value={values.pickupContactPhone}
              onChange={(e) => onChange("pickupContactPhone", e.target.value)}
              placeholder="Contact Phone"
              className={dialogInputClass}
              required
            />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Location Name</label>
            <input
              type="text"
              value={values.pickupLocationName}
              onChange={(e) => onChange("pickupLocationName", e.target.value)}
              placeholder="Location Name"
              className={dialogInputClass}
              required
            />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Select Pickup City</label>
            <select
              value={values.pickupCityId}
              onChange={(e) => onChange("pickupCityId", e.target.value)}
              className={dialogInputClass}
              required
            >
              <option value="">--Select Pickup City--</option>
              {cities.map((city) => (
                <option key={`pickup-${city.cityId}`} value={city.cityId}>
                  {city.cityName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Area</label>
            <input
              type="text"
              value={values.pickupArea}
              onChange={(e) => onChange("pickupArea", e.target.value)}
              placeholder="Area"
              className={dialogInputClass}
              required
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className={dialogLabelClass}>Address</label>
            <input
              type="text"
              value={values.pickupAddress}
              onChange={(e) => onChange("pickupAddress", e.target.value)}
              placeholder="Address"
              className={dialogInputClass}
              required
            />
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
              type="text"
              value={bankDetails.bankName}
              onChange={(e) => onBankDetailsChange("bankName", e.target.value)}
              placeholder="Bank Name"
              className={dialogInputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Account Title</label>
            <input
              type="text"
              value={bankDetails.accountTitle}
              onChange={(e) => onBankDetailsChange("accountTitle", e.target.value)}
              placeholder="Account Title"
              className={dialogInputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Branch Name</label>
            <input
              type="text"
              value={bankDetails.branchName}
              onChange={(e) => onBankDetailsChange("branchName", e.target.value)}
              placeholder="Branch Name"
              className={dialogInputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>IBAN</label>
            <input
              type="text"
              value={bankDetails.iban}
              onChange={(e) => onBankDetailsChange("iban", e.target.value)}
              placeholder="IBAN"
              className={dialogInputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Account Number</label>
            <input
              type="text"
              value={bankDetails.accountNumber}
              onChange={(e) => onBankDetailsChange("accountNumber", e.target.value)}
              placeholder="Account Number"
              className={dialogInputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={dialogLabelClass}>Bank City</label>
            <input
              type="text"
              value={bankDetails.bankCity}
              onChange={(e) => onBankDetailsChange("bankCity", e.target.value)}
              placeholder="Bank City"
              className={dialogInputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
