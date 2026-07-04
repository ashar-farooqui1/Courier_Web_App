"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { OnboardDeliveryChargesStep } from "@/components/clients/onboard/OnboardDeliveryChargesStep";
import {
  buildSaveDeliverySettingsPayload,
  initEmptyServiceCharges,
  normalizeDeliverySettings,
  pricingToServiceCharges,
  settingsToFormValues,
  unwrapDeliverySettingsResponse,
} from "@/lib/clients/delivery-charges-form";
import { parseApiErrorMessage } from "@/lib/api/errors";
import type { ClientPricingEntry } from "@/lib/types/client-delivery";
import type { Client } from "@/lib/types/client";
import type {
  DeliverySettingsValues,
  ServiceChargeConfig,
} from "@/lib/types/onboard-client";
import type { Service } from "@/lib/types/service";
import type { Zone } from "@/lib/types/zone";

function buildChargePayloads(clientId: number, serviceCharges: ServiceChargeConfig[]) {
  return serviceCharges
    .filter((service) => service.enabled)
    .flatMap((service) =>
      service.zoneCharges
        .filter((zone) => zone.enabled)
        .map((zone) => ({
          clientId,
          serviceId: service.serviceId,
          zoneId: zone.zoneId,
          fixedCharges: zone.fixedCharges.map((slab) => ({
            weight: Number(slab.weight) || 0,
            charges: Number(slab.charges) || 0,
          })),
          additionalCharges: zone.additionalCharges.map((slab) => ({
            weight: Number(slab.weight) || 0,
            charges: Number(slab.charges) || 0,
          })),
        }))
    );
}

export default function ClientDeliveryChargesPage() {
  const params = useParams<{ clientId: string }>();
  const clientId = Number(params.clientId);

  const [client, setClient] = useState<Client | null>(null);
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettingsValues | null>(null);
  const [serviceCharges, setServiceCharges] = useState<ServiceChargeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!Number.isInteger(clientId) || clientId < 1) {
      setError("Invalid client ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [clientRes, pricingRes, settingsRes, servicesRes, zonesRes] = await Promise.all([
        fetch(`/api/clients/${clientId}`),
        fetch(`/api/clients/${clientId}/pricing`),
        fetch(`/api/clients/${clientId}/delivery-settings`),
        fetch("/api/services"),
        fetch("/api/zones"),
      ]);

      const [clientBody, pricingBody, settingsBody, servicesBody, zonesBody] = await Promise.all([
        clientRes.json().catch(() => ({})),
        pricingRes.json().catch(() => ({})),
        settingsRes.json().catch(() => ({})),
        servicesRes.json().catch(() => ({})),
        zonesRes.json().catch(() => ({})),
      ]);

      if (!clientRes.ok) {
        throw new Error(clientBody.message ?? `Failed to load client (${clientRes.status})`);
      }
      if (!pricingRes.ok) {
        throw new Error(pricingBody.message ?? `Failed to load pricing (${pricingRes.status})`);
      }
      if (!settingsRes.ok) {
        throw new Error(settingsBody.message ?? `Failed to load settings (${settingsRes.status})`);
      }
      if (!servicesRes.ok) {
        throw new Error(servicesBody.message ?? `Failed to load services (${servicesRes.status})`);
      }
      if (!zonesRes.ok) {
        throw new Error(zonesBody.message ?? `Failed to load zones (${zonesRes.status})`);
      }

      const services = Array.isArray(servicesBody) ? (servicesBody as Service[]) : [];
      const zones = Array.isArray(zonesBody) ? (zonesBody as Zone[]) : [];
      const pricing = Array.isArray(pricingBody) ? (pricingBody as ClientPricingEntry[]) : [];

      setClient(clientBody as Client);
      setDeliverySettings(
        settingsToFormValues(
          normalizeDeliverySettings(unwrapDeliverySettingsResponse(settingsBody))
        )
      );
      setServiceCharges(
        pricing.length > 0
          ? pricingToServiceCharges(pricing, services, zones)
          : initEmptyServiceCharges(services, zones)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load delivery charges");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 5000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const handleSave = async () => {
    if (!deliverySettings) return;

    const chargePayloads = buildChargePayloads(clientId, serviceCharges);
    if (chargePayloads.length === 0) {
      setError("Please enable at least one service with at least one zone.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const settingsResponse = await fetch(`/api/clients/${clientId}/delivery-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildSaveDeliverySettingsPayload(clientId, deliverySettings)),
      });

      const settingsResult = await settingsResponse.json().catch(() => ({}));
      if (!settingsResponse.ok) {
        throw new Error(
          parseApiErrorMessage(settingsResult, `Failed to save settings (${settingsResponse.status})`)
        );
      }

      for (const charge of chargePayloads) {
        const chargeResponse = await fetch(`/api/clients/${clientId}/delivery-charges`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(charge),
        });

        const chargeResult = await chargeResponse.json().catch(() => ({}));
        if (!chargeResponse.ok) {
          throw new Error(
            parseApiErrorMessage(chargeResult, `Failed to save delivery charges (${chargeResponse.status})`)
          );
        }
      }

      setSuccessMessage("Delivery charges saved successfully");
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save delivery charges");
    } finally {
      setSubmitting(false);
    }
  };

  const clientLabel =
    client?.clientName?.trim() ||
    client?.brandName?.trim() ||
    client?.clientCode ||
    `#${clientId}`;

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 uppercase hover:text-primary"
        >
          <ArrowLeft size={14} />
          Back to Clients
        </Link>
      </div>

      {successMessage ? (
        <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wide">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="shrink-0 p-1 hover:bg-emerald-100 rounded-full transition-colors"
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-800">Delivery Charges</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">{clientLabel}</p>
        </div>

        <div className="p-6">
          {error ? (
            <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          ) : null}

          {loading || !deliverySettings ? (
            <p className="text-sm text-slate-400 font-medium animate-pulse">Loading delivery charges…</p>
          ) : (
            <OnboardDeliveryChargesStep
              settings={deliverySettings}
              onSettingsChange={setDeliverySettings}
              serviceCharges={serviceCharges}
              onServiceChargesChange={setServiceCharges}
            />
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <Link
            href="/dashboard/clients"
            className="h-10 px-8 border border-slate-200 text-slate-600 text-[11px] font-bold rounded uppercase hover:bg-slate-50 inline-flex items-center"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting || loading || !deliverySettings}
            className="h-10 px-8 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
