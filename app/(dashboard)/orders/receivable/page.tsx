"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Search, ChevronDown, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SectionHeader = ({ title }: { title: string }) => (
  <div className="p-4 border-b border-slate-50 bg-slate-50/30">
    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h3>
  </div>
);

const MiniStat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex items-center gap-4 px-6 py-4">
    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
    <span className="text-sm font-black text-primary">{value}</span>
  </div>
);

export default function RollcartReceivablePage() {
  const [loading, setLoading] = useState(false);

  const pendingHeaders = [
    'Created At', 'RollCart #', 'WareHouse', 'Rider Name', 'Closed At', 'Days', 
    'Total Shipments', 'Pickup', 'Reattempt', 'Advice', 'Return Confirm', 
    'Delivered', 'Total Order Amount', 'Status'
  ];

  const closedHeaders = [
    ...pendingHeaders.slice(0, 12), 'Delivered Ratio', 'Total Delivered Amount', 
    'Total Paid Amount', 'Total Pending Amount', 'Total Order Amount', 'Status'
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-10">
      <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Rollcart Receivable</h1>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <SectionHeader title="Filters" />
        <div className="p-8 flex flex-wrap items-end gap-6">
          <div className="flex-1 min-w-[200px] space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">From</label>
            <input type="date" defaultValue="2026-04-29" className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none" />
          </div>
          <div className="flex-1 min-w-[200px] space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">To</label>
            <input type="date" defaultValue="2026-04-29" className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none" />
          </div>
          <div className="flex-1 min-w-[200px] space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Search Rollcart #</label>
            <input type="text" placeholder="Search Rollcart #" className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none" />
          </div>
          <div className="flex-1 min-w-[200px] space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Warehouse</label>
            <div className="relative">
              <select className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary appearance-none focus:outline-none">
                <option>--select--</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <Button className="h-10 px-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-lg">
            Search
          </Button>
        </div>
      </div>

      {/* Pending RollCarts Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <SectionHeader title="Pending RollCarts" />
        <div className="flex flex-wrap border-b border-slate-50">
          <MiniStat label="Total Rollcarts" value="0" />
          <div className="w-[1px] h-8 bg-slate-100 self-center" />
          <MiniStat label="Total Orders" value="0" />
          <div className="w-[1px] h-8 bg-slate-100 self-center" />
          <MiniStat label="Total Order Amount" value="0.00" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/20">
                {pendingHeaders.map((header, idx) => (
                  <th key={idx} className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={pendingHeaders.length} className="py-12 text-center text-slate-200 font-bold uppercase tracking-widest text-xs">
                   No Data
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Closed and Unpaid RollCart Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <SectionHeader title="Closed and Unpaid RollCart" />
        <div className="flex flex-wrap border-b border-slate-50">
          <MiniStat label="Total Rollcarts" value="0" />
          <div className="w-[1px] h-8 bg-slate-100 self-center" />
          <MiniStat label="Total Orders" value="0" />
          <div className="w-[1px] h-8 bg-slate-100 self-center" />
          <MiniStat label="Total Order Amount" value="0.00" />
          <div className="w-[1px] h-8 bg-slate-100 self-center" />
          <MiniStat label="Total Delivered" value="0" />
          <div className="w-[1px] h-8 bg-slate-100 self-center" />
          <MiniStat label="Total Delivered Amount" value="0.00" />
          <div className="w-[1px] h-8 bg-slate-100 self-center" />
          <MiniStat label="Total Pending Amount" value="0.00" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/20">
                {closedHeaders.map((header, idx) => (
                  <th key={idx} className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={closedHeaders.length} className="py-12 text-center text-slate-200 font-bold uppercase tracking-widest text-xs">
                   No Data
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
