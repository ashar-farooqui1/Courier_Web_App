"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FileOutput, FileText, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthSession } from '@/hooks/useAuthRole';
import { buildAppAuthHeaders } from '@/lib/api/app-request-context';
import { getDefaultWarehouse } from '@/lib/auth/warehouse';
import { parseContentDispositionFilename } from '@/lib/format';
import { formatOrderDate, formatAmount } from '@/components/orders/order-columns';
import type { Rider } from '@/lib/types/rider';
import type { CreateReturnDocumentPayload } from '@/lib/types/order';

interface ReturnDocumentOrderRow {
  awbNo: string;
  clientName: string;
  customerName: string;
  customerNumber: string;
  amount: number;
  referenceId: string;
  orderDateTime: string;
  status: string;
}

function parseAwbTokens(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((token) => token.trim().toUpperCase())
    .filter(Boolean);
}

function pickString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return '';
}

function pickNumber(record: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = Number(record[key]);
    if (Number.isFinite(value)) return value;
  }
  return 0;
}

function extractReturnDocumentOrders(data: unknown): ReturnDocumentOrderRow[] {
  if (!data || typeof data !== 'object') return [];
  const orders = (data as Record<string, unknown>).orders;
  if (!Array.isArray(orders)) return [];

  return orders
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((record) => ({
      awbNo: pickString(record, ['awbNo', 'AwbNo']),
      clientName: pickString(record, ['clientName', 'ClientName']),
      customerName: pickString(record, ['customerName', 'CustomerName']),
      customerNumber: pickString(record, ['customerNumber', 'CustomerNumber']),
      amount: pickNumber(record, ['amount', 'Amount']),
      referenceId: pickString(record, ['referenceId', 'ReferenceId']),
      orderDateTime: pickString(record, ['orderDateTime', 'OrderDateTime']),
      status: pickString(record, ['status', 'Status']),
    }))
    .filter((row) => row.awbNo);
}

/** Skip-reason buckets CreateReturnDocument returns alongside `orders` — each item has an awbNo + message. */
const RETURN_DOCUMENT_FAILURE_KEYS = ['wrongRoute', 'notFound', 'invalidStatus', 'alreadyOnSheet'];

function extractReturnDocumentFailureMessages(data: unknown): string[] {
  if (!data || typeof data !== 'object') return [];
  const record = data as Record<string, unknown>;

  return RETURN_DOCUMENT_FAILURE_KEYS.flatMap((key) => {
    const list = record[key];
    if (!Array.isArray(list)) return [];

    return list
      .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
      .map(
        (item) =>
          pickString(item, ['message', 'Message']) ||
          `${pickString(item, ['awbNo', 'AwbNo'])} could not be added (${key}).`
      )
      .filter(Boolean);
  });
}

