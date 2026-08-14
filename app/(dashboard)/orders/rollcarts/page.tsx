"use client";

import React, { useEffect, useState } from 'react';
import { ChevronDown, Trash2, FileBox, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthSession } from '@/hooks/useAuthRole';
import { buildAppAuthHeaders } from '@/lib/api/app-request-context';
import { getDefaultWarehouse } from '@/lib/auth/warehouse';
import { parseContentDispositionFilename } from '@/lib/format';
import type { Rider } from '@/lib/types/rider';

interface RollcartLogRow {
  awbNo: string;
  clientName: string;
  customerName: string;
  customerNumber: string;
  amount: number;
  referenceId: string;
  orderDateTime: string;
  expDeliveryDate: string;
  riderName: string;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toDatetimeLocalValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

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

function pickStringField(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return '';
}

function pickNumberField(record: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = Number(record[key]);
    if (Number.isFinite(value)) return value;
  }
  return 0;
}

/** Backend response shape for `data` isn't confirmed yet — extract whatever looks like a delivery sheet id. */
function pickDeliverySheetId(data: unknown): number {
  if (!data || typeof data !== 'object') return 0;
  return pickNumberField(data as Record<string, unknown>, [
    'deliverySheetId', 'DeliverySheetId', 'sheetId', 'SheetId', 'id', 'Id',
  ]);
}

/** Skip-reason buckets CreateDeliverySheet returns alongside `orders` — each item has an awbNo + message. */
const DELIVERY_SHEET_FAILURE_KEYS = ['wrongRoute', 'notFound', 'invalidStatus', 'alreadyOutForDelivery'];

function extractDeliveryFailureMessages(data: unknown): string[] {
  if (!data || typeof data !== 'object') return [];
  const record = data as Record<string, unknown>;

  return DELIVERY_SHEET_FAILURE_KEYS.flatMap((key) => {
    const list = record[key];
    if (!Array.isArray(list)) return [];

    return list
      .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
      .map(
        (item) =>
          pickStringField(item, ['message', 'Message']) ||
          `${pickStringField(item, ['awbNo', 'AwbNo'])} could not be added.`
      )
      .filter(Boolean);
  });
}

/**
 * CreateDeliverySheet's actual response: `data.orders[]`, each with `deliveryRider` (not
 * `riderName`) and `deliveryDate`. Falls back to the top-level `data.riderName` when an
 * individual order doesn't carry its own rider.
 */
function extractDeliverySheetRows(data: unknown): RollcartLogRow[] {
  if (!data || typeof data !== 'object') return [];

  const dataRecord = data as Record<string, unknown>;
  const fallbackRiderName = pickStringField(dataRecord, ['riderName', 'RiderName']);

  let items: unknown[] = [];
  if (Array.isArray(data)) {
    items = data;
  } else {
    const candidates = [dataRecord.orders, dataRecord.scannedOrders, dataRecord.items, dataRecord.awbDetails];
    const found = candidates.find((c) => Array.isArray(c));
    if (Array.isArray(found)) items = found;
  }

  return items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((record) => ({
      awbNo: pickStringField(record, ['awbNo', 'AwbNo', 'awbNumber']),
      clientName: pickStringField(record, ['clientName', 'ClientName']),
      customerName: pickStringField(record, ['customerName', 'CustomerName']),
      customerNumber: pickStringField(record, ['customerNumber', 'CustomerNumber', 'customerPhone', 'CustomerPhone']),
      amount: pickNumberField(record, ['amount', 'Amount']),
      referenceId: pickStringField(record, ['referenceId', 'ReferenceId', 'customerReference', 'CustomerReference']),
      orderDateTime: pickStringField(record, ['orderDateTime', 'OrderDateTime', 'orderDate', 'OrderDate']),
      expDeliveryDate: pickStringField(record, ['deliveryDate', 'DeliveryDate', 'expDeliveryDate', 'ExpDeliveryDate']),
      riderName: pickStringField(record, ['deliveryRider', 'DeliveryRider', 'riderName', 'RiderName']) || fallbackRiderName,
    }))
    .filter((row) => row.awbNo);
}

