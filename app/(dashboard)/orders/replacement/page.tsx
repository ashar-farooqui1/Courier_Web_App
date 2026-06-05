"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, ChevronDown } from 'lucide-react';

interface Replacement {
  id: string;
  requestNo: string;
  createDate: string;
  trackingId: string;
  client: string;
  orderStatus: string;
  deliveredBy: string;
  replacementStatus: 'Pending' | 'Collected' | 'Cancelled';
}

export default function OrdersReplacementPage() {
  const [data, setData] = useState<Replacement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating API Fetch with fake data from screenshot
    const fakeData: Replacement[] = [
      { id: '1', requestNo: '10000058', createDate: '2023-12-05 11:41:25', trackingId: '10122521', client: 'Maguari Textile', orderStatus: 'Cancelled', deliveredBy: '', replacementStatus: 'Pending' },
      { id: '2', requestNo: '10000059', createDate: '2023-12-08 07:28:51', trackingId: '10122789', client: 'Maguari Textile', orderStatus: 'Client Settled', deliveredBy: 'M.Rameez KHI', replacementStatus: 'Collected' },
      { id: '3', requestNo: '10000060', createDate: '2023-12-08 09:49:41', trackingId: '10122832', client: 'Maguari Textile', orderStatus: 'Client Settled', deliveredBy: '', replacementStatus: 'Collected' },
      { id: '4', requestNo: '10000061', createDate: '2023-12-07 10:30:12', trackingId: '10123192', client: 'Maguari Textile', orderStatus: 'Client Settled', deliveredBy: 'L HUB 1', replacementStatus: 'Collected' },
    ];
    setData(fakeData);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Orders Replacement List</h1>
        <div className="flex gap-4">
           <div className="relative">
              <select className="h-9 px-4 bg-white border border-slate-200 rounded text-xs font-bold text-primary appearance-none min-w-[150px] focus:outline-none">
                <option>--select--</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
           </div>
           <div className="relative">
              <select className="h-9 px-4 bg-white border border-slate-200 rounded text-xs font-bold text-primary appearance-none min-w-[150px] focus:outline-none">
                <option>--select--</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Show</span>
            <select className="h-9 border border-slate-200 rounded px-2 text-xs font-bold text-primary">
              <option>10</option>
            </select>
            <span className="text-[11px] font-bold text-slate-500 uppercase">entries</span>
          </div>

          <div className="flex items-center gap-4">
            <input type="text" placeholder="Tracking ID #" className="h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none w-48" />
            <input type="date" className="h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none" />
            <input type="date" className="h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none" />
            <button className="h-10 px-6 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md flex items-center gap-2">
              <Search size={14} /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Request #</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Create Date</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Tracking ID #</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Client</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Order Status</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Delivered By</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Replacement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="p-10 text-center text-slate-400 font-bold animate-pulse">Loading...</td></tr>
              ) : data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-[10px] font-bold text-slate-600 uppercase">{item.requestNo}</td>
                  <td className="p-4 text-[10px] font-medium text-slate-400">{item.createDate}</td>
                  <td className="p-4 text-[10px] font-bold text-primary">{item.trackingId}</td>
                  <td className="p-4 text-[10px] font-bold text-slate-600 uppercase">{item.client}</td>
                  <td className="p-4 text-[10px] font-medium text-slate-500 uppercase">{item.orderStatus}</td>
                  <td className="p-4 text-[10px] font-bold text-slate-600 uppercase">{item.deliveredBy || '--'}</td>
                  <td className="p-4">
                    <div className="relative">
                      <select 
                        defaultValue={item.replacementStatus}
                        className={cn(
                          "h-8 w-full px-3 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold appearance-none focus:outline-none",
                          item.replacementStatus === 'Pending' ? "text-slate-500" : "text-primary"
                        )}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Collected">Collected</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
