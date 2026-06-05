"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StatItem = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-col items-center justify-center px-4 py-2 border-r border-white/10 last:border-0">
    <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest mb-1">{label}</span>
    <span className="text-xs font-black text-white">{value}</span>
  </div>
);

const SubStatItem = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-col space-y-1">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-black text-primary">{value}</span>
  </div>
);

const DebriefTab = ({ label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all relative whitespace-nowrap",
      active ? "text-primary" : "text-slate-400 hover:text-slate-600"
    )}
  >
    {label}
    {active && (
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
    )}
  </button>
);

export default function RollcartDebriefingPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const tabs = ['ALL', 'DELIVERED ORDERS', 'ATTEMPT ORDERS', 'ADVICE ORDERS', 'RETURNCONFIRM ORDERS', 'PENDING ORDERS'];
  const tableHeaders = [
    'Tracking ID', 'Name', 'Contact', 'Address', 'Amount', 'Attempt', 
    'Reasons & Remarks', 'Status', 'Warehouse Status', 'Info & attachments'
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Rollcart Debriefing</h1>

      {/* Top Header Stats Bar */}
      <div className="bg-primary rounded-xl shadow-lg overflow-hidden flex flex-wrap items-stretch">
        <StatItem label="Rider Name" value="--" />
        <StatItem label="Total Assigned" value="0" />
        <StatItem label="Total Reattempt" value="0" />
        <StatItem label="Total Delivered" value="0" />
        <StatItem label="Total Pending" value="0" />
        <StatItem label="Created At" value="0" />
        <StatItem label="Close At" value="Not Closed" />
        <StatItem label="Status" value="0" />
      </div>

      {/* Input Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-end gap-4">
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Rollcart Id key" 
            className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-primary focus:outline-none"
          />
        </div>
        <Button className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest shadow-md">
          Load
        </Button>
      </div>

      {/* Sub Stats Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-wrap gap-12">
        <SubStatItem label="Advices" value="0" />
        <SubStatItem label="Return Confirm" value="0" />
        <SubStatItem label="Total Reattempt" value="0" />
        <SubStatItem label="Total Delivered" value="0" />
        <SubStatItem label="Delivered Amount" value="0" />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 overflow-x-auto custom-scrollbar">
          {tabs.map(tab => (
            <DebriefTab 
              key={tab} 
              label={tab} 
              active={activeTab === tab} 
              onClick={() => setActiveTab(tab)} 
            />
          ))}
        </div>

        <div className="overflow-x-auto">
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
                <td colSpan={10} className="py-20 text-center text-slate-300 italic text-sm font-medium uppercase tracking-widest">
                   No orders found in this category
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
