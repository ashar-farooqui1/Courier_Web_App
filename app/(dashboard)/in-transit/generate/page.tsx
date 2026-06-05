"use client";

import React from 'react';
import { Truck, CheckCircle, History, Download, Printer, Eye } from 'lucide-react';
import { InTransitNav } from '@/components/InTransitNav';

export default function GenerateInTransitPage() {
  const tabs = [
    { icon: Truck, label: "InTransit", href: "/in-transit/generate" },
    { icon: CheckCircle, label: "InTransit Received", href: "/in-transit/receive" },
    { icon: History, label: "InTransit History", href: "/in-transit/record" },
  ];

  const tableHeaders = [
    'Forwarding #', 'Shipments', 'Departed Bags', 'Arrived Bags', 
    'Origin Warehouse', 'Destination Warehouse', 'InTransit Date', 
    'Received Date', 'Cargo/Driver Name', 'Bilty/Vehicle #', 
    'Bags Total Weight', 'Charged Weight', 'Status', 'Action'
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Navigation Tabs */}
      <InTransitNav tabs={tabs} />

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origin Warehouse</label>
            <input type="text" className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination Warehouse</label>
            <input type="text" className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
            <select className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none">
              <option>Select an option</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter By</label>
            <select className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none">
              <option>InTransit Date</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date (From)</label>
            <input type="date" defaultValue="2026-04-01" className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date (To)</label>
            <input type="date" defaultValue="2026-04-30" className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Controls */}
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Show</span>
            <select className="h-9 border border-slate-200 rounded px-2 text-xs font-bold text-primary">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span className="text-[11px] font-bold text-slate-500 uppercase">entries</span>
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
              {/* Filter Row matching screenshot */}
              <tr className="border-b border-slate-50">
                {tableHeaders.map((_, idx) => (
                  <td key={idx} className="p-2">
                    {idx < 13 ? (
                      <input 
                        type={idx === 6 || idx === 7 ? "date" : "text"} 
                        className="w-full h-8 px-2 border border-slate-100 rounded text-[10px] focus:outline-none" 
                      />
                    ) : null}
                  </td>
                ))}
              </tr>
            </thead>
            <tbody className="text-[11px] font-medium text-slate-600">
              <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-primary font-bold">FWD1LHE10001667</td>
                <td className="p-4">1</td>
                <td className="p-4">1</td>
                <td className="p-4">1</td>
                <td className="p-4">Karachi</td>
                <td className="p-4">Lahore</td>
                <td className="p-4">2026-04-23 23:08:33</td>
                <td className="p-4">2026-04-23 18:11:51</td>
                <td className="p-4"></td>
                <td className="p-4"></td>
                <td className="p-4">4</td>
                <td className="p-4"></td>
                <td className="p-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">arrived</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors">
                      <Download size={14} />
                    </button>
                    <button className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors">
                      <Printer size={14} />
                    </button>
                    <button className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors">
                      <Eye size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Pagination Info */}
        <div className="p-4 bg-slate-50/30 flex items-center justify-between border-t border-slate-50">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Showing 1 to 1 of 1 entries</p>
        </div>

        {/* The red progress bar look-alike from screenshot */}
        <div className="h-2 w-full bg-primary/80" />
      </div>
    </div>
  );
}
