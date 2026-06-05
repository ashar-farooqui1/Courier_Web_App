"use client";

import React from 'react';
import { Truck, CheckCircle, History } from 'lucide-react';
import { InTransitNav } from '@/components/InTransitNav';

export default function ReceiveInTransitPage() {
  const tabs = [
    { icon: Truck, label: "InTransit", href: "/in-transit/generate" },
    { icon: CheckCircle, label: "InTransit Received", href: "/in-transit/receive" },
    { icon: History, label: "InTransit History", href: "/in-transit/record" },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <InTransitNav tabs={tabs} />
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-20 text-center">
        <CheckCircle size={48} className="mx-auto text-slate-200 mb-4" />
        <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">InTransit Received</h2>
        <p className="text-slate-400 mt-2">Content for receiving intransit parcels will go here.</p>
      </div>
    </div>
  );
}
