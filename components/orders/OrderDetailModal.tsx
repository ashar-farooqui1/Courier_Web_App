"use client";

import React, { useCallback, useEffect, useState } from "react";
import { X, Package, User, MapPin, Clock, AlertCircle, MessageSquare, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildAppAuthHeaders } from "@/lib/api/app-request-context";
import { parseApiErrorMessage } from "@/lib/api/errors";
import { formatOrderStatusLabel } from "@/lib/orders/order-status-options";
import { formatAmount } from "@/components/orders/order-columns";
import type { LoginRole } from "@/lib/auth/role";
import type { OrderDetail } from "@/lib/types/order";

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="space-y-0.5">
    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
    <div className="text-xs font-bold text-slate-700 break-words">{value || "—"}</div>
  </div>
);

const SectionCard = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        <Icon size={14} />
      </div>
      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">{title}</h4>
    </div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-4">{children}</div>
  </div>
);

export interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number | null;
  token?: string;
  role?: LoginRole | null;
  userId?: number;
  roleId?: number;
}

export function OrderDetailModal({
  isOpen,
  onClose,
  orderId,
  token,
  role,
  userId,
  roleId,
}: OrderDetailModalProps) {
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remarkText, setRemarkText] = useState("");
  const [submittingRemark, setSubmittingRemark] = useState(false);
  const [remarkError, setRemarkError] = useState<string | null>(null);

  const reloadDetail = useCallback(async () => {
    if (!orderId) return;

    const response = await fetch(`/api/orders/${orderId}`, {
      headers: buildAppAuthHeaders(token, role ?? null, userId ?? 0),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(parseApiErrorMessage(payload, `Failed to load order (${response.status})`));
    }

    setDetail(payload as OrderDetail);
  }, [orderId, token, role, userId]);

  useEffect(() => {
    if (!isOpen || !orderId) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      setDetail(null);
      setRemarkText("");
      setRemarkError(null);

      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: buildAppAuthHeaders(token, role ?? null, userId ?? 0),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            parseApiErrorMessage(payload, `Failed to load order (${response.status})`)
          );
        }

        if (!cancelled) {
          setDetail(payload as OrderDetail);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load order");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isOpen, orderId, token, role, userId]);

  const handleAddRemark = async () => {
    const text = remarkText.trim();

    if (!orderId) return;

    if (!text) {
      setRemarkError("Please type a remark.");
      return;
    }

    if (!token || !userId || !roleId) {
      setRemarkError("Session not found. Please log in again.");
      return;
    }

    setSubmittingRemark(true);
    setRemarkError(null);

    try {
      const response = await fetch("/api/orders/remarks", {
        method: "POST",
        headers: buildAppAuthHeaders(
          token,
          role ?? null,
          userId,
          { "Content-Type": "application/json" },
          roleId
        ),
        body: JSON.stringify({ orderId, remark: text }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(parseApiErrorMessage(payload, `Failed to add remark (${response.status})`));
      }

      setRemarkText("");
      await reloadDetail();
    } catch (err) {
      setRemarkError(err instanceof Error ? err.message : "Failed to add remark");
    } finally {
      setSubmittingRemark(false);
    }
  };

  if (!isOpen) return null;

  const statusLabel = detail ? formatOrderStatusLabel(detail.status) : "";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="bg-primary px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="font-bold uppercase tracking-widest text-sm">
              Order {detail?.awbNo ? `#${detail.awbNo}` : ""}
            </h3>
            {detail && (
              <span className="px-2.5 py-1 rounded text-[10px] font-black uppercase bg-white/20">
                {statusLabel}
              </span>
            )}
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading && (
            <div className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
              Loading order…
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center justify-center gap-3 py-16 text-red-600">
              <AlertCircle size={18} />
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}

          {!loading && !error && detail && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <SectionCard icon={Package} title="Details">
                  <Field label="Tracking ID" value={detail.awbNo} />
                  <Field label="Client Name" value={detail.clientName} />
                  <Field label="Amount" value={formatAmount(detail.amount)} />
                  <Field label="Quantity" value={detail.quantity} />
                  <Field label="Weight" value={detail.weight ? `${detail.weight} Kg` : "—"} />
                  <Field label="Service" value={detail.serviceName} />
                  <Field
                    label="Status"
                    value={
                      <span className="inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase bg-primary/10 text-primary">
                        {statusLabel}
                      </span>
                    }
                  />
                </SectionCard>

                <SectionCard icon={User} title="Sender">
                  <Field label="Name" value={detail.sender.name} />
                  <Field label="Phone" value={detail.sender.phone} />
                  <Field label="Email" value={detail.sender.email} />
                  <Field label="Area" value={detail.sender.area} />
                  <div className="col-span-2">
                    <Field label="Address" value={detail.sender.address} />
                  </div>
                  <div className="col-span-2">
                    <Field
                      label="Pickup Scheduled At"
                      value={formatDateTime(detail.sender.pickupScheduledAt)}
                    />
                  </div>
                </SectionCard>

                <SectionCard icon={MapPin} title="Recipient">
                  <Field label="Name" value={detail.recipient.name} />
                  <Field label="Phone" value={detail.recipient.phone} />
                  <Field label="Area" value={detail.recipient.area} />
                  <Field label="Delivered At" value={formatDateTime(detail.recipient.deliveredAt)} />
                  <div className="col-span-2">
                    <Field label="Address" value={detail.recipient.address} />
                  </div>
                </SectionCard>
              </div>

              <div className="space-y-6 lg:sticky lg:top-0 h-fit">
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Clock size={14} />
                    </div>
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">History</h4>
                  </div>

                  {detail.history.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No history available</p>
                  ) : (
                    <div className="space-y-6">
                      {detail.history.map((group, groupIdx) => (
                        <div key={`${group.dateLabel}-${groupIdx}`}>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                            {group.dateLabel}
                          </div>
                          <div className="space-y-4 border-l-2 border-slate-100 ml-1.5 pl-4">
                            {group.events.map((event, eventIdx) => (
                              <div key={eventIdx} className="relative">
                                <span
                                  className={cn(
                                    "absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white",
                                    "bg-primary"
                                  )}
                                />
                                <div className="text-[10px] font-bold text-slate-400 uppercase">
                                  {event.time}
                                </div>
                                <div className="text-xs font-bold text-slate-700 mt-0.5">
                                  {event.description}
                                </div>
                                {(event.changedByName || event.changedByEmail) && (
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    By {event.changedByName || "—"}
                                    {event.changedByEmail ? ` - ${event.changedByEmail}` : ""}
                                    {event.changedByRole ? ` | ${event.changedByRole}` : ""}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 p-5 pb-4">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <MessageSquare size={14} />
                    </div>
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Remarks</h4>
                  </div>

                  <div className="px-5 pb-4 max-h-64 overflow-y-auto space-y-3">
                    {detail.remarks.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No remarks yet</p>
                    ) : (
                      detail.remarks.map((remark, idx) => (
                        <div key={remark.remarkId || idx} className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-slate-700">
                              {remark.remarkByName || "—"}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase shrink-0">
                              {formatDateTime(remark.remarkDate)}
                            </span>
                          </div>
                          {remark.remarkByRoleName && (
                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest">
                              {remark.remarkByRoleName}
                            </span>
                          )}
                          <p className="text-xs text-slate-600 mt-1 break-words">{remark.remark}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {remarkError && (
                    <div className="px-5 pb-2">
                      <p className="text-[11px] font-bold text-red-600">{remarkError}</p>
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleAddRemark();
                    }}
                    className="flex items-center gap-2 border-t-2 border-primary/30 p-3"
                  >
                    <input
                      type="text"
                      value={remarkText}
                      onChange={(e) => setRemarkText(e.target.value)}
                      placeholder="Type a remarks"
                      disabled={submittingRemark}
                      className="flex-1 h-9 px-3 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={submittingRemark || !remarkText.trim()}
                      className="w-9 h-9 shrink-0 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Send remark"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
