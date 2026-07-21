"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { Client } from '@/lib/types/client';
import type { Zone } from '@/lib/types/zone';
import type { Courier } from '@/lib/types/courier';
import type { ZoneCourierMapping } from '@/lib/types/zone-courier';

interface DeliveryType {
  id: string;
  name: string;
  priorities: Array<number | null>;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}

async function fetchJson<T>(url: string, fallbackErrorLabel: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `Failed to load ${fallbackErrorLabel} (${response.status})`);
  }
  return (await response.json()) as T;
}

/** Builds each zone's priority slots (sized to courier count) from previously saved priorities. */
function buildDeliveryTypes(
  zones: Zone[],
  couriers: Courier[],
  savedZoneCouriers: ZoneCourierMapping[]
): DeliveryType[] {
  return zones.map((zone) => {
    const priorities: Array<number | null> = Array(couriers.length).fill(null);
    const mapping = savedZoneCouriers.find((z) => z.zoneId === zone.zoneId);
    mapping?.couriers.forEach(({ courierId, priority }) => {
      const slotIndex = priority - 1;
      if (slotIndex >= 0 && slotIndex < priorities.length) {
        priorities[slotIndex] = courierId;
      }
    });
    return { id: String(zone.zoneId), name: zone.zoneName, priorities };
  });
}

