"use client";

import React from 'react';
import { Package, Trash2, History, Search } from 'lucide-react';
import { InTransitNav } from '@/components/InTransitNav';

export default function DeSackedPage() {
  const tabs = [
    { icon: Package, label: "Sacked", href: "/in-transit/sacked" },
    { icon: Trash2, label: "De-Sacked", href: "/in-transit/de-sacked" },
    { icon: History, label: "Sacked History", href: "/in-transit/sacked-history" },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Navigation Tabs */}
      <InTransitNav tabs={tabs} />

      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <div className="flex flex-col gap-3 max-w-xl">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Seal ID
          </label>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Enter Seal ID" 
              className="flex-1 h-12 px-4 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <button className="h-12 px-10 bg-primary text-white text-[11px] font-bold rounded-lg uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2">
              <Search size={14} />
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
