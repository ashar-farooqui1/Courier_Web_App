"use client";

import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ActiveOrdersPage() {
  const cities = [
    { name: 'ABBOTTABAD', type: 'incoming', count: 7 },
    { name: 'BANGLA YATEEM W', type: 'incoming', count: 1 },
    { name: 'BHAI PHERU', type: 'incoming', count: 2 },
    { name: 'BHARA KHU', type: 'incoming', count: 1 },
    { name: 'BUNNER', type: 'incoming', count: 2 },
    { name: 'Bahawalpur', type: 'incoming', count: 1 },
    { name: 'Burewala', type: 'incoming', count: 1 },
    { name: 'DERA ISMAIL KHAN', type: 'incoming', count: 1 },
    { name: 'DUKOT', type: 'incoming', count: 1 },
    { name: 'EASA KHEL', type: 'incoming', count: 1 },
    { name: 'FAISALABAD', outgoing: true, type: 'outgoing', count: 117 },
    { name: 'FAISALABAD', type: 'incoming', count: 341 },
    { name: 'GUJRANWALA', type: 'incoming', count: 3 },
    { name: 'GUJRAT', type: 'incoming', count: 3 },
    { name: 'HYDERABAD', type: 'incoming', count: 3 },
    { name: 'ISLAMABAD', outgoing: true, type: 'outgoing', count: 132 },
    { name: 'ISLAMABAD', type: 'incoming', count: 1285 },
    { name: 'JALAL PUR SOBTIAN', type: 'incoming', count: 1 },
    { name: 'JHANG', type: 'incoming', count: 1 },
    { name: 'JHELUM', type: 'incoming', count: 1 },
    { name: 'KAMALIA', outgoing: true, type: 'outgoing', count: 58 },
    { name: 'KARACHI', type: 'incoming', count: 1663 },
    { name: 'KASUR', type: 'incoming', count: 3 },
    { name: 'KHANPUR', type: 'incoming', count: 1 },
    { name: 'KHUSHAB', type: 'incoming', count: 1 },
    { name: 'KOTLA ARAB ALI', type: 'incoming', count: 1 },
    { name: 'Karachi', outgoing: true, type: 'outgoing', count: 4472 },
    { name: 'LAHORE', outgoing: true, type: 'outgoing', count: 927 },
    { name: 'LAHORE', type: 'incoming', count: 2227 },
    { name: 'LALAMUSA', type: 'incoming', count: 1 },
    { name: 'LODHRAN', type: 'incoming', count: 1 },
    { name: 'MANA AHMDANI', type: 'incoming', count: 1 },
    { name: 'MATTA (SWAT)', type: 'incoming', count: 1 },
    { name: 'MIAN CHANNU', type: 'incoming', count: 1 },
    { name: 'MIANWALI', type: 'incoming', count: 1 },
    { name: 'MULTAN', outgoing: true, type: 'outgoing', count: 332 },
    { name: 'MULTAN', type: 'incoming', count: 197 },
    { name: 'MIRPUR', type: 'incoming', count: 1 },
    { name: 'OKARA', type: 'incoming', count: 3 },
    { name: 'PAHRIANWALI ADD', type: 'incoming', count: 1 },
    { name: 'PESHAWAR', type: 'incoming', count: 2 },
    { name: 'QUETTA', type: 'incoming', count: 2 },
    { name: 'RAHIM YAR KHAN', type: 'incoming', count: 3 },
    { name: 'RAWALPINDI', type: 'incoming', count: 846 },
    { name: 'Rawalpindi', outgoing: true, type: 'outgoing', count: 21 },
    { name: 'SAHIWAL', type: 'incoming', count: 2 },
    { name: 'SARGODHA', type: 'incoming', count: 2 },
    { name: 'SHAHDARA', type: 'incoming', count: 1 },
    { name: 'SUKKUR', type: 'incoming', count: 1 },
    { name: 'Sheikhupura', type: 'incoming', count: 1 },
    { name: 'TALWANDI', type: 'incoming', count: 1 },
    { name: 'TAXILA', type: 'incoming', count: 1 },
    { name: 'THULL', type: 'incoming', count: 1 },
    { name: 'UGGO KI', type: 'incoming', count: 1 },
    { name: 'WAN BHACHRAN', type: 'incoming', count: 1 },
    { name: 'WINDER', type: 'incoming', count: 1 },
    { name: 'sialkot', type: 'incoming', count: 4 },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex justify-end">
         <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="search key" 
              className="w-full h-10 pl-4 pr-10 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none"
            />
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {cities.map((city, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow group cursor-pointer">
             <div className="flex flex-col gap-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate group-hover:text-primary transition-colors">
                  {city.name}
                </h3>
                <div className="flex items-center justify-between">
                   <span className={cn(
                     "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter",
                     city.type === 'incoming' ? "bg-primary text-white" : "bg-primary text-white"
                   )}>
                     {city.type}
                   </span>
                   <span className="w-6 h-6 flex items-center justify-center bg-primary text-white rounded text-[10px] font-bold">
                     {city.count}
                   </span>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