export default function CreateRollcartsPage() {
  const { token, role, user, ready } = useAuthSession();

  const [awbInput, setAwbInput] = useState('');
  const [stagedAwbs, setStagedAwbs] = useState<string[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loadingRiders, setLoadingRiders] = useState(false);
  const [riderId, setRiderId] = useState('');
  const [deliverySheetDateInput, setDeliverySheetDateInput] = useState(() => toDatetimeLocalValue(new Date()));
  const [deliverySheetId, setDeliverySheetId] = useState<number | null>(null);
  const [scannedLog, setScannedLog] = useState<RollcartLogRow[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [removingAwb, setRemovingAwb] = useState<string | null>(null);
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
    'Reference ID / Article Code', 'Order Time & Date', 'Exp. Delivery Date',
    'Rider', 'Action'
  ];

  // Creates/refreshes the delivery sheet on the backend for the currently staged AWBs.
  // Fires automatically (debounced) whenever the staged AWBs, rider, or date change.
  const syncDeliverySheet = async (awbNo: string[]) => {
    setError(null);
    const warehouseId = getDefaultWarehouse()?.warehouseId ?? 0;
    const deliverySheetDate = new Date(deliverySheetDateInput).toISOString();

    setSyncing(true);
    try {
      const response = await fetch('/api/orders/create-delivery-sheet', {
        method: 'POST',
        headers: buildAppAuthHeaders(token, role, user?.userId ?? 0, {
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          awbNo,
          riderId: Number(riderId),
          adminId: user?.userId ?? 0,
          warehouseId,
          deliverySheetDate,
        }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body?.message ?? `Failed to create delivery sheet (${response.status})`);
      }

      const newSheetId = pickDeliverySheetId(body.data);
      const rows = extractDeliverySheetRows(body.data);
      const failureMessages = extractDeliveryFailureMessages(body.data);

      setDeliverySheetId(newSheetId || null);
      setScannedLog(rows);
      setError(failureMessages.length > 0 ? failureMessages.join(' ') : null);
      setInfoMessage(rows.length > 0 ? body.message ?? 'Delivery sheet updated.' : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create delivery sheet');
    } finally {
      setSyncing(false);
    }
  };

  // Auto-sync: as soon as AWBs are scanned (and a rider + date are set), keep the delivery sheet in sync.
  useEffect(() => {
    if (stagedAwbs.length === 0) {
      setDeliverySheetId(null);
      setScannedLog([]);
      return;
    }

    if (!riderId || !deliverySheetDateInput) return;

    const timer = setTimeout(() => {
      void syncDeliverySheet(stagedAwbs);
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagedAwbs, riderId, deliverySheetDateInput]);

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

  const removeLogRow = async (row: RollcartLogRow) => {
    if (!deliverySheetId) {
      setError(`Cannot remove ${row.awbNo}: missing delivery sheet ID.`);
      return;
    }

    setError(null);
    setRemovingAwb(row.awbNo);
    try {
      const response = await fetch('/api/orders/remove-from-delivery-sheet', {
        method: 'POST',
        headers: buildAppAuthHeaders(token, role, user?.userId ?? 0, {
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ awbNo: row.awbNo, deliverySheetId }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body?.message ?? `Remove failed (${response.status})`);
      }

      setScannedLog((prev) => prev.filter((r) => r.awbNo !== row.awbNo));
      setStagedAwbs((prev) => prev.filter((a) => a !== row.awbNo));
      setInfoMessage(body.message ?? `${row.awbNo} removed from delivery sheet.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove order from delivery sheet');
    } finally {
      setRemovingAwb(null);
    }
  };

  const handleClearLog = () => {
    setScannedLog([]);
    setStagedAwbs([]);
    setAwbInput('');
    setDeliverySheetId(null);
    setError(null);
    setInfoMessage(null);
  };

  const downloadDeliverySheet = async (awbNo: string[]) => {
    const warehouseId = getDefaultWarehouse()?.warehouseId ?? 0;
    const deliverySheetDate = new Date(deliverySheetDateInput).toISOString();

    const response = await fetch('/api/orders/generate-delivery-sheet', {
      method: 'POST',
      headers: buildAppAuthHeaders(token, role, user?.userId ?? 0, {
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        awbNo,
        riderId: Number(riderId),
        adminId: user?.userId ?? 0,
        warehouseId,
        deliverySheetDate,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.message ?? `Failed to generate delivery sheet (${response.status})`);
    }

    const blob = await response.blob();
    const filename = parseContentDispositionFilename(
      response.headers.get('Content-Disposition'),
      'DeliverySheet.pdf'
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleCreateRollcart = async () => {
    setError(null);

    if (stagedAwbs.length === 0) {
      setError('Scan or enter at least one AWB.');
      return;
    }

    if (!riderId) {
      setError('Please select a rider.');
      return;
    }

    setDownloading(true);
    try {
      await downloadDeliverySheet(stagedAwbs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download delivery sheet');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Delivery Sheet Scan</h1>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex-[2] min-w-[280px] space-y-1.5">
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

          <div className="flex-[2] min-w-[240px] space-y-1.5">
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

          <div className="flex-[2] min-w-[240px] space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date</label>
            <input
              type="datetime-local"
              value={deliverySheetDateInput}
              onChange={(e) => setDeliverySheetDateInput(e.target.value)}
              className="w-full h-10 px-4 bg-white border border-slate-200 rounded-md text-xs font-bold text-black focus:outline-none"
            />
          </div>
        </div>

        {syncing && <p className="text-xs font-bold text-slate-400">Syncing delivery sheet…</p>}
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
            {error}
          </div>
        )}
        {infoMessage && !syncing && <p className="text-xs font-bold text-emerald-600">{infoMessage}</p>}

        <div className="flex gap-2 items-center flex-wrap">
          <Button
            type="button"
            onClick={() => void handleCreateRollcart()}
            disabled={stagedAwbs.length === 0 || !riderId || downloading}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest h-10 px-6 gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <FileBox size={14} /> {downloading ? 'Downloading…' : 'Create Delivery Sheet'}
          </Button>
          <Button
            type="button"
            onClick={handleClearLog}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest h-10 px-6 gap-2"
          >
            <Trash2 size={14} /> Clear log
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Total {scannedLog.length} Scanned Successfully!
          </h4>
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
                  <td colSpan={tableHeaders.length} className="py-20 text-center text-slate-200 italic text-sm font-medium uppercase tracking-widest">
                    No scan data available
                  </td>
                </tr>
              ) : (
                scannedLog.map((row, idx) => (
                  <tr key={`${row.awbNo}-${idx}`} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-primary whitespace-nowrap">{row.awbNo}</td>
                    <td className="p-4 whitespace-nowrap">{row.clientName || '—'}</td>
                    <td className="p-4 whitespace-nowrap">{row.customerName || '—'}</td>
                    <td className="p-4 whitespace-nowrap">{row.customerNumber || '—'}</td>
                    <td className="p-4 whitespace-nowrap">{row.amount || '—'}</td>
                    <td className="p-4 whitespace-nowrap">{row.referenceId || '—'}</td>
                    <td className="p-4 whitespace-nowrap">{formatDateTime(row.orderDateTime)}</td>
                    <td className="p-4 whitespace-nowrap">{formatDateTime(row.expDeliveryDate)}</td>
                    <td className="p-4 whitespace-nowrap">{row.riderName || '—'}</td>
                    <td className="p-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => void removeLogRow(row)}
                        disabled={removingAwb === row.awbNo}
                        className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                        title="Remove from delivery sheet"
                      >
                        <X size={12} />
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
