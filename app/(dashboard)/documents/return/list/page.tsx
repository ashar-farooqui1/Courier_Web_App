"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, Eye, Trash2, Upload, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthSession } from '@/hooks/useAuthRole';
import { buildAppAuthHeaders } from '@/lib/api/app-request-context';
import { parseApiErrorMessage } from '@/lib/api/errors';
import { formatOrderDate } from '@/components/orders/order-columns';
import type { ReturnDocumentListData, ReturnDocumentListItem } from '@/lib/types/return-document';

const ReturnListFilter = ({ label, placeholder, type = "text", value = "" }: any) => (
  <div className="flex-1 min-w-[200px] space-y-1.5">
    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      {type === "select" ? (
        <div className="relative">
          <select className="w-full h-10 px-4 bg-white border border-slate-200 rounded-lg text-xs font-bold text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all">
            <option value="">{placeholder}</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
        </div>
      ) : (
        <input
          type={type}
          defaultValue={value}
          placeholder={placeholder}
          className="w-full h-10 px-4 bg-white border border-slate-200 rounded-lg text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300"
        />
      )}
    </div>
  </div>
);

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === 'closed') return 'bg-emerald-500';
  if (s === 'pending') return 'bg-amber-500';
  return 'bg-slate-400';
}

const TABLE_HEADERS = ['Number', 'Date', 'Courier', 'Shipments', 'Status', 'Action', 'Is Return Mark'];

export default function ReturnDocumentListPage() {
  const router = useRouter();
  const { token, role, user, ready } = useAuthSession();

  const [rows, setRows] = useState<ReturnDocumentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [markError, setMarkError] = useState<string | null>(null);

  const loadReturnDocuments = useCallback(async () => {
    if (!token) {
      setError('Authentication required. Please log in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/orders/return-documents', {
        headers: buildAppAuthHeaders(token, role, user?.userId ?? 0),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(parseApiErrorMessage(payload, `Failed to load return documents (${response.status})`));
      }
      const data = payload as ReturnDocumentListData;
      setRows(data.returnDocuments ?? []);
    } catch (err) {
      setRows([]);
      setError(err instanceof Error ? err.message : 'Failed to load return documents');
    } finally {
      setLoading(false);
    }
  }, [token, role, user?.userId]);

  useEffect(() => {
    if (!ready) return;
    loadReturnDocuments();
  }, [ready, loadReturnDocuments]);

  const handleMarkReturned = async (returnDocumentId: number) => {
    if (!token) {
      setMarkError('Authentication required. Please log in again.');
      return;
    }

    setMarkError(null);
    setMarkingId(returnDocumentId);

    try {
      const response = await fetch('/api/orders/update-return-document-status', {
        method: 'POST',
        headers: buildAppAuthHeaders(token, role, user?.userId ?? 0, {
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ returnDocumentId, status: 'Closed' }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseApiErrorMessage(payload, `Failed to mark return document #${returnDocumentId} (${response.status})`));
      }

      await loadReturnDocuments();
    } catch (err) {
      setMarkError(err instanceof Error ? err.message : 'Failed to update return document status');
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-[1900px] mx-auto animate-in fade-in duration-500 pb-10">
      <Link
        href="/documents/return"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 uppercase hover:text-primary"
      >
        <ArrowLeft size={14} />
        Back to Return Documents
      </Link>

      <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Return Document</h1>

      {/* Main Container Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/10">
          <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest">Return Documents</h2>
        </div>

        <div className="p-8 space-y-10">
          {/* Filters Row 1 */}
          <div className="flex flex-wrap gap-6 items-end">
            <ReturnListFilter label="Couriers" placeholder="All Courier" type="select" />
            <ReturnListFilter label="Clients" placeholder="All Clients" type="select" />
            <ReturnListFilter label="Return Sheet Numbers" placeholder="" />
          </div>

          {/* Filters Row 2 + Search Button */}
          <div className="flex flex-wrap gap-6 items-end">
            <ReturnListFilter label="From" type="date" value="2026-04-30" />
            <ReturnListFilter label="To" type="date" value="2026-04-30" />
            <div className="flex-1 min-w-[200px]">
              <Button className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 transition-all active:scale-95">
                Search
              </Button>
            </div>
            <div className="flex-1 min-w-[200px]"></div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
              {error}
            </div>
          )}
          {markError && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
              {markError}
            </div>
          )}

          {/* Table Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Show</span>
              <select className="h-9 border border-slate-200 rounded px-3 text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary/20">
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </select>
              <span className="text-[10px] font-bold text-slate-500 uppercase">entries</span>
            </div>

            <span className="inline-flex items-center px-4 py-2 rounded-lg bg-amber-500 text-white text-xs font-bold uppercase tracking-widest shadow-sm">
              Pending
            </span>
          </div>

          {/* Table */}
          <div className="border border-slate-100 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/30">
                    {TABLE_HEADERS.map((header, idx) => (
                      <th key={idx} className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={7} className="p-20 text-center text-slate-400 font-bold animate-pulse uppercase tracking-widest text-[10px]">Loading Data...</td></tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-0">
                        <div className="bg-slate-50/50 py-10 text-center">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No Data</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.number} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 text-[11px] font-bold text-primary whitespace-nowrap text-center">{row.number}</td>
                        <td className="p-4 text-[11px] font-medium text-slate-600 whitespace-nowrap text-center">{formatOrderDate(row.date)}</td>
                        <td className="p-4 text-[11px] font-medium text-slate-600 whitespace-nowrap text-center">{row.riderName || '—'}</td>
                        <td className="p-4 text-[11px] font-bold text-slate-700 whitespace-nowrap text-center">{row.shipments}</td>
                        <td className="p-4 text-center">
                          <span className={cn("inline-flex px-3 py-1.5 rounded-lg text-white text-[10px] font-bold uppercase tracking-widest", statusBadgeClass(row.status))}>
                            {row.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              title="View"
                              onClick={() => router.push(`/documents/return/list/${row.number}`)}
                              className="p-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors flex items-center justify-center"
                            >
                              <Eye size={14} />
                            </button>
                            <button type="button" title="Delete" className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button type="button" title="Upload" className="p-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors flex items-center justify-center">
                              <Upload size={14} />
                            </button>
                            <button
                              type="button"
                              title="Mark Returned"
                              onClick={() => handleMarkReturned(row.number)}
                              disabled={markingId === row.number}
                              className="p-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-50"
                            >
                              {markingId === row.number ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">
            <span>Showing {rows.length === 0 ? 0 : 1} to {rows.length} of {rows.length} entries</span>
          </div>
        </div>
      </div>
    </div>
  );
}