export default function DeliveryTypesPage() {
  const params = useParams<{ clientId: string }>();
  const clientId = Number(params.clientId);

  const [client, setClient] = useState<Client | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);

  const [types, setTypes] = useState<DeliveryType[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const [typesError, setTypesError] = useState<string | null>(null);
  const [couriersError, setCouriersError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const loadClient = useCallback(async () => {
    if (!Number.isInteger(clientId) || clientId < 1) {
      setLoadingClient(false);
      return;
    }
    setLoadingClient(true);
    try {
      const response = await fetch(`/api/clients/${clientId}`);
      if (response.ok) {
        setClient((await response.json()) as Client);
      }
    } finally {
      setLoadingClient(false);
    }
  }, [clientId]);

  // Fetches zones, couriers, and previously saved priorities together and derives the
  // final table state in one pass — avoids a merge-then-patch pipeline where one fetch
  // resolving after another (e.g. under React Strict Mode's double-invoked effects)
  // could overwrite already-merged priorities with a blank state.
  const loadBoard = useCallback(async () => {
    setLoadingBoard(true);
    setTypesError(null);
    setCouriersError(null);

    const savedPromise: Promise<ZoneCourierMapping[]> =
      Number.isInteger(clientId) && clientId > 0
        ? fetch(`/api/clients/${clientId}/zone-couriers`)
            .then((r) => (r.ok ? (r.json() as Promise<ZoneCourierMapping[]>) : []))
            .catch(() => [])
        : Promise.resolve([]);

    const [zonesResult, couriersResult, savedResult] = await Promise.allSettled([
      fetchJson<Zone[]>('/api/zones', 'zones'),
      fetchJson<Courier[]>('/api/couriers', 'couriers'),
      savedPromise,
    ]);

    const zones = zonesResult.status === 'fulfilled' && Array.isArray(zonesResult.value) ? zonesResult.value : [];
    const couriersList =
      couriersResult.status === 'fulfilled' && Array.isArray(couriersResult.value) ? couriersResult.value : [];
    const saved = savedResult.status === 'fulfilled' && Array.isArray(savedResult.value) ? savedResult.value : [];

    if (zonesResult.status === 'rejected') {
      setTypesError(zonesResult.reason instanceof Error ? zonesResult.reason.message : 'Failed to load zones');
    }
    if (couriersResult.status === 'rejected') {
      setCouriersError(
        couriersResult.reason instanceof Error ? couriersResult.reason.message : 'Failed to load couriers'
      );
    }

    setCouriers(couriersList);
    setTypes(buildDeliveryTypes(zones, couriersList, saved));
    setLoadingBoard(false);
  }, [clientId]);

  useEffect(() => {
    loadClient();
  }, [loadClient]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const setPriority = (id: string, slotIndex: number, courierId: number | null) => {
    setTypes(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const next = [...t.priorities];
        next[slotIndex] = courierId;
        return { ...t, priorities: next };
      })
    );
  };

  const handleSave = async () => {
    if (!Number.isInteger(clientId) || clientId < 1) {
      setSaveError('Client session not found.');
      return;
    }

    const zones = types.map(t => ({
      zoneId: Number(t.id),
      couriers: t.priorities
        .map((courierId, slotIndex) =>
          courierId ? { courierId, priority: slotIndex + 1 } : null
        )
        .filter((c): c is { courierId: number; priority: number } => c !== null),
    }));

    setSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    try {
      const response = await fetch(`/api/clients/${clientId}/zone-couriers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zones }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? `Failed to save priorities (${response.status})`);
      }

      setSaveMessage(payload?.message ?? 'Courier priorities saved successfully.');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save priorities');
    } finally {
      setSaving(false);
    }
  };

  const clientLabel =
    client?.clientName?.trim() ||
    client?.brandName?.trim() ||
    client?.clientCode ||
    (loadingClient ? 'Loading…' : `#${clientId}`);

  const priorityColumnCount = Math.max(couriers.length, 1);
  const columnCount = 1 + priorityColumnCount;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <Link
        href="/third-party/delivery-types"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 uppercase hover:text-primary"
      >
        <ArrowLeft size={14} />
        Back to Clients
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Set Courier Priority Per Zone For Third Party Auto Order Creation</h1>
        <span className="text-xs font-bold text-primary uppercase">{clientLabel}</span>
      </div>

      {couriersError && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium flex items-center justify-between gap-4">
          <span>{couriersError}</span>
          <button
            type="button"
            onClick={loadBoard}
            className="shrink-0 h-8 px-4 bg-red-600 text-white text-[10px] font-bold rounded uppercase hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {(saveError || saveMessage) && (
        <div
          className={
            saveError
              ? 'p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium'
              : 'p-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-medium'
          }
        >
          {saveError ?? saveMessage}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/30">
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Zone</th>
              {loadingBoard ? (
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Loading…</th>
              ) : (
                Array.from({ length: priorityColumnCount }).map((_, index) => (
                  <th key={index} className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                    {ordinal(index + 1)} Priority
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loadingBoard ? (
              <tr>
                <td colSpan={columnCount} className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Loading…
                </td>
              </tr>
            ) : typesError ? (
              <tr>
                <td colSpan={columnCount} className="p-12 text-center text-red-500 text-xs font-bold uppercase tracking-widest">
                  {typesError}
                </td>
              </tr>
            ) : types.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                  No zones found
                </td>
              </tr>
            ) : (
              types.map((type) => (
                <tr key={type.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-[11px] font-bold text-slate-500 uppercase">{type.name}</td>
                  {Array.from({ length: priorityColumnCount }).map((_, slotIndex) => {
                    const selectedCourierId = type.priorities[slotIndex] ?? null;
                    return (
                      <td key={slotIndex} className="p-4">
                        <div className="flex justify-center">
                          <select
                            value={selectedCourierId ?? ''}
                            onChange={(e) =>
                              setPriority(type.id, slotIndex, e.target.value ? Number(e.target.value) : null)
                            }
                            className="h-9 min-w-[140px] px-3 bg-slate-50 border border-slate-200 rounded text-[11px] font-bold text-slate-600 focus:outline-none focus:border-primary"
                          >
                            <option value="">Select courier</option>
                            {couriers.map((courier) => {
                              const takenElsewhere = type.priorities.some(
                                (p, i) => i !== slotIndex && p === courier.courierId
                              );
                              return (
                                <option
                                  key={courier.courierId}
                                  value={courier.courierId}
                                  disabled={takenElsewhere}
                                >
                                  {courier.name}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loadingBoard || types.length === 0}
          className="h-10 px-6 bg-primary text-white text-xs font-bold rounded-lg uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save Priorities'}
        </button>
      </div>
    </div>
  );
}
