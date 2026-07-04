"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { dialogLabelClass } from "@/components/ui/dialog-styles";
import { ChargeSlabEditor } from "@/components/clients/onboard/ChargeSlabEditor";
import type {
  DeliverySettingsValues,
  ServiceChargeConfig,
} from "@/lib/types/onboard-client";

interface OnboardDeliveryChargesStepProps {
  settings: DeliverySettingsValues;
  onSettingsChange: (settings: DeliverySettingsValues) => void;
  serviceCharges: ServiceChargeConfig[];
  onServiceChargesChange: (charges: ServiceChargeConfig[]) => void;
}

export function OnboardDeliveryChargesStep({
  settings,
  onSettingsChange,
  serviceCharges,
  onServiceChargesChange,
}: OnboardDeliveryChargesStepProps) {
  const updateSetting = <K extends keyof DeliverySettingsValues>(
    field: K,
    value: DeliverySettingsValues[K]
  ) => {
    let next: DeliverySettingsValues = { ...settings, [field]: value };

    if (field === "isFixedFuelSurcharge" && value === true) {
      next = { ...next, isFlexibleFuelSurcharge: false };
    }

    if (field === "isFlexibleFuelSurcharge" && value === true) {
      next = { ...next, isFixedFuelSurcharge: false };
    }

    onSettingsChange(next);
  };

  const updateService = (
    serviceId: number,
    updater: (service: ServiceChargeConfig) => ServiceChargeConfig
  ) => {
    onServiceChargesChange(
      serviceCharges.map((service) =>
        service.serviceId === serviceId ? updater(service) : service
      )
    );
  };

  const toggleService = (serviceId: number) => {
    updateService(serviceId, (service) => ({ ...service, enabled: !service.enabled }));
  };

  const toggleZone = (serviceId: number, zoneId: number) => {
    updateService(serviceId, (service) => ({
      ...service,
      zoneCharges: service.zoneCharges.map((zone) =>
        zone.zoneId === zoneId ? { ...zone, enabled: !zone.enabled } : zone
      ),
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-bold text-slate-700">Delivery Charges</h2>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <input
            type="checkbox"
            checked={settings.isPerKg}
            onChange={(e) => updateSetting("isPerKg", e.target.checked)}
            className="rounded border-slate-300 text-primary focus:ring-primary"
          />
          Per KG
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <input
            type="checkbox"
            checked={settings.isMonthlyInvoicing}
            onChange={(e) => updateSetting("isMonthlyInvoicing", e.target.checked)}
            className="rounded border-slate-300 text-primary focus:ring-primary"
          />
          Is Monthly Invoicing
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <input
            type="checkbox"
            checked={settings.isFixedFuelSurcharge}
            onChange={(e) => updateSetting("isFixedFuelSurcharge", e.target.checked)}
            className="rounded border-slate-300 text-primary focus:ring-primary"
          />
          Fixed Fuel Surcharge
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <input
            type="checkbox"
            checked={settings.isFlexibleFuelSurcharge}
            onChange={(e) => updateSetting("isFlexibleFuelSurcharge", e.target.checked)}
            className="rounded border-slate-300 text-primary focus:ring-primary"
          />
          Flexible Fuel Surcharge
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <input
            type="checkbox"
            checked={settings.isReturnCharges}
            onChange={(e) => updateSetting("isReturnCharges", e.target.checked)}
            className="rounded border-slate-300 text-primary focus:ring-primary"
          />
          Return Charges
        </label>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className={dialogLabelClass}>Fuel Surcharge</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              step="0.01"
              value={settings.fuelSurchargeValue}
              onChange={(e) => updateSetting("fuelSurchargeValue", e.target.value)}
              className="w-24 h-10 px-3 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
            <span className="text-xs font-bold text-slate-500">%</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border border-slate-200 rounded-lg p-3 bg-slate-50/50">
        {serviceCharges.map((service) => (
          <button
            key={service.serviceId}
            type="button"
            onClick={() => toggleService(service.serviceId)}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors",
              service.enabled
                ? "bg-primary text-white"
                : "bg-white border border-slate-200 text-slate-500"
            )}
          >
            <input
              type="checkbox"
              checked={service.enabled}
              onChange={() => toggleService(service.serviceId)}
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            {service.serviceName}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {serviceCharges
          .filter((service) => service.enabled)
          .map((service) => (
            <div
              key={service.serviceId}
              className="border border-slate-200 rounded-lg p-4 space-y-4 bg-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-primary uppercase">{service.serviceName}</h3>
                <div className="flex flex-wrap gap-2">
                  {service.zoneCharges.map((zone) => (
                    <button
                      key={zone.zoneId}
                      type="button"
                      onClick={() => toggleZone(service.serviceId, zone.zoneId)}
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors",
                        zone.enabled
                          ? "bg-primary text-white"
                          : "bg-white border border-slate-200 text-slate-500"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={zone.enabled}
                        onChange={() => toggleZone(service.serviceId, zone.zoneId)}
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      {zone.zoneName}
                    </button>
                  ))}
                </div>
              </div>

              {service.zoneCharges.filter((zone) => zone.enabled).length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  Select at least one zone to set charges for {service.serviceName}.
                </p>
              ) : null}

              {service.zoneCharges
                .filter((zone) => zone.enabled)
                .map((zone) => (
                  <div
                    key={`${service.serviceId}-${zone.zoneId}`}
                    className="border border-slate-100 rounded-lg p-4 space-y-4 bg-slate-50/30"
                  >
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                      {service.serviceName} — {zone.zoneName}
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <ChargeSlabEditor
                        title="Fixed Charges"
                        slabs={zone.fixedCharges}
                        onChange={(slabs) =>
                          updateService(service.serviceId, (current) => ({
                            ...current,
                            zoneCharges: current.zoneCharges.map((z) =>
                              z.zoneId === zone.zoneId ? { ...z, fixedCharges: slabs } : z
                            ),
                          }))
                        }
                      />
                      <ChargeSlabEditor
                        title="Additional Charges"
                        slabs={zone.additionalCharges}
                        onChange={(slabs) =>
                          updateService(service.serviceId, (current) => ({
                            ...current,
                            zoneCharges: current.zoneCharges.map((z) =>
                              z.zoneId === zone.zoneId ? { ...z, additionalCharges: slabs } : z
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>
                ))}
            </div>
          ))}
      </div>
    </div>
  );
}
