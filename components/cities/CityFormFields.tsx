"use client";

import React from "react";
import { dialogInputClass, dialogLabelClass } from "@/components/ui/dialog-styles";
import type { CreateCityPayload } from "@/lib/types/city";
import type { Zone } from "@/lib/types/zone";
import { cn } from "@/lib/utils";
import { FieldError, fieldErrorInputClass } from "@/components/ui/FieldError";
import { rules, sanitize, type FieldErrors, type FieldRules } from "@/lib/validation";

export const CITY_FIELD_RULES: FieldRules<CreateCityPayload> = {
  cityName: rules.name("City name", { required: true }),
  zoneId: rules.selected("Zone"),
  province: rules.selected("Province"),
  shortForm: rules.code("Short form", { required: true, min: 2, max: 5 }),
  status: rules.selected("Status"),
};

const PROVINCE_OPTIONS = ["Sindh", "Punjab", "Balochistan", "KPK"];

interface CityFormFieldsProps {
  values: CreateCityPayload;
  zones: Zone[];
  onChange: <K extends keyof CreateCityPayload>(field: K, value: CreateCityPayload[K]) => void;
  zonePlaceholder?: string;
  errors?: FieldErrors<CreateCityPayload>;
}

export function CityFormFields({
  values,
  zones,
  onChange,
  zonePlaceholder = "Select Zone",
  errors = {},
}: CityFormFieldsProps) {
  return (
    <>
      <div className="space-y-1.5">
        <label className={dialogLabelClass}>City Name *</label>
        <input
          maxLength={100}
          type="text"
          value={values.cityName}
          onChange={(e) => onChange("cityName", sanitize.name(e.target.value))}
          placeholder="Enter city name"
          className={cn(dialogInputClass, errors.cityName && fieldErrorInputClass)}
          required
        />
        <FieldError message={errors.cityName} />
      </div>

      <div className="space-y-1.5">
        <label className={dialogLabelClass}>Zone *</label>
        <select
          value={values.zoneId || ""}
          onChange={(e) => onChange("zoneId", Number(e.target.value))}
          className={cn(dialogInputClass, errors.zoneId && fieldErrorInputClass)}
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
        <FieldError message={errors.zoneId} />
      </div>

      <div className="space-y-1.5">
        <label className={dialogLabelClass}>Province *</label>
        <select
          value={values.province}
          onChange={(e) => onChange("province", e.target.value)}
          className={cn(dialogInputClass, errors.province && fieldErrorInputClass)}
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
        <FieldError message={errors.province} />
      </div>

      <div className="space-y-1.5">
        <label className={dialogLabelClass}>Short Form *</label>
        <input
          type="text"
          value={values.shortForm}
          onChange={(e) => onChange("shortForm", sanitize.code(e.target.value, 5))}
          placeholder="e.g. HYD"
          maxLength={5}
          className={cn(dialogInputClass, errors.shortForm && fieldErrorInputClass)}
          required
        />
        <FieldError message={errors.shortForm} />
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
