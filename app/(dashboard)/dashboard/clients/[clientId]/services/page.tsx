"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, Layers, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Client } from "@/lib/types/client";
import type { Service } from "@/lib/types/service";
import type { ClientAssignedService } from "@/lib/types/client-service";

function uniqueServiceIds(services: ClientAssignedService[]): number[] {
  return [...new Set(services.map((service) => service.serviceId))];
}

export default function AssignClientServicesPage() {
  const params = useParams<{ clientId: string }>();
  const clientId = Number(params.clientId);

  const [client, setClient] = useState<Client | null>(null);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [assignedServiceIds, setAssignedServiceIds] = useState<number[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [removingServiceId, setRemovingServiceId] = useState<number | null>(null);
  const [serviceToRemove, setServiceToRemove] = useState<Service | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
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
      const [clientResponse, servicesResponse, assignedResponse] = await Promise.all([
        fetch(`/api/clients/${clientId}`),
        fetch("/api/services"),
        fetch(`/api/clients/${clientId}/services`),
      ]);

      const clientPayload = (await clientResponse.json().catch(() => null)) as
        | (Client & { message?: string })
        | null;
      const servicesPayload = (await servicesResponse.json().catch(() => null)) as
        | Service[]
        | { message?: string }
        | null;
      const assignedPayload = (await assignedResponse.json().catch(() => null)) as
        | ClientAssignedService[]
        | { message?: string }
        | null;

      if (!clientResponse.ok) {
        throw new Error(clientPayload?.message ?? `Failed to load client (${clientResponse.status})`);
      }
      if (!servicesResponse.ok) {
        const message =
          servicesPayload && !Array.isArray(servicesPayload)
            ? servicesPayload.message
            : undefined;
        throw new Error(message ?? `Failed to load services (${servicesResponse.status})`);
      }
      if (!assignedResponse.ok) {
        const message =
          assignedPayload && !Array.isArray(assignedPayload)
            ? assignedPayload.message
            : undefined;
        throw new Error(message ?? `Failed to load assigned services (${assignedResponse.status})`);
      }

      const assigned = Array.isArray(assignedPayload) ? assignedPayload : [];
      const assignedIds = uniqueServiceIds(assigned);

      setClient(clientPayload as Client);
      setAllServices(Array.isArray(servicesPayload) ? servicesPayload : []);
      setAssignedServiceIds(assignedIds);
      setSelectedIds(assignedIds);
    } catch (err) {
      setClient(null);
      setAllServices([]);
      setAssignedServiceIds([]);
      setSelectedIds([]);
      setError(err instanceof Error ? err.message : "Failed to load page data");
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

  const newlySelectedIds = useMemo(
    () => selectedIds.filter((id) => !assignedServiceIds.includes(id)),
    [assignedServiceIds, selectedIds]
  );

  const toggleService = (serviceId: number) => {
    setSelectedIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const openRemoveConfirm = (service: Service) => {
    setRemoveError(null);
    setServiceToRemove(service);
  };

  const closeRemoveConfirm = () => {
    if (removingServiceId !== null) return;
    setServiceToRemove(null);
    setRemoveError(null);
  };

  const confirmRemoveService = async () => {
    if (!serviceToRemove) return;

    setRemovingServiceId(serviceToRemove.serviceId);
    setRemoveError(null);

    try {
      const response = await fetch(`/api/clients/${clientId}/services`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          serviceId: serviceToRemove.serviceId,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? `Failed to remove service (${response.status})`);
      }

      setServiceToRemove(null);
      setSuccessMessage(payload?.message ?? "Service removed successfully");
      await loadData();
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : "Failed to remove service");
    } finally {
      setRemovingServiceId(null);
    }
  };

  const handleAssign = async () => {
    if (selectedIds.length === 0) {
      setError("Select at least one service to assign");
      return;
    }

    const serviceIdsToAssign = selectedIds.filter((id) => !assignedServiceIds.includes(id));
    if (serviceIdsToAssign.length === 0) {
      setError("Selected services are already assigned to this client");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/clients/${clientId}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          serviceIds: serviceIdsToAssign,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? `Failed to assign services (${response.status})`);
      }

      setSuccessMessage(payload?.message ?? "Services assigned successfully");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign services");
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
    <div className="space-y-6 max-w-[960px] mx-auto animate-in fade-in duration-500">
      <ConfirmDialog
        isOpen={serviceToRemove !== null}
        onClose={closeRemoveConfirm}
        onConfirm={confirmRemoveService}
        title="Remove Service"
        message="Are you sure you want to remove this service from the client?"
        description={serviceToRemove?.serviceName}
        error={removeError ?? undefined}
        cancelLabel="No"
        confirmLabel="Yes"
        loading={removingServiceId !== null}
      />
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/dashboard/clients"
            className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Clients
          </Link>
          <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Manage Services
          </h1>
          {!loading && client && (
            <p className="text-xs font-bold text-primary">
              {clientLabel}
              <span className="text-slate-400 font-medium ml-2">{client.clientCode}</span>
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleAssign}
          disabled={submitting || loading || newlySelectedIds.length === 0}
          className="h-9 px-5 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={14} />
          {submitting ? "Assigning…" : "Assign Services"}
        </button>
      </div>

      {successMessage && (
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
      )}

      {error && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Layers size={18} />
          </div>
          <div>
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
              Available Services
            </h2>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Assign new services or remove existing ones from this client.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
            Loading services…
          </div>
        ) : allServices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
            No services available
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {allServices.map((service) => {
              const isAssigned = assignedServiceIds.includes(service.serviceId);
              const isChecked = selectedIds.includes(service.serviceId);

              return (
                <li key={service.serviceId}>
                  <div
                    className={cn(
                      "flex items-center justify-between gap-4 px-6 py-4 transition-colors",
                      isChecked ? "bg-primary/5" : "hover:bg-slate-50"
                    )}
                  >
                    <label className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleService(service.serviceId)}
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">
                          {service.serviceName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Service ID: {service.serviceId}
                        </p>
                      </div>
                    </label>
                    <div className="flex items-center gap-2 shrink-0">
                      {isAssigned && (
                        <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded uppercase">
                          Assigned
                        </span>
                      )}
                      {isAssigned && (
                        <button
                          type="button"
                          onClick={() => openRemoveConfirm(service)}
                          disabled={removingServiceId === service.serviceId}
                          className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Remove ${service.serviceName}`}
                          title="Remove service"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
