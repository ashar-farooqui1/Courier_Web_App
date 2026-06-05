"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { FileOutput, Trash2, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DocumentFilter = ({ label, placeholder, type = "text", value = "" }: any) => (
  <div className="flex-1 min-w-[200px] space-y-1.5">
    <div className="relative">
      {type === "select" ? (
        <div className="relative">
          <select className="w-full h-10 px-4 bg-white border border-slate-200 rounded text-xs font-bold text-primary appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all">
            <option value="">{placeholder}</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
        </div>
      ) : (
        <input 
          type={type} 
          defaultValue={value}
          placeholder={placeholder}
          className="w-full h-10 px-4 bg-white border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-slate-300"
        />
      )}
    </div>
  </div>
);

export default function ReplacementDocumentPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const tableHeaders = [
    'Booking Date', 'AWB ID', 'Client Name', 'Reference #', 'Consultant Number', 
    'Amount', 'Attempt', 'Remarks', 'Order Date', 'Picked Up Date', 'Status Date', 'Status', 'Action'
  ];

  useEffect(() => {
    setTimeout(() => {
      setData([]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="space-y-6 max-w-[1900px] mx-auto animate-in fade-in duration-500 pb-10">
      <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Replacement Documents</h1>

      {/* Filter Card */}
      <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-6">
          <DocumentFilter placeholder="Tracking ID #" />
          <DocumentFilter placeholder="Please Select a rider" type="select" />
          <DocumentFilter placeholder="Select Name" type="select" />
          
          <Button variant="outline" className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-bold uppercase text-[10px] tracking-widest border-none">
            Clear log
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between bg-slate-50/30 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Show</span>
            <select className="h-9 border border-slate-200 rounded px-3 text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary/20">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span className="text-[10px] font-bold text-slate-500 uppercase">entries</span>
          </div>

          <div className="flex items-center gap-4">
            <Button className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-sm">
              Select All
            </Button>
            <Button className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-sm flex items-center gap-2">
              <FileOutput size={14} /> Export
            </Button>
            <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Search:</span>
              <input type="text" className="h-10 border border-slate-200 rounded px-4 text-xs w-64 focus:outline-none focus:ring-1 focus:ring-primary/20" />
            </div>
          </div>
        </div>

        {/* Table Title - Centered Blue Text */}
        <div className="py-4 text-center border-b border-slate-50">
           <h2 className="text-xs font-bold text-primary uppercase tracking-widest opacity-60">Replacement Document</h2>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/20">
                {tableHeaders.map((header, idx) => (
                  <th key={idx} className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={13} className="p-32 text-center text-slate-400 font-bold animate-pulse uppercase tracking-widest text-[10px]">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={13} className="p-10 text-center text-slate-300 font-medium text-[11px] uppercase tracking-widest">No Data Available</td></tr>
              ) : data.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  {/* ... row data ... */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination Section */}
        <div className="p-6 border-t border-slate-50 bg-slate-50/10">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Showing 0 to 0 of 0 entries
          </span>
        </div>
      </div>
    </div>
  );
}
