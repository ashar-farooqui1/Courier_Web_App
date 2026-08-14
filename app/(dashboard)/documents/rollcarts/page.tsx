"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronDown, Eye, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthSession } from '@/hooks/useAuthRole';
import { buildAppAuthHeaders } from '@/lib/api/app-request-context';
import { parseApiErrorMessage } from '@/lib/api/errors';
import { formatOrderDate, formatAmount } from '@/components/orders/order-columns';
import type { DeliverySheetListData, DeliverySheetListItem } from '@/lib/types/delivery-sheet';

const RollcartFilter = ({ label, placeholder, type = "text", value = "" }: any) => (
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

const StatItem = ({ label, value, subValue }: { label: string, value: string | number, subValue?: string }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    <div className="flex items-baseline gap-2">
      <span className="text-sm font-black text-slate-700">{value}</span>
      {subValue && <span className="text-[10px] font-bold text-slate-400">/ {subValue}</span>}
    </div>
  </div>
);

const MiniStat = ({ label, value }: { label: string, value: string | number }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
    <span className="text-[11px] font-bold text-slate-600">{value}</span>
  </div>
);

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === 'closed') return 'bg-emerald-50 text-emerald-700';
  if (s === 'picked') return 'bg-amber-50 text-amber-700';
  return 'bg-slate-100 text-slate-500';
}

const TABLE_HEADERS = [
  'Number', 'Date', 'Courier', 'Shipments', 'Total', 'WareHouse', 'Status', 'Action', 'Portal', 'APP', 'Shipments'
];

export default function RollcartsPage() {
  const router = useRouter();
  const { token, role, user, ready } = useAuthSession();

  const [summary, setSummary] = useState<DeliverySheetListData['summary'] | null>(null);
  const [rows, setRows] = useState<DeliverySheetListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;

    if (!token) {
      setError('Authentication required. Please log in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch('/api/orders/delivery-sheets', {
      headers: buildAppAuthHeaders(token, role, user?.userId ?? 0),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(parseApiErrorMessage(payload, `Failed to load delivery sheets (${response.status})`));
        }
        const data = payload as DeliverySheetListData;
        setSummary(data.summary);
        setRows(data.deliverySheets ?? []);
      })
      .catch((err) => {
        setSummary(null);
        setRows([]);
        setError(err instanceof Error ? err.message : 'Failed to load delivery sheets');
      })
      .finally(() => setLoading(false));
  }, [ready, token, role, user?.userId]);

  return (
    <div className="space-y-6 max-w-[1900px] mx-auto animate-in fade-in duration-500 pb-10">
      <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Delivery Sheet</h1>

      {/* Main Container Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/10">
          <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest">Delivery Sheets</h2>
        </div>

        <div className="p-8 space-y-10">
          {/* Filters Row 1 */}
          <div className="flex flex-wrap gap-6 items-end">
            <RollcartFilter label="Couriers" placeholder="All Courier" type="select" />
            <RollcartFilter label="Search Numbers" placeholder="" />
            <RollcartFilter label="From" type="date" value="2026-04-30" />
            <RollcartFilter label="To" type="date" value="2026-04-30" />
          </div>

          {/* Filters Row 2 + Search Button */}
          <div className="flex flex-wrap gap-6 items-end">
            <RollcartFilter label="WareHouse" placeholder="--select--" type="select" />
            <RollcartFilter label="Status" placeholder="--select--" type="select" />
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

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-12 py-4">
            <StatItem label="Total Advices" value={summary?.totalAdvices ?? 0} />
            <StatItem label="Total Reattempt" value={summary?.totalReattempt ?? 0} />
            <StatItem label="Total Delivered" value={summary?.totalDelivered ?? 0} />
            <StatItem label="Total Return Confirm" value={summary?.totalReturnConfirm ?? 0} />

            <StatItem label="Delivered Amount" value={formatAmount(summary?.deliveredAmount ?? 0)} />
            <StatItem label="Total Delivery Sheets" value={summary?.totalRollcarts ?? 0} />
            <StatItem label="Total Amount" value={formatAmount(summary?.totalAmount ?? 0)} />
            <StatItem label="Total Shipment" value={summary?.totalShipment ?? 0} />

            <StatItem label="New Shipments" value={summary?.newShipments ?? 0} />
            <StatItem label="Reattempted Shipments" value={summary?.reattemptedShipments ?? 0} />
          </div>

          {/* Table Controls */}
          <div className="flex items-center gap-2 pt-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Show</span>
            <select className="h-9 border border-slate-200 rounded px-3 text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary/20">
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
            <span className="text-[10px] font-bold text-slate-500 uppercase">entries</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30">
                  {TABLE_HEADERS.map((header, idx) => (
                    <th key={idx} className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[11px] font-medium text-slate-600">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                      Loading delivery sheets…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-20 text-center">
                      <p className="text-slate-300 italic text-sm font-medium">No delivery sheets found</p>
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.number} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 whitespace-nowrap font-bold text-primary">{row.number}</td>
                      <td className="p-4 whitespace-nowrap">{formatOrderDate(row.date)}</td>
                      <td className="p-4 whitespace-nowrap">{row.riderName || '—'}</td>
                      <td className="p-4 whitespace-nowrap">{row.shipments}</td>
                      <td className="p-4 whitespace-nowrap">{formatAmount(row.total)}</td>
                      <td className="p-4 whitespace-nowrap">{row.warehouseName || '—'}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={cn("inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase", statusBadgeClass(row.status))}>
                          {row.status || '—'}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            title="View"
                            onClick={() => router.push(`/documents/rollcarts/${row.number}`)}
                            className="p-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors flex items-center justify-center"
                          >
                            <Eye size={12} />
                          </button>
                          <button type="button" title="Delete" className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center">
                            <Trash2 size={12} />
                          </button>
                          <button
                            type="button"
                            title="Debriefing"
                            onClick={() => router.push(`/orders/debriefing?deliverySheetId=${row.number}`)}
                            className="p-1.5 bg-slate-700 text-white rounded hover:bg-slate-800 transition-colors flex items-center justify-center"
                          >
                            <Info size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <MiniStat label="AD" value={row.counts.advice} />
                          <MiniStat label="Rtc" value={row.counts.return} />
                          <MiniStat label="Att" value={row.counts.attempt} />
                          <MiniStat label="DD" value={row.counts.delivered} />
                          <MiniStat label="DA" value={formatAmount(row.counts.deliveredAmount)} />
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <MiniStat label="Rider Att" value="—" />
                          <MiniStat label="Rider DD" value="—" />
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <MiniStat label="New" value={row.newShipments} />
                          <MiniStat label="Reattempted" value={row.reattemptedShipments} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">
            <span>Showing {rows.length === 0 ? 0 : 1} to {rows.length} of {summary?.totalRollcarts ?? rows.length} entries</span>
          </div>
        </div>
      </div>
    </div>
  );
}
