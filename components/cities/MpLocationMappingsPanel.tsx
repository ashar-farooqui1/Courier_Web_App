"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Edit2, RefreshCw } from "lucide-react";
import {
  MapCourierLocationDialog,
  type MapCourierLocationSeed,
} from "@/components/cities/MapCourierLocationDialog";
import { parseApiErrorMessage } from "@/lib/api/errors";
import {
  MP_COURIER_CODE,
  type CourierLocationMapping,
  type CourierLocationSyncResult,
  type CourierLocationSyncUnmatched,
} from "@/lib/types/courier-location";

const TABLE_HEADERS = [
  "City",
  "M&P Location ID",
  "M&P Location Name",
  "Action",
] as const;

export function MpLocationMappingsPanel() {
  const [mappings, setMappings] = useState<CourierLocationMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<CourierLocationSyncResult | null>(null);
  const [mapSeed, setMapSeed] = useState<MapCourierLocationSeed | null>(null);
  const [mapOpen, setMapOpen] = useState(false);

  const fetchMappings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/courier-locations/mappings?courierCode=${encodeURIComponent(MP_COURIER_CODE)}`
      );
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(
          parseApiErrorMessage(body, `Request failed (${response.status})`)
        );
      }
      const data: CourierLocationMapping[] = await response.json();
      setMappings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load mappings");
      setMappings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMappings();
  }, [fetchMappings]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 5000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const response = await fetch("/api/courier-locations/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courierCode: MP_COURIER_CODE }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          parseApiErrorMessage(body, `Sync failed (${response.status})`)
        );
      }

      const result = body as CourierLocationSyncResult;
      setSyncResult(result);
      setSuccessMessage(
        `${result.matched} of ${result.totalLocations} matched`
      );
      await fetchMappings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync locations");
    } finally {
      setSyncing(false);
    }
  };

  const openMapDialog = (seed: MapCourierLocationSeed = {}) => {
    setMapSeed(seed);
    setMapOpen(true);
  };

  const handleMapManually = (item: CourierLocationSyncUnmatched) => {
    openMapDialog({
      externalLocationId: item.locationId,
      externalLocationName: item.locationName,
    });
  };

  const handleEdit = (mapping: CourierLocationMapping) => {
    openMapDialog({
      cityId: mapping.cityId,
      externalLocationId: mapping.externalLocationId,
      externalLocationName: mapping.externalLocationName,
    });
  };

  const handleMappingSaved = (message: string) => {
    setSuccessMessage(message);
    setSyncResult((prev) => {
      if (!prev || !mapSeed?.externalLocationId) return prev;
      return {
        ...prev,
        unmatched: prev.unmatched.filter(
          (item) => item.locationId !== mapSeed.externalLocationId
        ),
      };
    });
    fetchMappings();
  };

  return (
    <div className="space-y-6">
      <MapCourierLocationDialog
        isOpen={mapOpen}
        seed={mapSeed}
        onClose={() => {
          setMapOpen(false);
          setMapSeed(null);
        }}
        onSuccess={handleMappingSaved}
      />

      {successMessage ? (
        <div className="p-3 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm font-medium">
          {successMessage}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
            M&P City Mappings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Match Stallionex cities to M&P external locations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openMapDialog()}
            className="h-9 px-4 border border-slate-200 text-slate-600 text-[11px] font-bold rounded uppercase hover:bg-slate-50 transition-all"
          >
            Map Manually
          </button>
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing || loading}
            className="h-9 px-4 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md flex items-center gap-2 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw size={14} className={syncing ? "animate-spin" : undefined} />
            {syncing ? "Syncing..." : "Sync M&P Cities"}
          </button>
        </div>
      </div>

      {syncResult && syncResult.unmatched.length > 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-widest">
            Unmatched locations ({syncResult.unmatched.length})
          </p>
          <ul className="space-y-2">
            {syncResult.unmatched.map((item) => (
              <li
                key={item.locationId}
                className="flex flex-wrap items-center justify-between gap-3 bg-white/70 rounded-lg px-3 py-2 border border-amber-100"
              >
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    {item.locationName}{" "}
                    <span className="text-slate-400">({item.locationId})</span>
                  </p>
                  <p className="text-[11px] text-amber-700">{item.reason}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleMapManually(item)}
                  className="h-8 px-3 bg-amber-600 text-white text-[10px] font-bold rounded uppercase hover:bg-amber-700 transition-colors"
                >
                  Map Manually
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between gap-4">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            Courier: {MP_COURIER_CODE}
          </p>
          {error ? (
            <button
              type="button"
              onClick={fetchMappings}
              className="text-xs font-bold text-primary uppercase hover:underline"
            >
              Retry
            </button>
          ) : null}
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
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={TABLE_HEADERS.length} className="py-16 text-center">
                    <p className="text-slate-400 font-bold animate-pulse text-sm">
                      Loading mappings...
                    </p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={TABLE_HEADERS.length} className="py-16 text-center">
                    <p className="text-red-500 text-sm font-medium">{error}</p>
                  </td>
                </tr>
              ) : mappings.length === 0 ? (
                <tr>
                  <td colSpan={TABLE_HEADERS.length} className="py-16 text-center">
                    <p className="text-slate-300 italic text-sm font-medium">
                      No M&P mappings yet. Click Sync M&P Cities to start.
                    </p>
                  </td>
                </tr>
              ) : (
                mappings.map((mapping) => (
                  <tr
                    key={`${mapping.cityId}-${mapping.externalLocationId}`}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4 text-xs font-bold text-slate-700 uppercase">
                      {mapping.cityName}
                      <span className="ml-2 text-slate-400 normal-case">
                        ({mapping.cityId})
                      </span>
                    </td>
                    <td className="p-4 text-xs font-bold text-primary">
                      {mapping.externalLocationId}
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-600">
                      {mapping.externalLocationName}
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleEdit(mapping)}
                        className="p-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                        aria-label={`Edit mapping for ${mapping.cityName}`}
                      >
                        <Edit2 size={12} />
                      </button>
                    </td>
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
