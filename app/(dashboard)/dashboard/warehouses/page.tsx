"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit2, Trash2, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Warehouse } from '@/lib/types/warehouse';

export default function WarehousesPage() {
  const tableHeaders = ['Name', 'City', 'Address', 'Action'];

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadWarehouses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/warehouses');
      const payload = (await response.json().catch(() => null)) as
        | Warehouse[]
        | { message?: string }
        | null;

      if (!response.ok) {
        const message = payload && !Array.isArray(payload) ? payload.message : undefined;
        throw new Error(message ?? `Failed to load warehouses (${response.status})`);
      }

      setWarehouses(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setWarehouses([]);
      setError(err instanceof Error ? err.message : 'Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  const filteredWarehouses = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return warehouses;

    return warehouses.filter((warehouse) =>
      [warehouse.name, warehouse.city, warehouse.address]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [warehouses, search]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Show</span>
          <select className="h-9 border border-slate-200 rounded px-2 text-xs font-bold text-primary">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          <span className="text-[11px] font-bold text-slate-500 uppercase">entries</span>
        </div>

        <div className="flex items-center gap-4">
           <div className="relative w-64">
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-4 pr-10 bg-white border border-slate-200 rounded text-xs font-medium focus:outline-none"
              />
              <div className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center bg-primary text-white rounded-r">
                <Search size={14} />
              </div>
           </div>
           <button className="h-10 w-10 bg-primary text-white rounded flex items-center justify-center shadow-md active:scale-95 transition-all">
              <Plus size={18} />
           </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadWarehouses}
            className="shrink-0 h-8 px-4 bg-red-600 text-white text-[10px] font-bold rounded uppercase hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div className="bg-white rounded shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                {tableHeaders.map((header, idx) => (
                  <th key={idx} className={cn(
                    "p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap",
                    header === 'Action' && "text-right"
                  )}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[11px] font-medium text-slate-600">
              {loading ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="py-16 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Loading warehouses…
                  </td>
                </tr>
              ) : filteredWarehouses.length === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="py-16 text-center text-slate-300 italic text-sm font-medium">
                    No warehouses found
                  </td>
                </tr>
              ) : (
                filteredWarehouses.map((wh) => (
                  <tr key={wh.warehouseId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">{wh.name}</td>
                    <td className="p-4">{wh.city}</td>
                    <td className="p-4 text-[10px]">{wh.address}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
                          <Edit2 size={12} />
                        </button>
                        <button className="p-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-white flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase">
             {loading
               ? 'Loading entries…'
               : `Showing 1 to ${filteredWarehouses.length} of ${warehouses.length} entries`}
           </p>
        </div>
      </div>
    </div>
  );
}
