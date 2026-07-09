"use client";

import React from "react";
import { dialogInputClass, dialogLabelClass } from "@/components/ui/dialog-styles";
import type { CreateCityPayload } from "@/lib/types/city";
import type { Zone } from "@/lib/types/zone";

const PROVINCE_OPTIONS = ["Sindh", "Punjab", "Balochistan", "KPK"];

interface CityFormFieldsProps {
  values: CreateCityPayload;
  zones: Zone[];
  onChange: <K extends keyof CreateCityPayload>(field: K, value: CreateCityPayload[K]) => void;
  zonePlaceholder?: string;
}

export function CityFormFields({
  values,
  zones,
  onChange,
  zonePlaceholder = "Select Zone",
}: CityFormFieldsProps) {
  return (
    <>
      <div className="space-y-1.5">
        <label className={dialogLabelClass}>City Name *</label>
        <input
          type="text"
          value={values.cityName}
          onChange={(e) => onChange("cityName", e.target.value)}
          placeholder="Enter city name"
          className={dialogInputClass}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className={dialogLabelClass}>Zone *</label>
        <select
          value={values.zoneId || ""}
          onChange={(e) => onChange("zoneId", Number(e.target.value))}
          className={dialogInputClass}
          required
        >
          <option value="" disabled>
            {zonePlaceholder}
          </option>
          {zones.map((zone) => (
            <option key={zone.zoneId} value={zone.zoneId}>
              {zone.zoneName}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className={dialogLabelClass}>Province *</label>
        <select
          value={values.province}
          onChange={(e) => onChange("province", e.target.value)}
          className={dialogInputClass}
          required
        >
          <option value="" disabled>
            Select Province
          </option>
          {PROVINCE_OPTIONS.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className={dialogLabelClass}>Short Form *</label>
        <input
          type="text"
          value={values.shortForm}
          onChange={(e) => onChange("shortForm", e.target.value.toUpperCase())}
          placeholder="e.g. HYD"
          maxLength={10}
          className={dialogInputClass}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className={dialogLabelClass}>Status *</label>
        <select
          value={values.status}
          onChange={(e) => onChange("status", e.target.value)}
          className={dialogInputClass}
          required
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
    </>
  );
}
