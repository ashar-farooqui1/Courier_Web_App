"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Edit2, MapPin, Plus, Trash2, X } from "lucide-react";
import { CreatePickupLocationDialog } from "@/components/clients/CreatePickupLocationDialog";
import { EditPickupLocationDialog } from "@/components/clients/EditPickupLocationDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Client } from "@/lib/types/client";
import type { PickupLocation } from "@/lib/types/pickup-location";

const TABLE_HEADERS = [
  "Action",
  "Location Name",
  "Contact Person",
  "City",
  "Area",
  "Address",
  "Contact Phone",
  "Default",
] as const;

export default function ClientPickupLocationsPage() {
  const params = useParams<{ clientId: string }>();
  const clientId = Number(params.clientId);

  const [client, setClient] = useState<Client | null>(null);
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [loadingClient, setLoadingClient] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [clientError, setClientError] = useState<string | null>(null);
  const [locationsError, setLocationsError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<PickupLocation | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<PickupLocation | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingLocationId, setDeletingLocationId] = useState<number | null>(null);

  const loadClient = useCallback(async () => {
    if (!Number.isInteger(clientId) || clientId < 1) {
      setClientError("Invalid client ID");
      setLoadingClient(false);
      return;
    }

    setLoadingClient(true);
    setClientError(null);

    try {
      const response = await fetch(`/api/clients/${clientId}`);
      const payload = (await response.json().catch(() => null)) as
        | (Client & { message?: string })
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? `Failed to load client (${response.status})`);
      }

      setClient(payload as Client);
    } catch (err) {
      setClient(null);
      setClientError(err instanceof Error ? err.message : "Failed to load client");
    } finally {
      setLoadingClient(false);
    }
  }, [clientId]);

  const loadLocations = useCallback(async () => {
    if (!Number.isInteger(clientId) || clientId < 1) {
      setLocationsError("Invalid client ID");
      setLoadingLocations(false);
      return;
    }

    setLoadingLocations(true);
    setLocationsError(null);

    try {
      const response = await fetch(`/api/clients/${clientId}/pickup-locations`);
      const payload = (await response.json().catch(() => null)) as
        | PickupLocation[]
        | { message?: string }
        | null;

      if (!response.ok) {
        const message =
          payload && !Array.isArray(payload) ? payload.message : undefined;
        throw new Error(message ?? `Failed to load pickup locations (${response.status})`);
      }

      setLocations(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setLocations([]);
      setLocationsError(
        err instanceof Error ? err.message : "Failed to load pickup locations"
      );
    } finally {
      setLoadingLocations(false);
    }
  }, [clientId]);

  const loadData = useCallback(async () => {
    await Promise.all([loadClient(), loadLocations()]);
  }, [loadClient, loadLocations]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 5000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const handleUpdated = (message: string) => {
    setSuccessMessage(message);
    setEditingLocation(null);
    loadLocations();
  };

  const openDeleteConfirm = (location: PickupLocation) => {
    setDeleteError(null);
    setLocationToDelete(location);
  };

  const closeDeleteConfirm = () => {
    if (deletingLocationId !== null) return;
    setLocationToDelete(null);
    setDeleteError(null);
  };

  const confirmDeleteLocation = async () => {
    if (!locationToDelete) return;

    setDeletingLocationId(locationToDelete.pickupLocationId);
    setDeleteError(null);

    try {
      const response = await fetch(
        `/api/clients/${clientId}/pickup-locations/${locationToDelete.pickupLocationId}`,
        { method: "DELETE" }
      );

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? `Failed to delete pickup location (${response.status})`);
      }

      setLocationToDelete(null);
      setSuccessMessage(payload?.message ?? "Pickup location deleted successfully");
      await loadLocations();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete pickup location"
      );
    } finally {
      setDeletingLocationId(null);
    }
  };

  const loading = loadingClient || loadingLocations;

  const clientLabel =
    client?.clientName?.trim() ||
    client?.brandName?.trim() ||
    client?.clientCode ||
    `#${clientId}`;

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      <CreatePickupLocationDialog
        clientId={clientId}
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleUpdated}
      />
      <EditPickupLocationDialog
        clientId={clientId}
        location={editingLocation}
        isOpen={editingLocation !== null}
        onClose={() => setEditingLocation(null)}
        onSuccess={handleUpdated}
      />
      <ConfirmDialog
        isOpen={locationToDelete !== null}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDeleteLocation}
        title="Delete Pickup Location"
        message="Are you sure you want to delete this pickup location?"
        description={locationToDelete?.locationName}
        error={deleteError ?? undefined}
        cancelLabel="No"
        confirmLabel="Yes"
        loading={deletingLocationId !== null}
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
            Pickup Locations
          </h1>
          {!loadingClient && client && (
            <p className="text-xs font-bold text-primary">
              {clientLabel}
              <span className="text-slate-400 font-medium ml-2">{client.clientCode}</span>
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          disabled={loading}
          className="h-9 px-4 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          <Plus size={14} />
          Add Pickup Location
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

      {(clientError || locationsError) && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium flex items-center justify-between gap-4">
          <span>{locationsError ?? clientError}</span>
          <button
            type="button"
            onClick={loadData}
            className="shrink-0 h-8 px-4 bg-red-600 text-white text-[10px] font-bold rounded uppercase hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <MapPin size={18} />
          </div>
          <div>
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
              Client Pickup Locations
            </h2>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Add warehouse or pickup points for this client.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                {TABLE_HEADERS.map((header) => (
                  <th
                    key={header}
                    className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[11px] font-medium text-slate-600">
              {loadingLocations ? (
                <tr>
                  <td
                    colSpan={TABLE_HEADERS.length}
                    className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest"
                  >
                    Loading pickup locations…
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td
                    colSpan={TABLE_HEADERS.length}
                    className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest"
                  >
                    No pickup locations found
                  </td>
                </tr>
              ) : (
                locations.map((location) => (
                  <tr
                    key={location.pickupLocationId}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingLocation(location)}
                          className="p-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors flex items-center justify-center"
                          aria-label="Edit pickup location"
                          title="Edit pickup location"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteConfirm(location)}
                          className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center justify-center"
                          aria-label="Delete pickup location"
                          title="Delete pickup location"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 font-bold">{location.locationName}</td>
                    <td className="p-4">{location.contactPerson || "—"}</td>
                    <td className="p-4">{location.cityName ?? location.cityId}</td>
                    <td className="p-4">{location.area}</td>
                    <td className="p-4 text-[10px] max-w-[280px] whitespace-normal">
                      {location.address}
                    </td>
                    <td className="p-4">{location.contactPhone || "—"}</td>
                    <td className="p-4">{location.isDefault ? "Yes" : "No"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
