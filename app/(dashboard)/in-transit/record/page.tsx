"use client";

import React from 'react';
import { Truck, CheckCircle, History } from 'lucide-react';
import { InTransitNav } from '@/components/InTransitNav';

export default function RecordInTransitPage() {
  const tabs = [
    { icon: Truck, label: "InTransit", href: "/in-transit/generate" },
    { icon: CheckCircle, label: "InTransit Received", href: "/in-transit/receive" },
    { icon: History, label: "InTransit History", href: "/in-transit/record" },
  ];

  const tableHeaders = [
    'Seal ID', 'Origin Warehouse', 'Destination Warehouse', 
    'Total Shipment', 'Sacked Qty', 'De-Sacked Qty', 
    'Sealed Date', 'Bag Status'
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Navigation Tabs */}
      <InTransitNav tabs={tabs} />

      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex-1 min-w-[240px]">
            <input 
              type="text" 
              placeholder="Bag ID #" 
              className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="flex-[2] min-w-[300px]">
            <select className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer">
              <option value="">Please Select a warehouse</option>
              <option value="lahore">Lahore</option>
              <option value="karachi">Karachi</option>
              <option value="islamabad">Islamabad</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-4">
            <input 
              type="checkbox" 
              id="allowOther"
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="allowOther" className="text-[11px] font-bold text-slate-500 uppercase cursor-pointer select-none">
              Allow Other Warehouse
            </label>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
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
            <tbody>
              <tr>
                <td colSpan={8} className="py-2 text-center">
                  <div className="h-2 w-full bg-primary/80 rounded-full my-4 mx-auto max-w-[95%]" />
                  <p className="text-slate-300 italic text-sm font-medium pb-10">
                    No data available in table
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
