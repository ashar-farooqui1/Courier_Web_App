"use client";

import React from "react";
import { dialogInputClass, dialogLabelClass } from "@/components/ui/dialog-styles";
import type { CreateCityPayload } from "@/lib/types/city";
import type { Service } from "@/lib/types/service";

interface CityFormFieldsProps {
  values: CreateCityPayload;
  services: Service[];
  onChange: <K extends keyof CreateCityPayload>(field: K, value: CreateCityPayload[K]) => void;
  servicePlaceholder?: string;
}

export function CityFormFields({
  values,
  services,
  onChange,
  servicePlaceholder = "Select Service",
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
        <label className={dialogLabelClass}>Service *</label>
        <select
          value={values.serviceId || ""}
          onChange={(e) => onChange("serviceId", Number(e.target.value))}
          className={dialogInputClass}
          required
        >
          <option value="" disabled>
            {servicePlaceholder}
          </option>
          {services.map((service) => (
            <option key={service.serviceId} value={service.serviceId}>
              {service.serviceName}
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
