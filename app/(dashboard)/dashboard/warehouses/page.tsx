"use client";

import React from 'react';
import { Edit2, Trash2, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WarehousesPage() {
  const tableHeaders = ['Name', 'City', 'Address', 'Action'];

  const warehouses = [
    { name: 'Karachi', city: 'KARACHI', address: '29C Old Clifton block 5, Karachi' },
    { name: 'Lahore', city: 'LAHORE', address: 'Plot number 132 allama iqbal road garhi shahu Opposite Euro store Lahore' },
    { name: 'Islamabad', city: 'RAWALPINDI', address: 'RAJGAN HAVELI, DREAM FURNITURE & INTERIORS AFSAR PLAZA, KRL RD, NEAR IMAM-E- AZAM MASJID, RAWALPINDI,' },
    { name: 'L - HUB', city: 'KARACHI', address: 'L - HUB' },
    { name: 'D - Hub', city: 'KARACHI', address: 'D - Hub' },
    { name: 'Multan', city: 'MULTAN', address: 'House 1284/16, Street # 12, Area Qadirabad, Tareen Road Multan' },
    { name: 'Faisalabad', city: 'FAISALABAD', address: 'Gulberg road p 138 B gulberg B basement Faisalabad' },
    { name: 'Karachi-Nazimabad', city: 'KARACHI', address: 'Basement 215, 3-C,7/2 Nazimabad # 3 Karachi' },
    { name: 'Kamalia', city: 'KAMALIA', address: 'chichawatni road near ubl bank kamalia' },
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
           <div className="relative w-64">
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
                  <th key={idx} className={cn(
                    "p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap",
                    header === 'Action' && "text-right"
                  )}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[11px] font-medium text-slate-600">
              {warehouses.map((wh, idx) => (
                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">{wh.name}</td>
                  <td className="p-4">{wh.city}</td>
                  <td className="p-4 text-[10px]">{wh.address}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
                        <Edit2 size={12} />
                      </button>
                      <button className="p-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-white flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase">Showing 1 to 9 of 9 entries</p>
        </div>
      </div>
    </div>
  );
}
