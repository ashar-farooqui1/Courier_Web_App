"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { Client } from '@/lib/types/client';
import type { Zone } from '@/lib/types/zone';
import type { Courier } from '@/lib/types/courier';

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

function resizePriorities(priorities: Array<number | null>, size: number): Array<number | null> {
  if (priorities.length === size) return priorities;
  if (priorities.length > size) return priorities.slice(0, size);
  return [...priorities, ...Array(size - priorities.length).fill(null)];
}

export default function DeliveryTypesPage() {
  const params = useParams<{ clientId: string }>();
  const clientId = Number(params.clientId);

  const [client, setClient] = useState<Client | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);

  const [types, setTypes] = useState<DeliveryType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [typesError, setTypesError] = useState<string | null>(null);

  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loadingCouriers, setLoadingCouriers] = useState(true);
  const [couriersError, setCouriersError] = useState<string | null>(null);

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

  const loadZones = useCallback(async () => {
    setLoadingTypes(true);
    setTypesError(null);
    try {
      const response = await fetch('/api/zones');
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? `Failed to load zones (${response.status})`);
      }
      const zones = (await response.json()) as Zone[];
      setTypes(
        (Array.isArray(zones) ? zones : []).map((zone) => ({
          id: String(zone.zoneId),
          name: zone.zoneName,
          priorities: [],
        }))
      );
    } catch (err) {
      setTypes([]);
      setTypesError(err instanceof Error ? err.message : 'Failed to load zones');
    } finally {
      setLoadingTypes(false);
    }
  }, []);

  const loadCouriers = useCallback(async () => {
    setLoadingCouriers(true);
    setCouriersError(null);
    try {
      const response = await fetch('/api/couriers');
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? `Failed to load couriers (${response.status})`);
      }
      const data = (await response.json()) as Courier[];
      setCouriers(Array.isArray(data) ? data : []);
    } catch (err) {
      setCouriers([]);
      setCouriersError(err instanceof Error ? err.message : 'Failed to load couriers');
    } finally {
      setLoadingCouriers(false);
    }
  }, []);

  useEffect(() => {
    loadClient();
  }, [loadClient]);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  useEffect(() => {
    loadCouriers();
  }, [loadCouriers]);

  // Keep each zone's priority slots in sync with the number of couriers available.
  useEffect(() => {
    setTypes(prev => prev.map(t => ({ ...t, priorities: resizePriorities(t.priorities, couriers.length) })));
  }, [couriers.length]);

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
            onClick={loadCouriers}
            className="shrink-0 h-8 px-4 bg-red-600 text-white text-[10px] font-bold rounded uppercase hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/30">
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Zone</th>
              {loadingCouriers ? (
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
            {loadingTypes || loadingCouriers ? (
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
    </div>
  );
}
