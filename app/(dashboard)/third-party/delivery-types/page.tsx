"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface DeliveryType {
  id: string;
  name: string;
  lcs: boolean;
  mp: boolean;
}

const Toggle = ({ active, onToggle }: { active: boolean; onToggle: () => void }) => (
  <div 
    onClick={onToggle}
    className={cn(
      "w-10 h-5 rounded-full relative transition-colors cursor-pointer",
      active ? "bg-primary" : "bg-slate-200"
    )}
  >
    <div className={cn(
      "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
      active ? "right-0.5" : "left-0.5"
    )}></div>
  </div>
);

export default function DeliveryTypesPage() {
  const [types, setTypes] = useState<DeliveryType[]>([
    { id: '1', name: 'COD within the city', lcs: false, mp: false },
    { id: '2', name: 'COD Outstation', lcs: false, mp: false },
    { id: '3', name: 'Same Zone', lcs: false, mp: false },
    { id: '4', name: 'Other', lcs: false, mp: false },
    { id: '5', name: 'LTL', lcs: false, mp: false },
    { id: '6', name: 'FTL', lcs: false, mp: false },
    { id: '7', name: 'COD Outstation Tier A', lcs: false, mp: false },
    { id: '8', name: 'COD Outstation Tier ISB', lcs: false, mp: false },
    { id: '9', name: 'COD Outstation Tier KHI', lcs: false, mp: false },
    { id: '10', name: 'COD Outstation Tier RWP', lcs: false, mp: false },
    { id: '11', name: 'COD Outstation Tier LHE', lcs: false, mp: false },
    { id: '12', name: 'Main Cities Service', lcs: false, mp: false },
  ]);

  const toggleType = (id: string, field: 'lcs' | 'mp') => {
    setTypes(prev => prev.map(t => t.id === id ? { ...t, [field]: !t[field] } : t));
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Enable Delivery Type For Third Party Auto Order Creation</h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/30">
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Type</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">LCS</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">M&P</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {types.map((type) => (
              <tr key={type.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-[11px] font-bold text-slate-500 uppercase">{type.name}</td>
                <td className="p-4 flex justify-center">
                  <Toggle active={type.lcs} onToggle={() => toggleType(type.id, 'lcs')} />
                </td>
                <td className="p-4">
                  <div className="flex justify-center">
                    <Toggle active={type.mp} onToggle={() => toggleType(type.id, 'mp')} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
