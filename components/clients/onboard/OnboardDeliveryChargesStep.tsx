"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { dialogInputClass, dialogLabelClass } from "@/components/ui/dialog-styles";
import { ChargeSlabEditor } from "@/components/clients/onboard/ChargeSlabEditor";
import { parseApiErrorMessage } from "@/lib/api/errors";
import type { AdminSettings } from "@/lib/types/admin-settings";
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
  const [petrolCurrentPrice, setPetrolCurrentPrice] = useState<string | null>(null);
  const [petrolPriceLoading, setPetrolPriceLoading] = useState(false);
  const [petrolPriceError, setPetrolPriceError] = useState<string | null>(null);

  useEffect(() => {
    if (!settings.isFlexibleFuelSurcharge) {
      setPetrolCurrentPrice(null);
      setPetrolPriceError(null);
      setPetrolPriceLoading(false);
      return;
    }

    let cancelled = false;
    setPetrolPriceLoading(true);
    setPetrolPriceError(null);

    fetch("/api/admin/settings")
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(
            parseApiErrorMessage(body, `Failed to load fuel price (${response.status})`)
          );
        }

        const data: AdminSettings = await response.json();
        if (!cancelled) {
          setPetrolCurrentPrice(String(data.petrolCurrentPrice ?? ""));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setPetrolCurrentPrice(null);
          setPetrolPriceError(
            error instanceof Error ? error.message : "Failed to load fuel price from settings"
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPetrolPriceLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [settings.isFlexibleFuelSurcharge]);

  const updateSetting = <K extends keyof DeliverySettingsValues>(
    field: K,
    value: DeliverySettingsValues[K]
  ) => {
    onSettingsChange({ ...settings, [field]: value });
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
        {settings.isFixedFuelSurcharge ? (
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
        ) : null}

        {settings.isFlexibleFuelSurcharge ? (
          <div className="space-y-1">
            <label className={dialogLabelClass}>Fuel Price (from settings)</label>
            <input
              type="text"
              readOnly
              value={
                petrolPriceLoading
                  ? "Loading..."
                  : petrolCurrentPrice !== null
                    ? petrolCurrentPrice
                    : "—"
              }
              className={`${dialogInputClass} w-32 bg-slate-50 text-slate-600 cursor-not-allowed`}
            />
            {petrolPriceError ? (
              <p className="text-[11px] text-red-600 font-medium">{petrolPriceError}</p>
            ) : null}
          </div>
        ) : null}
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
