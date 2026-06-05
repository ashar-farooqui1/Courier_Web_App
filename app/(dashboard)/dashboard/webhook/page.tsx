"use client";

import React from 'react';
import { Edit2, Trash2, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WebhookPage() {
  const tableHeaders = ['Client Name', 'Callback URL', 'Status', 'Action'];

  const webhooks = [
    { name: 'Selection.pk', url: 'https://selection.etaps.me/do-deliver/hookRequest?auth=selection&type=shipmentStatus', status: 'Not Active' },
    { name: 'Scent You', url: 'https://sentyou.etaps.me/do-deliver/hookRequest?auth=sentyou&type=shipmentStatus', status: 'Not Active' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Show</span>
          <select className="h-9 border border-slate-200 rounded px-2 text-xs font-bold text-primary">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          <span className="text-[11px] font-bold text-slate-500 uppercase">entries</span>
        </div>

        <div className="flex items-center gap-4">
           <div className="relative w-96">
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full h-10 pl-4 pr-10 bg-white border border-slate-200 rounded text-xs font-medium focus:outline-none"
              />
              <div className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center bg-primary text-white rounded-r">
                <Search size={14} />
              </div>
           </div>
           <button className="h-10 w-10 bg-primary text-white rounded flex items-center justify-center shadow-md active:scale-95 transition-all">
              <Plus size={18} />
           </button>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-slate-100 overflow-hidden">
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
            <tbody className="text-[11px] font-medium text-slate-600">
              {webhooks.map((hook, idx) => (
                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">{hook.name}</td>
                  <td className="p-4 text-[10px] text-slate-400">{hook.url}</td>
                  <td className="p-4">
                    <span className="text-slate-500 font-bold">{hook.status}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button className="p-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
                        <Trash2 size={14} />
                      </button>
                      <button className="h-8 px-4 bg-primary text-white text-[10px] font-bold rounded uppercase shadow-sm ml-4 hover:bg-primary/90 transition-colors">
                        Test
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-white border-t border-slate-50">
           <p className="text-[10px] font-bold text-slate-400 uppercase">Showing 1 to 2 of 2 entries</p>
        </div>
      </div>
    </div>
  );
}