export default function ReturnDocumentPage() {
  const router = useRouter();
  const { token, role, user, ready } = useAuthSession();

  const [data, setData] = useState<ReturnDocumentOrderRow[]>([]);

  const [awbInput, setAwbInput] = useState('');
  const [stagedAwbs, setStagedAwbs] = useState<string[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loadingRiders, setLoadingRiders] = useState(false);
  const [riderId, setRiderId] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<CreateReturnDocumentPayload | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const tableHeaders = [
    'Booking Date', 'AWB ID', 'Client Name', 'Reference #', 'Consultant Number',
    'Amount', 'Attempt', 'Remarks', 'Order Date', 'Picked Up Date', 'Status Date', 'Status', 'Action'
  ];

  useEffect(() => {
    if (!ready) return;
    setLoadingRiders(true);
    fetch('/api/riders')
      .then(async (response) => {
        if (!response.ok) throw new Error('Failed to load riders');
        const data: Rider[] = await response.json();
        setRiders(Array.isArray(data) ? data : []);
      })
      .catch(() => setRiders([]))
      .finally(() => setLoadingRiders(false));
  }, [ready]);

  const addAwbTokens = (raw: string) => {
    const tokens = parseAwbTokens(raw);
    if (tokens.length === 0) return;
    setStagedAwbs((prev) => Array.from(new Set([...prev, ...tokens])));
  };

  const handleAwbKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAwbTokens(awbInput);
      setAwbInput('');
    }
  };

  const removeStagedAwb = (awb: string) => {
    setStagedAwbs((prev) => prev.filter((a) => a !== awb));
  };

  const handleClearLog = () => {
    setStagedAwbs([]);
    setAwbInput('');
    setError(null);
    setSuccessMessage(null);
    setWarningMessage(null);
  };

  const handleCreateReturnDocument = async () => {
    setError(null);
    setSuccessMessage(null);
    setWarningMessage(null);

    if (stagedAwbs.length === 0) {
      setError('Scan or enter at least one AWB.');
      return;
    }

    if (!riderId) {
      setError('Please select a rider.');
      return;
    }

    if (!token) {
      setError('Authentication required. Please log in again.');
      return;
    }

    setCreating(true);
    try {
      const warehouseId = getDefaultWarehouse()?.warehouseId ?? 0;
      const payload: CreateReturnDocumentPayload = {
        awbNo: stagedAwbs,
        riderId: Number(riderId),
        adminId: user?.userId ?? 0,
        warehouseId,
        returnDocumentDate: new Date().toISOString(),
      };

      const response = await fetch('/api/orders/create-return-document', {
        method: 'POST',
        headers: buildAppAuthHeaders(token, role, user?.userId ?? 0, {
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body?.message ?? `Failed to create return document (${response.status})`);
      }

      const rows = extractReturnDocumentOrders(body.data);
      const failureMessages = extractReturnDocumentFailureMessages(body.data);

      setData((prev) => [...rows, ...prev]);
      setSuccessMessage(body.message ?? `${stagedAwbs.length} AWB(s) added to return document.`);
      setWarningMessage(failureMessages.length > 0 ? failureMessages.join(' ') : null);
      setLastPayload(payload);
      setStagedAwbs([]);
      setAwbInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create return document');
    } finally {
      setCreating(false);
    }
  };

  const handleExport = async () => {
    if (!lastPayload) {
      setExportError('Create a return document first.');
      return;
    }

    if (!token) {
      setExportError('Authentication required. Please log in again.');
      return;
    }

    setExportError(null);
    setExporting(true);

    try {
      const response = await fetch('/api/orders/generate-return-document', {
        method: 'POST',
        headers: buildAppAuthHeaders(token, role, user?.userId ?? 0, {
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(lastPayload),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? `Failed to generate return document (${response.status})`);
      }

      const blob = await response.blob();
      const filename = parseContentDispositionFilename(
        response.headers.get('Content-Disposition'),
        'ReturnDocument.pdf'
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Failed to generate return document');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1900px] mx-auto animate-in fade-in duration-500 pb-10">
      <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Return Documents</h1>

      {/* Filter Card */}
      <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex-[2] min-w-[240px] space-y-1.5">
            <input
              type="text"
              value={awbInput}
              onChange={(e) => setAwbInput(e.target.value)}
              onKeyDown={handleAwbKeyDown}
              placeholder="Tracking ID #, press Enter"
              className="w-full h-10 px-4 bg-white border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-300"
            />
            {stagedAwbs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {stagedAwbs.map((awb) => (
                  <span
                    key={awb}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded"
                  >
                    {awb}
                    <button type="button" onClick={() => removeStagedAwb(awb)} className="hover:text-red-600">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex-[2] min-w-[240px] space-y-1.5">
            <div className="relative">
              <select
                value={riderId}
                onChange={(e) => setRiderId(e.target.value)}
                disabled={loadingRiders}
                className="w-full h-10 px-4 bg-white border border-slate-200 rounded text-xs font-bold text-primary appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="">{loadingRiders ? 'Loading riders...' : 'Please Select a rider'}</option>
                {riders.map((rider) => (
                  <option key={rider.riderId} value={rider.riderId}>
                    {rider.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleCreateReturnDocument}
            disabled={creating || stagedAwbs.length === 0 || !riderId}
            className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-bold uppercase text-[10px] tracking-widest disabled:opacity-50"
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : 'Create Return Document'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleClearLog}
            className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-bold uppercase text-[10px] tracking-widest border-none"
          >
            Clear log
          </Button>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            {successMessage}
          </div>
        )}
        {warningMessage && (
          <div className="px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
            {warningMessage}
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between bg-slate-50/30 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Show</span>
            <select className="h-9 border border-slate-200 rounded px-3 text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary/20">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span className="text-[10px] font-bold text-slate-500 uppercase">entries</span>
          </div>

          <div className="flex items-center gap-4">
            <Button className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-sm">
              Select All
            </Button>
            <Button
              type="button"
              onClick={() => router.push('/documents/return/list')}
              className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-sm flex items-center gap-2"
            >
              <FileText size={14} /> Return Document
            </Button>
            <Button
              type="button"
              onClick={handleExport}
              disabled={exporting || !lastPayload}
              className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <FileOutput size={14} />} Export
            </Button>
            <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Search:</span>
              <input type="text" className="h-10 border border-slate-200 rounded px-4 text-xs w-64 focus:outline-none focus:ring-1 focus:ring-primary/20" />
            </div>
          </div>
        </div>

        {exportError && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
            {exportError}
          </div>
        )}

        {/* Table Title - Centered Blue Text */}
        <div className="py-4 text-center border-b border-slate-50">
           <h2 className="text-xs font-bold text-primary uppercase tracking-widest opacity-60">Return Document</h2>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/20">
                {tableHeaders.map((header, idx) => (
                  <th key={idx} className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr><td colSpan={13} className="p-10 text-center text-slate-300 font-medium text-[11px] uppercase tracking-widest">No Data Available</td></tr>
              ) : data.map((order) => (
                <tr key={order.awbNo} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4 text-[11px] font-medium text-slate-500 whitespace-nowrap text-center">—</td>
                  <td className="p-4 text-[11px] font-bold text-primary whitespace-nowrap text-center">{order.awbNo}</td>
                  <td className="p-4 text-[11px] font-medium text-slate-600 whitespace-nowrap text-center">{order.clientName || '—'}</td>
                  <td className="p-4 text-[11px] font-medium text-slate-600 whitespace-nowrap text-center">{order.referenceId || '—'}</td>
                  <td className="p-4 text-[11px] font-medium text-slate-600 whitespace-nowrap text-center">{order.customerNumber || '—'}</td>
                  <td className="p-4 text-[11px] font-bold text-slate-700 whitespace-nowrap text-center">{formatAmount(order.amount)}</td>
                  <td className="p-4 text-[11px] font-medium text-slate-500 whitespace-nowrap text-center">—</td>
                  <td className="p-4 text-[11px] font-medium text-slate-500 whitespace-nowrap text-center">—</td>
                  <td className="p-4 text-[11px] font-medium text-slate-600 whitespace-nowrap text-center">{formatOrderDate(order.orderDateTime)}</td>
                  <td className="p-4 text-[11px] font-medium text-slate-500 whitespace-nowrap text-center">—</td>
                  <td className="p-4 text-[11px] font-medium text-slate-500 whitespace-nowrap text-center">—</td>
                  <td className="p-4 whitespace-nowrap text-center">
                    <span className="inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-700">
                      {order.status || '—'}
                    </span>
                  </td>
                  <td className="p-4 text-[11px] font-medium text-slate-500 whitespace-nowrap text-center">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination Section */}
        <div className="p-6 border-t border-slate-50 bg-slate-50/10">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Showing {data.length === 0 ? 0 : 1} to {data.length} of {data.length} entries
          </span>
        </div>
      </div>
    </div>
  );
}
