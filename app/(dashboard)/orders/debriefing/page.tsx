"use client";

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppDialog, DialogFormFooter, DialogError, DialogBody } from '@/components/ui/AppDialog';
import { dialogLabelClass, dialogInputClass } from '@/components/ui/dialog-styles';
import { useAuthSession } from '@/hooks/useAuthRole';
import { buildAppAuthHeaders } from '@/lib/api/app-request-context';
import { parseApiErrorMessage } from '@/lib/api/errors';
import { formatOrderDate, formatAmount } from '@/components/orders/order-columns';
import type { DeliverySheetDebriefingData, DeliverySheetDebriefingOrder } from '@/lib/types/debriefing';

const REASON_OPTIONS = [
  'ADC|ADDRESS CHANGED',
  'CCR|CASH CHANGE REQUEST',
  'CNE|CONTACT NOT ESTABLISH',
  'CAN|CUSTOMER NOT AVAILABLE',
  'ICA|INCOMPLETE ADDRESS + CONTACT NOT ESTABLISH',
  'NSA|NO SUCH CONSIGNEE',
  'NSO|NO SUCH ORDER',
  'OSA|OUT OF SERVICE AREA',
  'PNA|PAYMENT NOT AVAILABLE',
  'RFD|REFUSED TO RECEIVED',
  'HSR|RETURN AS PER SHIPPER REQUEST',
  'ULA|UNTRACABLE ADDRESS + CONTACT NOT ESTABLISH',
  'CS|CONSIGNEE SHIFTED',
];

const OTHERS_REASON = '--OTHERS REASON--';

interface ReasonAction {
  label: string;
  status: string;
  tone: 'emerald' | 'primary';
}

const REASON_ACTIONS: ReasonAction[] = [
  { label: 'Mark Reattempt', status: 'Request For Reattempt', tone: 'emerald' },
  { label: 'Mark Return Confirm', status: 'ReturnConfirm', tone: 'emerald' },
  { label: 'Update Advice', status: 'HaltAdviceSent', tone: 'primary' },
];

const StatItem = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-col items-center justify-center px-4 py-2 border-r border-white/10 last:border-0">
    <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest mb-1">{label}</span>
    <span className="text-xs font-black text-white">{value}</span>
  </div>
);

const SubStatItem = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-col space-y-1">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-black text-primary">{value}</span>
  </div>
);

const DebriefTab = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all relative whitespace-nowrap",
      active ? "text-primary" : "text-slate-400 hover:text-slate-600"
    )}
  >
    {label}
    {active && (
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
    )}
  </button>
);

const TABS = ['ALL', 'DELIVERED ORDERS', 'ATTEMPT ORDERS', 'ADVICE ORDERS', 'RETURNCONFIRM ORDERS', 'PENDING ORDERS', 'UNASSIGNED ORDERS'] as const;
type DebriefTabKey = (typeof TABS)[number];

const BASE_TABLE_HEADERS = [
  'Tracking ID', 'Name', 'Contact', 'Address', 'Amount', 'Attempt',
  'Reasons & Remarks', 'Status', 'Warehouse Status', 'Info & attachments'
];

function getTableHeaders(tab: DebriefTabKey): string[] {
  return tab === 'PENDING ORDERS' ? ['Select', ...BASE_TABLE_HEADERS] : BASE_TABLE_HEADERS;
}

function matchesTab(order: DeliverySheetDebriefingOrder, tab: DebriefTabKey): boolean {
  if (tab === 'ALL') return true;

  if (tab === 'UNASSIGNED ORDERS') return order.deliveryStatus?.toLowerCase() === 'unassigned';
  if (tab === 'PENDING ORDERS') return order.deliveryStatus?.toLowerCase() === 'pending';
  if (tab === 'DELIVERED ORDERS') return order.deliveryStatus?.toLowerCase() === 'delivered';

  const status = order.status?.toLowerCase() ?? '';

  if (tab === 'ATTEMPT ORDERS') return status.includes('attempt');
  if (tab === 'ADVICE ORDERS') return status.includes('advice') || status.includes('halt');

  // RETURNCONFIRM ORDERS
  return status.includes('return');
}

