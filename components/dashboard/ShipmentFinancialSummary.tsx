"use client";

import React, { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Wallet,
  ArrowLeftRight,
  Landmark,
  ClipboardList,
  Truck,
  PackageCheck,
  Undo2,
  Layers,
  Hourglass,
  ChevronDown,
  Home,
  Bike,
  CalendarClock,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatAmount } from "@/components/orders/order-columns";
import type { ClientOrder } from "@/lib/types/order";

type Tone = "slate" | "amber" | "emerald" | "cyan" | "violet" | "rose";

const TONE_CLASSES: Record<Tone, { badge: string; icon: string; value: string }> = {
  slate: { badge: "bg-slate-100", icon: "text-slate-500", value: "text-slate-700" },
  amber: { badge: "bg-amber-50", icon: "text-amber-600", value: "text-amber-700" },
  emerald: { badge: "bg-emerald-50", icon: "text-emerald-600", value: "text-emerald-700" },
  cyan: { badge: "bg-cyan-50", icon: "text-cyan-600", value: "text-cyan-700" },
  violet: { badge: "bg-violet-50", icon: "text-violet-600", value: "text-violet-700" },
  rose: { badge: "bg-rose-50", icon: "text-rose-600", value: "text-rose-700" },
};

function codSum(orders: ClientOrder[]): number {
  return orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
}

const Tile = ({
  label,
  value,
  subLabel,
  icon: Icon,
  tone,
  expandable,
  expanded,
  onToggle,
}: {
  label: string;
  value: string | number;
  subLabel?: string;
  icon: LucideIcon;
  tone: Tone;
  expandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}) => {
  const toneClasses = TONE_CLASSES[tone];
  return (
    <div
      onClick={expandable ? onToggle : undefined}
      className={cn(
        "bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3 transition-all",
        expandable && "cursor-pointer hover:border-slate-200 hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <span className={cn("flex items-center justify-center w-9 h-9 rounded-lg shrink-0", toneClasses.badge)}>
          <Icon size={16} className={toneClasses.icon} />
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className={cn("text-2xl font-black", toneClasses.value)}>{value}</span>
        {expandable && (
          <ChevronDown
            size={16}
            className={cn("text-slate-400 transition-transform duration-300 mb-1", expanded && "rotate-180")}
          />
        )}
      </div>
      {subLabel && <span className="text-[10px] font-bold text-slate-400">{subLabel}</span>}
    </div>
  );
};

const SectionHeading = ({ title }: { title: string }) => (
  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{title}</h3>
);

export default function ShipmentFinancialSummary({ orders }: { orders: ClientOrder[] }) {
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const buckets = useMemo(() => {
    const byStatus = (statuses: string[]) => orders.filter((o) => statuses.includes(o.status));

    const handedOverToStallionex = byStatus(["ArrivedAtOrigin"]);
    const delivered = byStatus(["Delivered"]);
    const returned = byStatus(["ParcelReturned"]);
    const shipperAdvice = byStatus(["HaltAdviceSent"]);

    const inTransit = byStatus(["OutForDestination"]);
    const reachedAtDestination = byStatus(["ArrivedAtDestination"]);
    const outForDelivery = byStatus(["OutForDelivery"]);
    const deliveryRescheduled = byStatus(["RequestForReattempt", "Reattempted"]);
    const returnInProcess = byStatus(["ReturnConfirm", "ReturnInTransit", "ReturnOutForDelivery", "ReturnReceivedAtOrigin"]);

    const inProcess = [
      ...inTransit,
      ...reachedAtDestination,
      ...outForDelivery,
      ...deliveryRescheduled,
      ...returnInProcess,
    ];

    return {
      totalBooked: orders,
      handedOverToStallionex,
      delivered,
      returned,
      shipperAdvice,
      inProcess,
      breakdown: [
        { label: "In-Transit", icon: Truck, list: inTransit, tone: "cyan" as Tone },
        { label: "Reached At Destination", icon: Home, list: reachedAtDestination, tone: "violet" as Tone },
        { label: "Out For Delivery", icon: Bike, list: outForDelivery, tone: "emerald" as Tone },
        { label: "Delivery Rescheduled", icon: CalendarClock, list: deliveryRescheduled, tone: "amber" as Tone },
        { label: "Return In-Process", icon: RotateCcw, list: returnInProcess, tone: "rose" as Tone },
      ],
    };
  }, [orders]);

  return (
    <div className="space-y-8">
      <div>
        <SectionHeading title="Shipment Details" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Tile
            label="Total Booked"
            value={buckets.totalBooked.length}
            subLabel={`Rs ${formatAmount(codSum(buckets.totalBooked))}`}
            icon={ClipboardList}
            tone="slate"
          />
          <Tile
            label="Handed Over To Stallionex"
            value={buckets.handedOverToStallionex.length}
            subLabel={`Rs ${formatAmount(codSum(buckets.handedOverToStallionex))}`}
            icon={Truck}
            tone="cyan"
          />
          <Tile
            label="Delivered"
            value={buckets.delivered.length}
            subLabel={`Rs ${formatAmount(codSum(buckets.delivered))}`}
            icon={PackageCheck}
            tone="emerald"
          />
          <Tile
            label="Returned"
            value={buckets.returned.length}
            subLabel={`Rs ${formatAmount(codSum(buckets.returned))}`}
            icon={Undo2}
            tone="rose"
          />
          <Tile
            label="In-Process"
            value={buckets.inProcess.length}
            icon={Layers}
            tone="violet"
            expandable
            expanded={breakdownOpen}
            onToggle={() => setBreakdownOpen((prev) => !prev)}
          />
          <Tile
            label="Shipper Advice"
            value={buckets.shipperAdvice.length}
            subLabel={`Rs ${formatAmount(codSum(buckets.shipperAdvice))}`}
            icon={Hourglass}
            tone="amber"
          />
        </div>

        {breakdownOpen && (
          <div className="mt-4 p-5 rounded-xl border border-slate-100 bg-slate-50/50 animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              In-Process Breakdown
            </span>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-3">
              {buckets.breakdown.map((item) => (
                <Tile
                  key={item.label}
                  label={item.label}
                  value={item.list.length}
                  icon={item.icon}
                  tone={item.tone}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <SectionHeading title="Financial Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Tile label="Payment Processed" value="Rs 0" icon={Wallet} tone="emerald" />
          <Tile label="Payment Transferred" value="Rs 0" icon={ArrowLeftRight} tone="amber" />
          <Tile label="Payment To Be Transferred" value="Rs 0" icon={Landmark} tone="slate" />
        </div>
      </div>
    </div>
  );
}
