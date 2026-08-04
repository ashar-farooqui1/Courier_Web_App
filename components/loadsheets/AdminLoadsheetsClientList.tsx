"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FileStack, X } from "lucide-react";
import type { Client } from "@/lib/types/client";

export default function AdminLoadsheetsClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/clients");
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const message = payload && !Array.isArray(payload) ? payload.message : undefined;
        throw new Error(message ?? `Failed to load clients (${response.status})`);
      }
      setClients(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setClients([]);
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  const filteredClients = clients.filter((client) => {
    if (!search.trim()) return true;
    const needle = search.trim().toLowerCase();
    return (
      client.clientName?.toLowerCase().includes(needle) ||
      client.brandName?.toLowerCase().includes(needle) ||
      String(client.clientId).includes(needle)
    );
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileStack className="text-primary" size={22} />
          <h1 className="text-lg font-bold text-slate-800">Loadsheets</h1>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search client…"
          className="h-10 w-64 border border-slate-200 rounded px-3 text-sm"
        />
      </div>

      <p className="text-xs font-medium text-slate-500">Select a client to view their loadsheets.</p>

      {error && (
        <div className="flex items-center justify-between gap-3 bg-red-50 text-red-700 text-sm font-medium px-4 py-3 rounded-lg">
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">Client ID</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">Client Name</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">Brand</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Loading clients…
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400 text-sm">
                    No clients found.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.clientId} className="border-t border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-bold text-slate-700">#{client.clientId}</td>
                    <td className="px-4 py-3 text-slate-600">{client.clientName}</td>
                    <td className="px-4 py-3 text-slate-600">{client.brandName || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/loadsheets/${client.clientId}`}
                        className="h-8 px-4 inline-flex items-center bg-primary text-white text-[11px] font-bold rounded uppercase hover:bg-primary/90"
                      >
                        View Loadsheets
                      </Link>
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