export default function RollcartDebriefingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <p className="text-sm text-slate-400">Loading…</p>
        </div>
      }
    >
      <RollcartDebriefingContent />
    </Suspense>
  );
}

function RollcartDebriefingContent() {
  const { token, role, user, ready } = useAuthSession();
  const searchParams = useSearchParams();

  const [rollcartId, setRollcartId] = useState('');
  const [loadedDeliverySheetId, setLoadedDeliverySheetId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<DebriefTabKey>('ALL');
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [togglingSheetStatus, setTogglingSheetStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DeliverySheetDebriefingData['summary'] | null>(null);
  const [orders, setOrders] = useState<DeliverySheetDebriefingOrder[]>([]);
  const [selectedTrackingIds, setSelectedTrackingIds] = useState<Set<string>>(new Set());

  const [searchAwb, setSearchAwb] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<DeliverySheetDebriefingOrder | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [reasonAction, setReasonAction] = useState<ReasonAction | null>(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [savingReason, setSavingReason] = useState(false);
  const [reasonDialogError, setReasonDialogError] = useState<string | null>(null);

  const changeTab = (tab: DebriefTabKey) => {
    setActiveTab(tab);
    setSelectedTrackingIds(new Set());
  };

  const fetchDebriefing = async (deliverySheetId: number, resetTab: boolean) => {
    if (!ready || !token) {
      setError('Authentication required. Please log in again.');
      return;
    }

    setError(null);

    try {
      const response = await fetch(`/api/orders/debriefing?deliverySheetId=${deliverySheetId}`, {
        headers: buildAppAuthHeaders(token, role, user?.userId ?? 0),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseApiErrorMessage(payload, `Failed to load rollcart (${response.status})`));
      }

      const debriefing = payload as DeliverySheetDebriefingData;
      setSummary(debriefing.summary);
      setOrders(debriefing.orders);
      setLoadedDeliverySheetId(deliverySheetId);
      setSelectedTrackingIds(new Set());
      setSearchAwb('');
      setSearchedOrder(null);
      setSearchError(null);
      if (resetTab) setActiveTab('ALL');
    } catch (err) {
      setSummary(null);
      setOrders([]);
      setLoadedDeliverySheetId(null);
      setSelectedTrackingIds(new Set());
      setSearchAwb('');
      setSearchedOrder(null);
      setSearchError(null);
      setError(err instanceof Error ? err.message : 'Failed to load rollcart');
    }
  };

  // Auto-load when arriving with ?deliverySheetId= in the URL (e.g. from the rollcart view's Info button).
  useEffect(() => {
    if (!ready || !token) return;

    const queryId = Number(searchParams.get('deliverySheetId'));
    if (!Number.isInteger(queryId) || queryId < 1) return;

    setRollcartId(String(queryId));
    setLoading(true);
    fetchDebriefing(queryId, true).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, token, searchParams]);

  const loadDebriefing = async () => {
    const deliverySheetId = Number(rollcartId.trim());

    if (!Number.isInteger(deliverySheetId) || deliverySheetId < 1) {
      setError('Enter a valid rollcart id');
      return;
    }

    setLoading(true);
    try {
      await fetchDebriefing(deliverySheetId, true);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(
    () => orders.filter((order) => matchesTab(order, activeTab)),
    [orders, activeTab]
  );

  const tableHeaders = getTableHeaders(activeTab);

  const unassignedCount = useMemo(
    () => orders.filter((order) => order.deliveryStatus?.toLowerCase() === 'unassigned').length,
    [orders]
  );

  const assignAllUnassigned = async () => {
    if (!loadedDeliverySheetId) return;

    if (!ready || !token) {
      setError('Authentication required. Please log in again.');
      return;
    }

    setAssigning(true);
    setError(null);

    try {
      const response = await fetch('/api/orders/pick-delivery-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAppAuthHeaders(token, role, user?.userId ?? 0),
        },
        body: JSON.stringify({ deliverySheetId: loadedDeliverySheetId }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseApiErrorMessage(payload, `Failed to assign rollcart (${response.status})`));
      }

      await fetchDebriefing(loadedDeliverySheetId, false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign rollcart');
    } finally {
      setAssigning(false);
    }
  };

  const toggleSheetStatus = async () => {
    if (!loadedDeliverySheetId || !summary) return;

    if (!ready || !token) {
      setError('Authentication required. Please log in again.');
      return;
    }

    const isPicked = summary.deliverySheetStatus?.toLowerCase() === 'picked';
    const endpoint = isPicked ? '/api/orders/close-delivery-sheet' : '/api/orders/pick-delivery-sheet';

    setTogglingSheetStatus(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAppAuthHeaders(token, role, user?.userId ?? 0),
        },
        body: JSON.stringify({ deliverySheetId: loadedDeliverySheetId }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseApiErrorMessage(payload, `Failed to update sheet status (${response.status})`));
      }

      await fetchDebriefing(loadedDeliverySheetId, false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sheet status');
    } finally {
      setTogglingSheetStatus(false);
    }
  };

  const toggleOrderSelected = (trackingId: string) => {
    setSelectedTrackingIds((prev) => {
      const next = new Set(prev);
      if (next.has(trackingId)) next.delete(trackingId);
      else next.add(trackingId);
      return next;
    });
  };

  const deliverSelectedOrders = async () => {
    if (!loadedDeliverySheetId || selectedTrackingIds.size === 0) return;

    if (!ready || !token) {
      setError('Authentication required. Please log in again.');
      return;
    }

    setDelivering(true);
    setError(null);

    try {
      const results = await Promise.allSettled(
        Array.from(selectedTrackingIds).map((trackingId) =>
          fetch('/api/orders/update-delivery-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...buildAppAuthHeaders(token, role, user?.userId ?? 0),
            },
            body: JSON.stringify({
              deliverySheetId: loadedDeliverySheetId,
              awbNo: trackingId,
              status: 'Delivered',
              reason: '',
            }),
          }).then(async (response) => {
            const payload = await response.json().catch(() => null);
            if (!response.ok) {
              throw new Error(parseApiErrorMessage(payload, `Failed to update order (${response.status})`));
            }
          })
        )
      );

      const failed = results.filter((result) => result.status === 'rejected').length;

      await fetchDebriefing(loadedDeliverySheetId, false);

      if (failed > 0) {
        setError(`${failed} of ${results.length} order(s) failed to update.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update orders');
    } finally {
      setDelivering(false);
    }
  };

  const handleSearchOrder = () => {
    const query = searchAwb.trim();

    if (!query) {
      setSearchedOrder(null);
      setSearchError(null);
      return;
    }

    const match = orders.find((order) => order.trackingId.toLowerCase() === query.toLowerCase());

    if (!match) {
      setSearchedOrder(null);
      setSearchError('Order not found in this rollcart.');
      return;
    }

    if (match.deliveryStatus?.toLowerCase() !== 'pending') {
      setSearchedOrder(null);
      setSearchError(
        match.deliveryStatus?.toLowerCase() === 'delivered'
          ? 'This order has already been delivered and cannot be searched here.'
          : 'Only pending orders can be searched here.'
      );
      return;
    }

    setSearchedOrder(match);
    setSearchError(null);
  };

  const submitDeliveryStatusUpdate = async (awbNo: string, status: string, reason: string) => {
    const response = await fetch('/api/orders/update-delivery-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...buildAppAuthHeaders(token, role, user?.userId ?? 0),
      },
      body: JSON.stringify({ deliverySheetId: loadedDeliverySheetId, awbNo, status, reason }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(parseApiErrorMessage(payload, `Failed to update order (${response.status})`));
    }
  };

  const openReasonDialog = (action: ReasonAction) => {
    setReasonAction(action);
    setSelectedReason('');
    setCustomReason('');
    setReasonDialogError(null);
  };

  const closeReasonDialog = () => {
    if (savingReason) return;
    setReasonAction(null);
  };

  const handleSaveReason = async () => {
    if (!reasonAction || !searchedOrder || !loadedDeliverySheetId) return;

    if (!selectedReason) {
      setReasonDialogError('Please select a reason.');
      return;
    }

    const finalReason = selectedReason === OTHERS_REASON ? customReason.trim() : selectedReason;

    if (selectedReason === OTHERS_REASON && !finalReason) {
      setReasonDialogError('Please type the reason.');
      return;
    }

    if (!ready || !token) {
      setReasonDialogError('Authentication required. Please log in again.');
      return;
    }

    setSavingReason(true);
    setReasonDialogError(null);

    try {
      await submitDeliveryStatusUpdate(searchedOrder.trackingId, reasonAction.status, finalReason);
      setReasonAction(null);
      await fetchDebriefing(loadedDeliverySheetId, false);
    } catch (err) {
      setReasonDialogError(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setSavingReason(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Rollcart Debriefing</h1>

      {/* Top Header Stats Bar */}
      <div className="bg-primary rounded-xl shadow-lg overflow-hidden flex flex-wrap items-stretch">
        <StatItem label="Rider Name" value={summary?.riderName || '--'} />
        <StatItem label="Total Assigned" value={summary?.totalOrders ?? 0} />
        <StatItem label="Total Reattempt" value={summary?.totalReattempt ?? 0} />
        <StatItem label="Total Delivered" value={summary?.totalDelivered ?? 0} />
        <StatItem label="Total Pending" value={summary?.totalPending ?? 0} />
        <StatItem label="Created At" value={summary?.createdAt ? formatOrderDate(summary.createdAt) : '--'} />
        <StatItem label="Close At" value={summary?.closeAt ? formatOrderDate(summary.closeAt) : 'Not Closed'} />
        <StatItem label="Status" value={summary?.deliverySheetStatus || '--'} />
      </div>

      {/* Input Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchAwb}
            onChange={(e) => {
              setSearchAwb(e.target.value);
              setSearchedOrder(null);
              setSearchError(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchOrder()}
            placeholder="Tracking ID #"
            className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-primary focus:outline-none"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {loadedDeliverySheetId && summary && (
          <button
            type="button"
            onClick={toggleSheetStatus}
            disabled={togglingSheetStatus}
            className="shrink-0 h-10 px-6 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold rounded uppercase tracking-widest shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {togglingSheetStatus && <Loader2 size={14} className="animate-spin" />}
            {summary.deliverySheetStatus?.toLowerCase() === 'picked' ? 'Close Sheet' : 'Revert Closed Status'}
          </button>
        )}

        {error && <p className="text-xs font-bold text-red-600">{error}</p>}

        <div className="flex items-center gap-4 shrink-0">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={rollcartId}
              onChange={(e) => setRollcartId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadDebriefing()}
              placeholder="Rollcart Id key"
              className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-primary focus:outline-none"
            />
          </div>
          <Button
            onClick={loadDebriefing}
            disabled={loading}
            className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest shadow-md"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Load'}
          </Button>
        </div>
      </div>

      {/* Sub Stats Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-wrap gap-12">
        <SubStatItem label="Advices" value={summary?.totalAdvised ?? 0} />
        <SubStatItem label="Return Confirm" value={summary?.totalReturned ?? 0} />
        <SubStatItem label="Total Reattempt" value={summary?.totalReattempt ?? 0} />
        <SubStatItem label="Total Delivered" value={summary?.totalDelivered ?? 0} />
        <SubStatItem label="Delivered Amount" value={`Rs ${formatAmount(summary?.deliveredAmount ?? 0)}`} />
      </div>

      {/* Searched Order */}
      {searchError && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-300">
          <span>{searchError}</span>
        </div>
      )}

      {searchedOrder && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-4 flex-1">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tracking ID</p>
              <p className="text-sm font-black text-primary">{searchedOrder.trackingId}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</p>
              <p className="text-sm font-bold text-slate-700">{searchedOrder.customerName || searchedOrder.name || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</p>
              <p className="text-sm font-bold text-slate-700">{searchedOrder.contact || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</p>
              <p className="text-sm font-bold text-slate-700">{formatAmount(searchedOrder.amount)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Address</p>
              <p className="text-sm font-bold text-slate-700">{searchedOrder.address || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attempt</p>
              <p className="text-sm font-bold text-slate-700">{searchedOrder.attempt}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warehouse Status</p>
              <p className="text-sm font-bold text-slate-700">{searchedOrder.warehouseStatus || '—'}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
            {REASON_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => openReasonDialog(action)}
                className={cn(
                  "h-9 px-6 text-white text-[10px] font-bold rounded uppercase tracking-widest shadow-sm active:scale-95 transition-all",
                  action.tone === 'emerald' ? "bg-emerald-500 hover:bg-emerald-600" : "bg-primary hover:bg-primary/90"
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {reasonAction && (
        <AppDialog
          isOpen
          onClose={closeReasonDialog}
          title={reasonAction.label}
          maxWidth="md"
          disableClose={savingReason}
          footer={
            <DialogFormFooter
              onCancel={closeReasonDialog}
              submitLabel="Save"
              submittingLabel="Saving…"
              submitting={savingReason}
              formId="reason-dialog-form"
            />
          }
        >
          <form
            id="reason-dialog-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveReason();
            }}
            className="flex flex-col min-h-0 flex-1"
          >
            <DialogBody>
              {reasonDialogError && <DialogError message={reasonDialogError} />}

              <div className="space-y-1">
                <label className={dialogLabelClass}>Reason</label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className={dialogInputClass}
                >
                  <option value="">--reason--</option>
                  {REASON_OPTIONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                  <option value={OTHERS_REASON}>{OTHERS_REASON}</option>
                </select>
              </div>

              {selectedReason === OTHERS_REASON && (
                <div className="space-y-1">
                  <label className={dialogLabelClass}>Custom Reason</label>
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Type the reason"
                    className={dialogInputClass}
                  />
                </div>
              )}
            </DialogBody>
          </form>
        </AppDialog>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 overflow-x-auto custom-scrollbar">
          <div className="flex">
            {TABS.map(tab => (
              <DebriefTab
                key={tab}
                label={tab}
                active={activeTab === tab}
                onClick={() => changeTab(tab)}
              />
            ))}
          </div>

          {activeTab === 'UNASSIGNED ORDERS' && unassignedCount > 0 && (
            <button
              type="button"
              onClick={assignAllUnassigned}
              disabled={assigning}
              className="shrink-0 h-8 px-4 bg-primary text-white text-[10px] font-bold rounded uppercase tracking-widest hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {assigning && <Loader2 size={12} className="animate-spin" />}
              Assign All ({unassignedCount})
            </button>
          )}

          {activeTab === 'PENDING ORDERS' && selectedTrackingIds.size > 0 && (
            <button
              type="button"
              onClick={deliverSelectedOrders}
              disabled={delivering}
              className="shrink-0 h-8 px-4 bg-emerald-500 text-white text-[10px] font-bold rounded uppercase tracking-widest hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {delivering && <Loader2 size={12} className="animate-spin" />}
              Deliver ({selectedTrackingIds.size})
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                {tableHeaders.map((header, idx) => (
                  <th key={idx} className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Loading rollcart…
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="py-20 text-center text-slate-300 italic text-sm font-medium uppercase tracking-widest">
                    No orders found in this category
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.trackingId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    {activeTab === 'PENDING ORDERS' && (
                      <td className="p-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedTrackingIds.has(order.trackingId)}
                          onChange={() => toggleOrderSelected(order.trackingId)}
                          className="rounded border-slate-300 text-primary focus:ring-primary"
                        />
                      </td>
                    )}
                    <td className="p-4 text-[11px] font-bold text-primary whitespace-nowrap">{order.trackingId}</td>
                    <td className="p-4 text-[11px] font-medium text-slate-600 whitespace-nowrap">{order.customerName || order.name || '—'}</td>
                    <td className="p-4 text-[11px] font-medium text-slate-600 whitespace-nowrap">{order.contact || '—'}</td>
                    <td className="p-4 text-[11px] font-medium text-slate-600 whitespace-nowrap">{order.address || '—'}</td>
                    <td className="p-4 text-[11px] font-medium text-slate-600 whitespace-nowrap">{formatAmount(order.amount)}</td>
                    <td className="p-4 text-[11px] font-medium text-slate-600 whitespace-nowrap">{order.attempt}</td>
                    <td className="p-4 text-[11px] font-medium text-slate-600 whitespace-nowrap">{order.reasons || '—'}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-700">
                        {order.status || '—'}
                      </span>
                    </td>
                    <td className="p-4 text-[11px] font-medium text-slate-600 whitespace-nowrap">{order.warehouseStatus || '—'}</td>
                    <td className="p-4 text-[11px] font-medium text-slate-400 whitespace-nowrap">—</td>
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
