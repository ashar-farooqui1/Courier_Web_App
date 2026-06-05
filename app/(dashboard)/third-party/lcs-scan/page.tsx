"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export default function LcsScanPage() {
  const tableHeaders = [
    'AWB ID', 'Client Name', 'Customer Name', 'Customer Number', 'Amount', 
    'Reference ID / Article Code', 'Order Time & Date', 'Exp. Delivery Date', 
    'Rider', 'Vendor', 'Parcel ID', 'Parcel Status'
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Leopards Order Scan</h1>

      {/* Control Panel */}
      <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex-[1] min-w-[250px] space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tracking ID #</label>
          <input type="text" placeholder="Tracking ID #" className="w-full h-10 px-4 bg-white border border-slate-200 rounded-md text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary/20" />
        </div>

        <div className="flex-[2] min-w-[300px] space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Please Select a rider</label>
          <div className="relative">
            <select className="w-full h-10 px-4 bg-white border border-slate-200 rounded-md text-xs font-bold text-primary appearance-none focus:outline-none cursor-pointer">
              <option>Please Select a rider</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative">
        {/* Background Watermark/Logo - as in screenshot */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <h2 className="text-8xl font-black italic">DoDeliver</h2>
        </div>

        <div className="overflow-x-auto relative z-10">
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
              <tr>
                <td colSpan={12} className="py-20 text-center text-slate-200 italic text-sm font-medium uppercase tracking-widest">
                   No scan data available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
