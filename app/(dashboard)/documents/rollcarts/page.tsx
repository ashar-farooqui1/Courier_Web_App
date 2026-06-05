"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RollcartFilter = ({ label, placeholder, type = "text", value = "" }: any) => (
  <div className="flex-1 min-w-[200px] space-y-1.5">
    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      {type === "select" ? (
        <div className="relative">
          <select className="w-full h-10 px-4 bg-white border border-slate-200 rounded-lg text-xs font-bold text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all">
            <option value="">{placeholder}</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
        </div>
      ) : (
        <input 
          type={type} 
          defaultValue={value}
          placeholder={placeholder}
          className="w-full h-10 px-4 bg-white border border-slate-200 rounded-lg text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300"
        />
      )}
    </div>
  </div>
);

const StatItem = ({ label, value, subValue }: { label: string, value: string | number, subValue?: string }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    <div className="flex items-baseline gap-2">
      <span className="text-sm font-black text-slate-700">{value}</span>
      {subValue && <span className="text-[10px] font-bold text-slate-400">/ {subValue}</span>}
    </div>
  </div>
);

export default function RollcartsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const tableHeaders = [
    'Number', 'Date', 'Courier', 'Shipments', 'Total', 'WareHouse', 'Status', 'Action', 'Portal', 'APP', 'Shipments'
  ];

  useEffect(() => {
    setTimeout(() => {
      setData([]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="space-y-6 max-w-[1900px] mx-auto animate-in fade-in duration-500 pb-10">
      <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">RollCart</h1>

      {/* Main Container Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/10">
          <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest">Rollcarts</h2>
        </div>

        <div className="p-8 space-y-10">
          {/* Filters Row 1 */}
          <div className="flex flex-wrap gap-6 items-end">
            <RollcartFilter label="Couriers" placeholder="All Courier" type="select" />
            <RollcartFilter label="Search Numbers" placeholder="" />
            <RollcartFilter label="From" type="date" value="2026-04-30" />
            <RollcartFilter label="To" type="date" value="2026-04-30" />
          </div>

          {/* Filters Row 2 + Search Button */}
          <div className="flex flex-wrap gap-6 items-end">
            <RollcartFilter label="WareHouse" placeholder="--select--" type="select" />
            <RollcartFilter label="Status" placeholder="--select--" type="select" />
            <div className="flex-1 min-w-[200px]">
              <Button className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 transition-all active:scale-95">
                Search
              </Button>
            </div>
            <div className="flex-1 min-w-[200px]"></div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-12 py-4">
            <StatItem label="Total Advices" value="0" />
            <StatItem label="Total Reattempt" value="0" subValue="0" />
            <StatItem label="Total Delivered" value="0" subValue="0" />
            <StatItem label="Total Return Confirm" value="0" />
            
            <StatItem label="Delivered Amount" value="0.00" />
            <StatItem label="Total Rollcarts" value="0" />
            <StatItem label="Total Amount" value="0.00" />
            <StatItem label="Total Shipment" value="0" />
            
            <StatItem label="New Shipments" value="0" />
            <StatItem label="Reattempted Shipments" value="0" />
          </div>

          {/* Table Controls */}
          <div className="flex items-center gap-2 pt-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Show</span>
            <select className="h-9 border border-slate-200 rounded px-3 text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary/20">
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
            <span className="text-[10px] font-bold text-slate-500 uppercase">entries</span>
          </div>

          {/* Table */}
          <div className="border border-slate-100 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/30">
                    {tableHeaders.map((header, idx) => (
                      <th key={idx} className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={11} className="p-20 text-center text-slate-400 font-bold animate-pulse uppercase tracking-widest text-[10px]">Loading Data...</td></tr>
                  ) : (
                    <tr>
                      <td colSpan={11} className="p-0">
                        <div className="bg-slate-50/50 py-4 text-center">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No Data</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">
            <span>Showing 0 to 0 of 0 entries</span>
          </div>
        </div>
      </div>
    </div>
  );
}
