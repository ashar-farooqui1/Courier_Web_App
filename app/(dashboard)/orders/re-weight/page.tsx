"use client";

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, FileOutput, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthSession } from '@/hooks/useAuthRole';
import { buildAppAuthHeaders } from '@/lib/api/app-request-context';
import { getDefaultWarehouse } from '@/lib/auth/warehouse';
import type { Rider } from '@/lib/types/rider';
import type { ReweightArrivalResult, ReweightScannedOrder } from '@/lib/types/order';

function formatDateTime(value: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseAwbTokens(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((token) => token.trim().toUpperCase())
    .filter(Boolean);
}

export default function ReWeightArrivalsPage() {
  const { token, role, user, ready } = useAuthSession();

  const [awbInput, setAwbInput] = useState('');
  const [stagedAwbs, setStagedAwbs] = useState<string[]>([]);
  const [useNewWeight, setUseNewWeight] = useState(false);
  const [newWeightValue, setNewWeightValue] = useState('');
  const [useDefaultWeight, setUseDefaultWeight] = useState(false);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loadingRiders, setLoadingRiders] = useState(false);
  const [riderId, setRiderId] = useState('');
  const [scannedLog, setScannedLog] = useState<ReweightScannedOrder[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

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

  const tableHeaders = [
    'AWB ID', 'Client Name', 'Customer Name', 'Customer Number', 'Amount',
    'Reference ID / Article Code', 'Service', 'Weight', 'Order Time & Date',
    'Exp. Delivery Date', 'Rider'
  ];

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

  const handleToggleNewWeight = (checked: boolean) => {
    setUseNewWeight(checked);
    if (checked) setUseDefaultWeight(false);
  };

  const handleToggleDefaultWeight = (checked: boolean) => {
    setUseDefaultWeight(checked);
    if (checked) setUseNewWeight(false);
  };

  const handleClearLog = () => {
    setScannedLog([]);
    setStagedAwbs([]);
    setAwbInput('');
    setError(null);
    setInfoMessage(null);
  };

  const handleExport = async () => {
    if (scannedLog.length === 0) return;
    const XLSX = await import('xlsx');
    const headers = [
      'AWB ID', 'Client Name', 'Customer Name', 'Customer Number', 'Amount',
      'Reference ID / Article Code', 'Service', 'Weight', 'Order Time & Date', 'Rider',
    ];
    const rows = scannedLog.map((order) => [
      order.awbNo,
      order.clientName,
      order.customerName,
      order.customerNumber,
      order.amount,
      order.referenceId,
      order.service,
      order.chargedWeight,
      formatDateTime(order.orderDateTime),
      order.riderName,
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reweight Log');
    XLSX.writeFile(workbook, 'reweight-log.xlsx');
  };

  const handleReweight = async () => {
    setError(null);
    setInfoMessage(null);

    const awbNo = Array.from(new Set([...stagedAwbs, ...parseAwbTokens(awbInput)]));

    if (awbNo.length === 0) {
      setError('Scan or enter at least one AWB.');
      return;
    }

    if (!useNewWeight && !useDefaultWeight) {
      setError('Select New Weight or Default Weight.');
      return;
    }

    if (useNewWeight) {
      const parsed = Number(newWeightValue);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        setError('Enter a valid new weight.');
        return;
      }
    }

    const warehouseId = getDefaultWarehouse()?.warehouseId ?? 0;
    const weight = useNewWeight ? Number(newWeightValue) : 0;
    const pickupRiderId = Number(riderId) || 0;

    setSubmitting(true);
    try {
      const response = await fetch('/api/orders/reweight-arrival', {
        method: 'POST',
        headers: buildAppAuthHeaders(token, role, user?.userId ?? 0, {
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ warehouseId, pickupRiderId, weight, awbNo }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body?.message ?? `Reweight failed (${response.status})`);
      }

      const result = body.data as ReweightArrivalResult;

      setScannedLog((prev) => [...result.scannedOrders, ...prev]);
      setStagedAwbs([]);
      setAwbInput('');

      const notes: string[] = [];
      if (result.alreadyScanned.length > 0) {
        notes.push(`${result.alreadyScanned.length} already scanned`);
      }
      if (result.notFound.length > 0) {
        notes.push(`not found: ${result.notFound.join(', ')}`);
      }
      setInfoMessage(`${body.message}${notes.length > 0 ? ` (${notes.join(', ')})` : ''}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reweight arrival');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Orders Arrive List</h1>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex-1 min-w-[220px] space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tracking ID #</label>
            <input
              type="text"
              value={awbInput}
              onChange={(e) => setAwbInput(e.target.value)}
              onKeyDown={handleAwbKeyDown}
              placeholder="Scan or type AWB, press Enter"
              className="w-full h-10 px-4 bg-white border border-slate-200 rounded-md text-xs font-bold text-black focus:outline-none"
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

          <div className="flex-1 min-w-[200px] space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">New weight</label>
            <div className="flex items-center gap-0">
              <div className="h-10 w-10 bg-primary text-white flex items-center justify-center rounded-l-md shrink-0">
                <input
                  type="checkbox"
                  checked={useNewWeight}
                  onChange={(e) => handleToggleNewWeight(e.target.checked)}
                  className="w-3 h-3"
                />
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newWeightValue}
                onChange={(e) => setNewWeightValue(e.target.value)}
                disabled={!useNewWeight}
                placeholder="New weight"
                className="flex-1 h-10 px-4 bg-white border border-slate-200 rounded-r-md text-xs font-bold text-black focus:outline-none disabled:bg-slate-50 disabled:text-slate-300"
              />
            </div>
          </div>

          <div className="min-w-[140px] space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Default weight</label>
            <div className="flex items-center h-10">
              <input
                type="checkbox"
                checked={useDefaultWeight}
                onChange={(e) => handleToggleDefaultWeight(e.target.checked)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>
          </div>

          <div className="flex-1 min-w-[200px] space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rider</label>
            <div className="relative">
              <select
                value={riderId}
                onChange={(e) => setRiderId(e.target.value)}
                disabled={loadingRiders}
                className="w-full h-10 px-4 bg-white border border-slate-200 rounded-md text-xs font-bold text-black appearance-none focus:outline-none cursor-pointer"
              >
                <option value="">{loadingRiders ? 'Loading riders...' : 'Please Select a rider'}</option>
                {riders.map((rider) => (
                  <option key={rider.riderId} value={rider.riderId}>
                    {rider.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {error && <p className="text-xs font-bold text-red-600">{error}</p>}
        {infoMessage && <p className="text-xs font-bold text-emerald-600">{infoMessage}</p>}

        <div className="flex gap-2 items-center flex-wrap">
          <Button
            onClick={() => void handleReweight()}
            disabled={submitting}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest h-10 px-6 gap-2 disabled:opacity-50"
          >
            {submitting ? 'Reweighing…' : 'Reweight'}
          </Button>
          <Button
            onClick={handleClearLog}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest h-10 px-6 gap-2"
          >
            <Trash2 size={14} /> Clear log
          </Button>
          <Button
            onClick={() => void handleExport()}
            disabled={scannedLog.length === 0}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest h-10 px-6 gap-2 disabled:opacity-50"
          >
            <FileOutput size={14} /> Export
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Show</span>
            <select className="h-9 border border-slate-200 rounded px-2 text-xs font-bold text-primary">
              <option>10</option>
            </select>
            <span className="text-[11px] font-bold text-slate-500 uppercase">entries</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                {tableHeaders.map((header, idx) => (
                  <th key={idx} className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[11px] font-medium text-slate-600">
              {scannedLog.length === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="py-20 text-center text-slate-300 italic text-sm font-medium uppercase tracking-widest">
                    Showing 0 to 0 of 0 entries
                  </td>
                </tr>
              ) : (
                scannedLog.map((order, idx) => (
                  <tr key={`${order.awbNo}-${idx}`} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-primary whitespace-nowrap">{order.awbNo}</td>
                    <td className="p-4 whitespace-nowrap">{order.clientName || '—'}</td>
                    <td className="p-4 whitespace-nowrap">{order.customerName || '—'}</td>
                    <td className="p-4 whitespace-nowrap">{order.customerNumber || '—'}</td>
                    <td className="p-4 whitespace-nowrap">{order.amount}</td>
                    <td className="p-4 whitespace-nowrap">{order.referenceId || '—'}</td>
                    <td className="p-4 whitespace-nowrap">{order.service || '—'}</td>
                    <td className="p-4 whitespace-nowrap">{order.chargedWeight}</td>
                    <td className="p-4 whitespace-nowrap">{formatDateTime(order.orderDateTime)}</td>
                    <td className="p-4 whitespace-nowrap">—</td>
                    <td className="p-4 whitespace-nowrap">{order.riderName || '—'}</td>
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
