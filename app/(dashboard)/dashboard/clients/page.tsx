"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Edit2, X, Layers, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatStatusLabel } from '@/lib/format';
import type { Client } from '@/lib/types/client';
import { EditClientDialog } from '@/components/clients/EditClientDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  emptyClientSearchFilters,
  filterClients,
  hasActiveClientFilters,
  type ClientSearchFilters,
} from '@/lib/clients/filter-clients';

const tableHeaders = [
  'Action', 'Status', 'Client ID', 'Brand Name', 'Client Name', 'POC #', 'Contact #',
  'Client Logo', 'Client Email', 'Client Billing Address', 'Client Pickup Address',
  'Base Town', 'City',
] as const;

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editClientId, setEditClientId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchDraft, setSearchDraft] = useState<ClientSearchFilters>(emptyClientSearchFilters);
  const [appliedSearch, setAppliedSearch] = useState<ClientSearchFilters>(emptyClientSearchFilters);
  const [deletingClientId, setDeletingClientId] = useState<number | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
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

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 5000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const handleClientSaved = (message: string) => {
    setSuccessMessage(message);
    fetchClients();
  };

  const filteredClients = useMemo(
    () => filterClients(clients, appliedSearch),
    [clients, appliedSearch]
  );

  const isSearchActive = hasActiveClientFilters(appliedSearch);
  const total = filteredClients.length;
  const totalAll = clients.length;

  const handleSearch = () => {
    setAppliedSearch({ ...searchDraft });
  };

  const handleClear = () => {
    setSearchDraft(emptyClientSearchFilters);
    setAppliedSearch(emptyClientSearchFilters);
  };

  const openDeleteConfirm = (client: Client) => {
    setDeleteError(null);
    setClientToDelete(client);
  };

  const closeDeleteConfirm = () => {
    if (deletingClientId !== null) return;
    setClientToDelete(null);
    setDeleteError(null);
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;

    setDeletingClientId(clientToDelete.clientId);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/clients/${clientToDelete.clientId}`, {
        method: 'DELETE',
      });
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? `Failed to delete client (${response.status})`);
      }

      setClientToDelete(null);
      handleClientSaved(payload?.message ?? 'Client deleted successfully');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete client');
    } finally {
      setDeletingClientId(null);
    }
  };

  const deleteClientLabel =
    clientToDelete?.clientName?.trim() ||
    clientToDelete?.brandName?.trim() ||
    clientToDelete?.clientCode ||
    (clientToDelete ? `#${clientToDelete.clientId}` : '');

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const updateSearchField = (field: keyof ClientSearchFilters, value: string) => {
    setSearchDraft((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <EditClientDialog
        clientId={editClientId}
        isOpen={editClientId !== null}
        onClose={() => setEditClientId(null)}
        onSuccess={handleClientSaved}
      />
      <ConfirmDialog
        isOpen={clientToDelete !== null}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDeleteClient}
        title="Delete Client"
        message="Are you sure you want to delete this client?"
        description={deleteClientLabel ? `Client: ${deleteClientLabel}` : undefined}
        error={deleteError ?? undefined}
        cancelLabel="No"
        confirmLabel="Yes"
        loading={deletingClientId !== null}
      />

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

      <div className="flex items-center justify-between">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Client List</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/clients/onboard"
            className="h-9 px-4 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <Plus size={14} />
            Add New
          </Link>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4" onKeyDown={handleSearchKeyDown}>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client ID</label>
            <input
              type="text"
              value={searchDraft.clientId}
              onChange={(e) => updateSearchField('clientId', e.target.value)}
              placeholder="Enter Client ID"
              className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Name</label>
            <input
              type="text"
              value={searchDraft.clientName}
              onChange={(e) => updateSearchField('clientName', e.target.value)}
              placeholder="Enter Client Name"
              className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">POC #</label>
            <input
              type="text"
              value={searchDraft.pocNumber}
              onChange={(e) => updateSearchField('pocNumber', e.target.value)}
              placeholder="Enter POC #"
              className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Email</label>
            <input
              type="text"
              value={searchDraft.clientEmail}
              onChange={(e) => updateSearchField('clientEmail', e.target.value)}
              placeholder="Enter Client Email"
              className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact #</label>
            <input
              type="text"
              value={searchDraft.contactNumber}
              onChange={(e) => updateSearchField('contactNumber', e.target.value)}
              placeholder="Enter Contact #"
              className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="h-10 px-8 border border-slate-200 text-slate-600 text-[11px] font-bold rounded uppercase hover:bg-slate-50 active:scale-95 transition-all"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleSearch}
            className="h-10 px-12 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            Search
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Show</span>
            <select className="h-9 border border-slate-200 rounded px-2 text-xs font-bold text-primary">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span className="text-[11px] font-bold text-slate-500 uppercase">entries</span>
          </div>
        </div>

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

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="p-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
                </th>
                {tableHeaders.map((header) => (
                  <th key={header} className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[11px] font-medium text-slate-600">
              {loading ? (
                <tr>
                  <td colSpan={tableHeaders.length + 1} className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Loading clients…
                  </td>
                </tr>
              ) : totalAll === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length + 1} className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                    {error ? 'No clients to display' : 'No clients found'}
                  </td>
                </tr>
              ) : total === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length + 1} className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                    No clients match your search
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.clientId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 align-top">
                      <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditClientId(client.clientId)}
                          className="p-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors flex items-center justify-center"
                          aria-label="Edit client"
                        >
                          <Edit2 size={12} />
                        </button>
                        <Link
                          href={`/dashboard/clients/${client.clientId}/services`}
                          className="p-1.5 bg-slate-700 text-white rounded hover:bg-slate-800 transition-colors flex items-center justify-center"
                          aria-label="Delivery charges"
                          title="Delivery charges"
                        >
                          <Layers size={12} />
                        </Link>
                        <Link
                          href={`/dashboard/clients/${client.clientId}/pickup-locations`}
                          className="p-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors flex items-center justify-center"
                          aria-label="Pickup locations"
                          title="Pickup locations"
                        >
                          <MapPin size={12} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openDeleteConfirm(client)}
                          disabled={deletingClientId === client.clientId}
                          className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Delete client"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <span
                        className={cn(
                          'px-2 py-0.5 text-white text-[9px] font-bold rounded uppercase',
                          client.status?.toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                        )}
                      >
                        {formatStatusLabel(client.status)}
                      </span>
                    </td>
                    <td className="p-4 align-top">
                      <span className="font-bold">{client.clientCode}</span>
                      <span className="block text-[9px] text-slate-400">#{client.clientId}</span>
                    </td>
                    <td className="p-4 align-top font-bold">{client.brandName}</td>
                    <td className="p-4 align-top">{client.clientName}</td>
                    <td className="p-4 align-top">{client.pocNumber}</td>
                    <td className="p-4 align-top">{client.contactNumber}</td>
                    <td className="p-4 align-top">
                      {client.clientLogo ? (
                        <img
                          src={client.clientLogo}
                          alt={client.brandName}
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-4 align-top lowercase text-[10px]">{client.clientEmail}</td>
                    <td className="p-4 align-top text-[10px] max-w-[150px] whitespace-normal">{client.clientBillingAddress}</td>
                    <td className="p-4 align-top text-[10px] max-w-[150px] whitespace-normal">{client.clientPickupAddress}</td>
                    <td className="p-4 align-top text-[10px]">{client.baseTown}</td>
                    <td className="p-4 align-top text-[10px]">{client.city}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50/30 flex items-center justify-between border-t border-slate-50">
          <p className="text-[10px] font-bold text-slate-400 uppercase">
            {total === 0
              ? isSearchActive
                ? `Showing 0 of ${totalAll} entries`
                : 'Showing 0 entries'
              : isSearchActive
                ? `Showing 1 to ${total} of ${totalAll} entries`
                : `Showing 1 to ${total} of ${total} entries`}
          </p>
          {total > 0 && (
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded text-[11px] font-bold bg-primary text-white shadow-md">
                1
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
