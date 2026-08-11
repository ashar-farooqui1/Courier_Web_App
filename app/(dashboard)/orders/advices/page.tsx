"use client";

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { History, Clock, Scan, FileOutput } from 'lucide-react';
import Link from 'next/link';
import { useAuthSession } from '@/hooks/useAuthRole';
import { buildAppAuthHeaders } from '@/lib/api/app-request-context';
import { parseApiErrorMessage } from '@/lib/api/errors';
import { formatOrderDate, formatAmount } from '@/components/orders/order-columns';
import { PageSizeSelect, OrdersPaginationFooter } from '@/components/orders/OrdersPagination';
import type { ShipperAdviceListData, ShipperAdviceListType, ShipperAdviceItem } from '@/lib/types/shipper-advice';

const AdviceTab = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-6 py-3 text-[11px] font-bold uppercase tracking-widest transition-all rounded-md",
      active
        ? "bg-primary text-white shadow-lg shadow-primary/20"
        : "text-slate-500 hover:bg-slate-50 hover:text-primary"
    )}
  >
    <Icon size={14} />
    {label}
  </button>
);

type TabKey = 'History' | 'Pending' | 'Scane' | 'Export';

const TAB_LIST_TYPES: Partial<Record<TabKey, ShipperAdviceListType>> = {
  History: 'Published',
  Pending: 'Pending',
};

export default function OrdersAdvicesPage() {
  const { token, role, user, ready } = useAuthSession();

  const [activeTab, setActiveTab] = useState<TabKey>('History');
  const [rows, setRows] = useState<ShipperAdviceItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const listType = TAB_LIST_TYPES[activeTab];

  useEffect(() => {
    if (!ready || !listType) return;

    if (!token) {
      setError('Authentication required. Please log in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const query = new URLSearchParams({
      listType,
      page: String(page),
      pageSize: String(pageSize),
    });

    fetch(`/api/orders/shipper-advices?${query.toString()}`, {
      headers: buildAppAuthHeaders(token, role, user?.userId ?? 0),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(parseApiErrorMessage(payload, `Failed to load advices (${response.status})`));
        }
        const data = payload as ShipperAdviceListData;
        setRows(data.shipperAdvices ?? []);
        setTotalCount(data.totalCount ?? 0);
      })
      .catch((err) => {
        setRows([]);
        setTotalCount(0);
        setError(err instanceof Error ? err.message : 'Failed to load advices');
      })
      .finally(() => setLoading(false));
  }, [ready, token, role, user?.userId, listType, page, pageSize]);

  const changeTab = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
  };

  const tableHeaders = [
    'Sr No', 'CN', 'Amount', 'Vendor Order ID', 'Current Status',
    'Current Status Date', 'Requested Status', 'Remain Time',
    'Customer Phone No', 'Rider Remarks', 'Shipper Name',
    'Customer Name', 'Total Attempts'
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Published Advices</h1>

        {/* Advice Tabs */}
        <div className="flex items-center gap-2 p-1 bg-white rounded-lg border border-slate-100 shadow-sm">
          <AdviceTab icon={History} label="History" active={activeTab === 'History'} onClick={() => changeTab('History')} />
          <AdviceTab icon={Clock} label="Pending Advices" active={activeTab === 'Pending'} onClick={() => changeTab('Pending')} />
          <AdviceTab icon={Scan} label="Scane Advices" active={activeTab === 'Scane'} onClick={() => changeTab('Scane')} />
          <AdviceTab icon={FileOutput} label="Export Log" active={activeTab === 'Export'} onClick={() => changeTab('Export')} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Filters Header */}
        <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-6">
          <PageSizeSelect pageSize={pageSize} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

          <div className="flex flex-1 max-w-4xl items-center gap-4 justify-end">
            <Link href="/orders/advices/history">
              <button className="h-10 px-6 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md active:scale-95 transition-all flex items-center gap-2">
                <History size={14} /> History
              </button>
            </Link>
            <input
              type="text"
              placeholder="Tracking ID #"
              className="h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none w-48"
            />
            <input type="date" className="h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none" />
            <input type="date" className="h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none" />
            <button className="h-10 px-6 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md active:scale-95 transition-all">
              Filter
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
            {error}
          </div>
        )}

        {/* Data Table */}
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
              {!listType ? (
                <tr>
                  <td colSpan={13} className="py-20 text-center">
                    <p className="text-slate-300 italic text-sm font-medium">Not available yet</p>
                  </td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan={13} className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Loading advices…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-20 text-center">
                    <p className="text-slate-300 italic text-sm font-medium">No advices found</p>
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={row.shipperAdviceId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 whitespace-nowrap">{(page - 1) * pageSize + idx + 1}</td>
                    <td className="p-4 font-bold text-primary whitespace-nowrap">{row.awbNo}</td>
                    <td className="p-4 whitespace-nowrap">{formatAmount(row.amount)}</td>
                    <td className="p-4 whitespace-nowrap">{row.vendorOrderId || '—'}</td>
                    <td className="p-4 whitespace-nowrap">{row.currentStatus || '—'}</td>
                    <td className="p-4 whitespace-nowrap">{formatOrderDate(row.currentStatusDate)}</td>
                    <td className="p-4 whitespace-nowrap">{row.requestedStatus || '—'}</td>
                    <td className="p-4 whitespace-nowrap">—</td>
                    <td className="p-4 whitespace-nowrap">{row.customerPhoneNo || '—'}</td>
                    <td className="p-4 max-w-[200px] leading-tight">{row.riderRemarks || '—'}</td>
                    <td className="p-4 whitespace-nowrap">{row.shipperName || '—'}</td>
                    <td className="p-4 whitespace-nowrap">{row.customerName || '—'}</td>
                    <td className="p-4 whitespace-nowrap">{row.totalAttempts}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {listType && (
          <OrdersPaginationFooter page={page} pageSize={pageSize} totalItems={totalCount} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
