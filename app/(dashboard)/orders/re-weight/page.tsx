"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, FileOutput, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReWeightArrivalsPage() {
  const tableHeaders = [
    'AWB ID', 'Client Name', 'Customer Name', 'Customer Number', 'Amount', 
    'Reference ID / Article Code', 'Service', 'Weight', 'Order Time & Date', 
    'Exp. Delivery Date', 'Rider'
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Orders Arrive List</h1>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex-1 min-w-[200px] space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tracking ID #</label>
          <input type="text" placeholder="Tracking ID #" className="w-full h-10 px-4 bg-white border border-slate-200 rounded-md text-xs font-bold text-primary focus:outline-none" />
        </div>

        <div className="flex-1 min-w-[200px] space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">New weight</label>
          <div className="flex items-center gap-0">
             <div className="h-10 w-10 bg-primary text-white flex items-center justify-center rounded-l-md"><input type="checkbox" className="w-3 h-3" /></div>
             <input type="text" placeholder="New weight" className="flex-1 h-10 px-4 bg-white border border-slate-200 rounded-r-md text-xs font-bold text-primary focus:outline-none" />
          </div>
        </div>

        <div className="flex-1 min-w-[200px] space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Default weight</label>
          <div className="flex items-center gap-0">
             <div className="h-10 w-10 bg-primary text-white flex items-center justify-center rounded-l-md"><input type="checkbox" className="w-3 h-3" /></div>
             <input type="text" placeholder="Default weight" className="flex-1 h-10 px-4 bg-white border border-slate-200 rounded-r-md text-xs font-bold text-primary focus:outline-none" />
          </div>
        </div>

        <div className="flex-1 min-w-[200px] space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rider</label>
          <div className="relative">
            <select className="w-full h-10 px-4 bg-white border border-slate-200 rounded-md text-xs font-bold text-primary appearance-none focus:outline-none cursor-pointer">
              <option>Please Select a rider</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="flex gap-2 items-end pt-5">
          <Button className="bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest h-10 px-6 gap-2">
            <Trash2 size={14} /> Clear log
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest h-10 px-6 gap-2">
            <FileOutput size={14} /> Export
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Show</span>
            <select className="h-9 border border-slate-200 rounded px-2 text-xs font-bold text-primary">
              <option>10</option>
            </select>
            <span className="text-[11px] font-bold text-slate-500 uppercase">entries</span>
          </div>
        </div>

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
                <td colSpan={11} className="py-2 text-center">
                  <div className="h-2 w-full bg-primary/80 rounded-full my-4 mx-auto max-w-[95%]" />
                  <p className="text-slate-300 italic text-sm font-medium pb-10 uppercase tracking-widest">
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
