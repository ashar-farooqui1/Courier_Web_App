"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { History, Clock, Scan, FileOutput, CheckCircle2, MessageSquarePlus, X } from 'lucide-react';
import Link from 'next/link';
import { useAuthSession } from '@/hooks/useAuthRole';
import { buildAppAuthHeaders } from '@/lib/api/app-request-context';
import { parseApiErrorMessage } from '@/lib/api/errors';
import { formatOrderDate, formatAmount } from '@/components/orders/order-columns';
import { PageSizeSelect, OrdersPaginationFooter } from '@/components/orders/OrdersPagination';
import { ORDER_STATUS_OPTIONS } from '@/lib/orders/order-status-options';
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

type TabKey = 'History' | 'Pending' | 'Published' | 'Scane' | 'Export';

const TAB_LIST_TYPES: Partial<Record<TabKey, ShipperAdviceListType>> = {
  History: 'history',
  Pending: 'pending',
  Published: 'publish',
};

export default function OrdersAdvicesPage() {
  const { token, role, user, clientId, ready } = useAuthSession();

  const [activeTab, setActiveTab] = useState<TabKey>('History');
  const [rows, setRows] = useState<ShipperAdviceItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remarkRow, setRemarkRow] = useState<ShipperAdviceItem | null>(null);
  const [remarkStatus, setRemarkStatus] = useState('');
  const [remarkText, setRemarkText] = useState('');
  const [submittingRemark, setSubmittingRemark] = useState(false);
  const [remarkError, setRemarkError] = useState<string | null>(null);

  const listType = TAB_LIST_TYPES[activeTab];
  const isPendingTab = activeTab === 'Pending';
  const isPublishedTab = activeTab === 'Published';

  const fetchAdvices = useCallback(() => {
    if (!ready || listType === undefined) return;

    if (!token) {
      setError('Authentication required. Please log in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const query = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (listType) {
      query.set('listType', listType);
    }

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

  useEffect(() => {
    fetchAdvices();
  }, [fetchAdvices]);

  const changeTab = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
  };

  const openRemarkModal = (row: ShipperAdviceItem) => {
    setRemarkRow(row);
    setRemarkStatus('');
    setRemarkText('');
    setRemarkError(null);
  };

  const closeRemarkModal = () => {
    if (submittingRemark) return;
    setRemarkRow(null);
    setRemarkStatus('');
    setRemarkText('');
    setRemarkError(null);
  };

  const handleSubmitRemark = async () => {
    if (!remarkRow) return;

    if (!remarkStatus) {
      setRemarkError('Please select a requested status.');
      return;
    }

    const text = remarkText.trim();
    if (!text) {
      setRemarkError('Please type a remark.');
      return;
    }

    if (!token || !clientId) {
      setRemarkError('Session not found. Please log in again.');
      return;
    }

    setSubmittingRemark(true);
    setRemarkError(null);

    try {
      const response = await fetch('/api/orders/shipper-advices/request', {
        method: 'POST',
        headers: {
          ...buildAppAuthHeaders(token, role, user?.userId ?? 0),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shipperAdviceId: remarkRow.shipperAdviceId,
          clientId,
          requestedStatus: remarkStatus,
          remarks: text,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(parseApiErrorMessage(payload, `Failed to submit request (${response.status})`));
      }

      setRemarkRow(null);
      setRemarkStatus('');
      setRemarkText('');
      fetchAdvices();
    } catch (err) {
      setRemarkError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setSubmittingRemark(false);
    }
  };

  const tableHeaders = [
    'Sr No', 'CN', 'Amount', 'Vendor Order ID',
    ...(isPendingTab ? ['Approval', 'Approval Date'] : []),
    'Current Status',
    'Current Status Date', 'Requested Status', 'Remain Time',
    'Customer Phone No', 'Rider Remarks', 'Remarks', 'Shipper Name',
    'Customer Name', 'Total Attempts',
    ...(isPublishedTab ? ['Actions'] : []),
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Published Advices</h1>

        {/* Advice Tabs */}
        <div className="flex items-center gap-2 p-1 bg-white rounded-lg border border-slate-100 shadow-sm">
          <AdviceTab icon={History} label="History" active={activeTab === 'History'} onClick={() => changeTab('History')} />
          <AdviceTab icon={CheckCircle2} label="Published Advices" active={activeTab === 'Published'} onClick={() => changeTab('Published')} />
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
              {listType === undefined ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="py-20 text-center">
                    <p className="text-slate-300 italic text-sm font-medium">Not available yet</p>
                  </td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Loading advices…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="py-20 text-center">
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
                    {isPendingTab && (
                      <>
                        <td className="p-4 whitespace-nowrap">
                          {row.isApproved ? (
                            <span className="px-2 py-1 bg-emerald-500 text-white rounded text-[9px] font-bold uppercase">
                              Approved
                            </span>
                          ) : (
                            <button
                              disabled
                              title="Waiting for admin approval"
                              className="px-3 py-1.5 bg-slate-200 text-slate-400 rounded text-[9px] font-bold uppercase cursor-not-allowed"
                            >
                              Approve Remark
                            </button>
                          )}
                        </td>
                        <td className="p-4 whitespace-nowrap text-slate-400">{row.approvalDate ? formatOrderDate(row.approvalDate) : '—'}</td>
                      </>
                    )}
                    <td className="p-4 whitespace-nowrap">{row.currentStatus || '—'}</td>
                    <td className="p-4 whitespace-nowrap">{formatOrderDate(row.currentStatusDate)}</td>
                    <td className="p-4 whitespace-nowrap">{row.requestedStatus || '—'}</td>
                    <td className="p-4 whitespace-nowrap">—</td>
                    <td className="p-4 whitespace-nowrap">{row.customerPhoneNo || '—'}</td>
                    <td className="p-4 max-w-[200px] leading-tight">{row.riderRemarks || '—'}</td>
                    <td className="p-4 max-w-[200px] leading-tight">{row.remarks || '—'}</td>
                    <td className="p-4 whitespace-nowrap">{row.shipperName || '—'}</td>
                    <td className="p-4 whitespace-nowrap">{row.customerName || '—'}</td>
                    <td className="p-4 whitespace-nowrap">{row.totalAttempts}</td>
                    {isPublishedTab && (
                      <td className="p-4 whitespace-nowrap">
                        <button
                          onClick={() => openRemarkModal(row)}
                          className="px-3 py-1.5 bg-primary text-white rounded text-[9px] font-bold uppercase shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <MessageSquarePlus size={12} /> Add Remarks
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {listType !== undefined && (
          <OrdersPaginationFooter page={page} pageSize={pageSize} totalItems={totalCount} onPageChange={setPage} />
        )}
      </div>

      {remarkRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Add Remarks — {remarkRow.awbNo}
              </h3>
              <button onClick={closeRemarkModal} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Requested Status</label>
              <select
                value={remarkStatus}
                onChange={(e) => setRemarkStatus(e.target.value)}
                disabled={submittingRemark}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="">Select status</option>
                {ORDER_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              placeholder="Type a remark"
              rows={4}
              disabled={submittingRemark}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none resize-none"
            />

            {remarkError && (
              <p className="text-[11px] font-bold text-red-600">{remarkError}</p>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={closeRemarkModal}
                disabled={submittingRemark}
                className="h-9 px-4 text-[11px] font-bold uppercase text-slate-500 hover:text-slate-700 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSubmitRemark()}
                disabled={submittingRemark || !remarkText.trim() || !remarkStatus}
                className="h-9 px-5 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md active:scale-95 transition-all disabled:opacity-60"
              >
                {submittingRemark ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
