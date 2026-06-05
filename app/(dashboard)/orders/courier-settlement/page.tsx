"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Settlement {
  id: string;
  courier: string;
  hub: string;
  totalOrders: number;
  toSettle: number;
}

export default function CourierSettlementPage() {
  const [data, setData] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated API Fetch
    const fakeData: Settlement[] = [
      { id: '1', courier: 'M.Nabeel KHI', hub: 'Liyari - Karachi', totalOrders: 17, toSettle: 60578.97 },
      { id: '2', courier: 'Ahtisham Abbasi KHI', hub: 'Liyaqatabad - Karachi', totalOrders: 14, toSettle: 75623 },
      { id: '3', courier: 'L HUB 1', hub: 'CLIFTON - KARACHI', totalOrders: 131, toSettle: 393804.99 },
      { id: '4', courier: 'TAHIR KHAN - KHI', hub: '-- KARACHI', totalOrders: 7, toSettle: 78114 },
      { id: '5', courier: 'NADEEM AZIZ KHI', hub: 'GULSHAN / JOHAR - KARACHI', totalOrders: 14, toSettle: 62280 },
    ];
    setData(fakeData);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Couriers Settlement</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
           <span className="text-xs font-bold text-primary uppercase tracking-tighter">Settlements</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-4"><input type="checkbox" className="rounded border-slate-300" /></th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Courier</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Courier Hub</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Orders</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">To Settle</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="p-10 text-center text-slate-400 font-bold animate-pulse">Loading Settlements...</td></tr>
              ) : data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4"><input type="checkbox" className="rounded border-slate-300 text-primary" /></td>
                  <td className="p-4 text-xs font-bold text-slate-600 uppercase">{item.courier}</td>
                  <td className="p-4 text-xs font-bold text-slate-400 uppercase">{item.hub}</td>
                  <td className="p-4 text-xs font-bold text-slate-600">{item.totalOrders}</td>
                  <td className="p-4 text-xs font-bold text-slate-600">{item.toSettle.toLocaleString()}</td>
                  <td className="p-4">
                    <Link href="/orders/courier-settlement/detail">
                      <button className="text-[10px] font-bold text-primary hover:underline uppercase">search</button>
                    </Link>
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
