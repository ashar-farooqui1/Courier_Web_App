"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Search, History, Clock, Scan, FileOutput } from 'lucide-react';
import Link from 'next/link';

const AdviceTab = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-6 py-3 text-[11px] font-bold uppercase tracking-widest transition-all rounded-md",
      active 
        ? "bg-primary text-white shadow-lg shadow-primary/20" 
        : "text-slate-500 hover:bg-slate-50 hover:text-primary"
    )}
  >
    <Icon size={14} />
    {label}
  </button>
);

export default function OrdersAdvicesPage() {
  const [activeTab, setActiveTab] = useState('History');
  
  const tableHeaders = [
    'Sr No', 'CN', 'Amount', 'Vendor Order ID', 'Current Status', 
    'Current Status Date', 'Requested Status', 'Remain Time', 
    'Customer Phone No', 'Rider Remarks', 'Shipper Name', 
    'Customer Name', 'Total Attempts'
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Published Advices</h1>
        
        {/* Advice Tabs */}
        <div className="flex items-center gap-2 p-1 bg-white rounded-lg border border-slate-100 shadow-sm">
          <AdviceTab icon={History} label="History" active={activeTab === 'History'} onClick={() => setActiveTab('History')} />
          <AdviceTab icon={Clock} label="Pending Advices" active={activeTab === 'Pending'} onClick={() => setActiveTab('Pending')} />
          <AdviceTab icon={Scan} label="Scane Advices" active={activeTab === 'Scane'} onClick={() => setActiveTab('Scane')} />
          <AdviceTab icon={FileOutput} label="Export Log" active={activeTab === 'Export'} onClick={() => setActiveTab('Export')} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Filters Header */}
        <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Show</span>
            <select className="h-9 border border-slate-200 rounded px-2 text-xs font-bold text-primary">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span className="text-[11px] font-bold text-slate-500 uppercase">entries</span>
          </div>

          <div className="flex flex-1 max-w-4xl items-center gap-4 justify-end">
            <Link href="/orders/advices/history">
              <button className="h-10 px-6 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md active:scale-95 transition-all flex items-center gap-2">
                <History size={14} /> History
              </button>
            </Link>
            <input 
              type="text" 
              placeholder="Tracking ID #" 
              className="h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none w-48"
            />
            <input type="date" className="h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none" />
            <input type="date" className="h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none" />
            <button className="h-10 px-6 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md active:scale-95 transition-all">
              Filter
            </button>
          </div>
        </div>

        {/* Data Table */}
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
                <td colSpan={13} className="py-2 text-center">
                  <div className="h-2 w-full bg-primary/80 rounded-full my-4 mx-auto max-w-[95%]" />
                  <p className="text-slate-300 italic text-sm font-medium pb-10">
                    Showing 0 to 0 of 0 entries
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
