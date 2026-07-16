"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatStatusLabel } from '@/lib/format';
import type { Client } from '@/lib/types/client';

export default function DeliveryTypesClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? `Failed to load clients (${response.status})`);
      }
      const data = (await response.json()) as Client[];
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      setClients([]);
      setError(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter((client) =>
      [client.clientName, client.brandName, client.clientCode, String(client.clientId)]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [clients, search]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Select Client</h1>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="h-9 w-64 pl-9 pr-3 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {error && (
          <div className="mx-6 mt-4 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium flex items-center justify-between gap-4">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchClients}
              className="shrink-0 h-8 px-4 bg-red-600 text-white text-[10px] font-bold rounded uppercase hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/30">
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client ID</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Name</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Name</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Loading clients…
                </td>
              </tr>
            ) : filteredClients.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                  {error ? 'No clients to display' : 'No clients found'}
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.clientId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-[11px] font-bold text-slate-500">
                    {client.clientCode}
                    <span className="block text-[9px] text-slate-400 font-medium">#{client.clientId}</span>
                  </td>
                  <td className="p-4 text-[11px] font-bold text-slate-600">{client.brandName}</td>
                  <td className="p-4 text-[11px] text-slate-600">{client.clientName}</td>
                  <td className="p-4">
                    <span
                      className={cn(
                        'px-2 py-0.5 text-white text-[9px] font-bold rounded uppercase',
                        client.status?.toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                      )}
                    >
                      {formatStatusLabel(client.status)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/third-party/delivery-types/${client.clientId}`}
                      className="inline-flex items-center gap-1.5 h-8 px-3 bg-primary text-white text-[10px] font-bold rounded uppercase hover:bg-primary/90 active:scale-95 transition-all"
                    >
                      Select
                      <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
