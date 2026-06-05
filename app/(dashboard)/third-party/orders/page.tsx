"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Search, ChevronDown, FileOutput, Printer, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Tab = ({ label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "px-6 py-3 text-[11px] font-bold uppercase tracking-widest transition-all relative",
      active ? "text-primary" : "text-slate-400 hover:text-slate-600"
    )}
  >
    {label}
    {active && (
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,43,91,0.3)]" />
    )}
  </button>
);

const FilterField = ({ label, placeholder, type = "text", value = "" }: any) => (
  <div className="flex-1 min-w-[150px] space-y-1.5">
    <div className="relative group">
      {type === "select" ? (
        <div className="relative">
          <select className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-[11px] font-bold text-primary appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer">
            <option value="">{placeholder}</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
        </div>
      ) : (
        <input 
          type={type} 
          defaultValue={value}
          placeholder={placeholder}
          className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-[11px] font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-slate-300"
        />
      )}
    </div>
  </div>
);

export default function ThirdPartyOrdersPage() {
  const [activeTab, setActiveTab] = useState('LCS ORDERS');
  
  const tabs = ['SWIFT ORDERS', 'LCS ORDERS'];
  const tableHeaders = [
    'AWB ID', 'Client Name', 'Customer Name', 'Customer Number', 'Amount', 
    'Order Time & Date', 'Exp. Delivery Date', 'Rider', 'Vendor', 
    'Parcel ID', 'Parcel Status'
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">LCS Orders</h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Filter Area */}
        <div className="p-6 border-b border-slate-50 flex flex-wrap items-center gap-4 bg-slate-50/10">
          <div className="flex items-center gap-3 mr-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Show</span>
            <select className="h-9 border border-slate-200 rounded px-2 text-xs font-bold text-primary">
              <option>50</option>
            </select>
            <span className="text-[11px] font-bold text-slate-500 uppercase">entries</span>
          </div>

          <FilterField placeholder="Tracking ID #" />
          <FilterField placeholder="Please select an option" type="select" />
          <FilterField type="date" value="2026-04-01" />
          <FilterField type="date" value="2026-04-29" />
        </div>

        {/* Action Bar & Tabs */}
        <div className="p-4 border-b border-slate-50 flex items-center justify-between">
          <div className="flex border-slate-100">
            {tabs.map(tab => (
              <Tab 
                key={tab} 
                label={tab} 
                active={activeTab === tab} 
                onClick={() => setActiveTab(tab)} 
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Button className="bg-primary hover:bg-primary/90 text-white font-bold text-[10px] uppercase h-9 px-4 gap-2 shadow-md">
              <FileOutput size={14} /> Export
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white font-bold text-[10px] uppercase h-9 px-4 gap-2 shadow-md">
              <Printer size={14} /> AWB Print
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white font-bold text-[10px] uppercase h-9 px-4 gap-2 shadow-md">
              <XCircle size={14} /> Cancel Selected
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="p-4"><input type="checkbox" className="rounded border-slate-300" /></th>
                {tableHeaders.map((header, idx) => (
                  <th key={idx} className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={12} className="py-20 text-center text-slate-300 italic text-sm font-medium uppercase tracking-widest">
                   Showing 0 to 0 of 0 entries
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
