"use client";

import React from "react";
import {
  dialogFileInputClass,
  dialogInputClass,
  dialogLabelClass,
} from "@/components/ui/dialog-styles";
import type { Admin } from "@/types/admin";
import type { City } from "@/lib/types/city";
import type { OnboardClientInfoValues } from "@/lib/types/onboard-client";
interface OnboardClientInfoStepProps {
  values: OnboardClientInfoValues;
  onChange: (field: keyof OnboardClientInfoValues, value: string | boolean) => void;
  cities: City[];
  admins: Admin[];
  logoFile: File | null;
  onLogoChange: (file: File | null) => void;
}

export function OnboardClientInfoStep({
  values,
  onChange,
  cities,
  admins,
  logoFile,
  onLogoChange,
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

          <div className="space-y-1">
            <label className={dialogLabelClass}>Client Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onLogoChange(e.target.files?.[0] ?? null)}
              className={dialogFileInputClass}
            />
            {logoFile ? (
              <p className="text-[10px] text-slate-400 truncate">{logoFile.name}</p>
            ) : (
              <p className="text-[10px] text-slate-400">No file chosen</p>
            )}
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
    </div>
  );
}
