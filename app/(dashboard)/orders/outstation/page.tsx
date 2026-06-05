"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OutstationFilter = ({ label, placeholder, type = "text", value = "" }: any) => (
  <div className="flex-1 min-w-[200px] space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      {type === "select" ? (
        <select className="w-full h-10 px-4 bg-white border border-slate-200 rounded-md text-xs font-bold text-primary appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer">
          <option value="">{placeholder}</option>
        </select>
      ) : (
        <input 
          type={type} 
          defaultValue={value}
          placeholder={placeholder}
          className="w-full h-10 px-4 bg-white border border-slate-200 rounded-md text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-slate-300"
        />
      )}
    </div>
  </div>
);

export default function OrderOutstationPage() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Order OutStation</h1>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <OutstationFilter label="Date (From)" placeholder="" type="date" value="2026-04-01" />
          <OutstationFilter label="Date (To)" placeholder="" type="date" value="2026-04-29" />
          <OutstationFilter label="Client Name" placeholder="Select Name" type="select" />
          <OutstationFilter label="City" placeholder="Select City" type="select" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <OutstationFilter label="Status" placeholder="Select Status" type="select" />
          <div className="lg:col-span-1">
            <Button className="w-full h-10 font-bold bg-primary text-white flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all">
              <Printer size={16} />
              Print Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
