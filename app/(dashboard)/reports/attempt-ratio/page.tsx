"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { FileOutput, ChevronDown, PieChart, BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ReportFilter = ({ label, placeholder, type = "text", value = "" }: any) => (
  <div className="flex-1 min-w-[200px] space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      {type === "select" ? (
        <div className="relative">
          <select className="w-full h-10 px-4 bg-white border border-slate-200 rounded-md text-xs font-bold text-primary appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20">
            <option value="">{placeholder}</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
        </div>
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

export default function AttemptRatioReportPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fakeData = [
      { city: 'Karachi', total: 1000, attempted: 950, delivered: 800, ratio: '80%' },
      { city: 'Lahore', total: 800, attempted: 750, delivered: 600, ratio: '75%' },
      { city: 'Islamabad', total: 500, attempted: 480, delivered: 400, ratio: '80%' },
      { city: 'Faisalabad', total: 300, attempted: 280, delivered: 210, ratio: '70%' },
    ];
    setData(fakeData);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Attempt Ratio Report</h1>
        <Button className="h-10 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 gap-2">
          <FileOutput size={14} /> Export Report
        </Button>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-end">
          <ReportFilter label="Date (From)" type="date" value="2026-04-01" />
          <ReportFilter label="Date (To)" type="date" value="2026-04-30" />
          <ReportFilter label="Client Name" placeholder="Select Name" type="select" />
          <Button className="h-10 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-lg">
            Calculate Ratio
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-primary">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Success Ratio</p>
            <p className="text-2xl font-black text-primary">76.2%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Delivered</p>
            <p className="text-2xl font-black text-green-600">2,010</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <PieChart size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Attempts</p>
            <p className="text-2xl font-black text-amber-600">2,460</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-slate-50/30">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">City-wise Attempt Ratio</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/20">
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">City</th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Orders</th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Attempted</th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Delivered</th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Success Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-bold animate-pulse">Loading Data...</td></tr>
              ) : data.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-slate-600">
                  <td className="p-4 text-[10px] font-bold">{item.city}</td>
                  <td className="p-4 text-[10px] font-bold">{item.total}</td>
                  <td className="p-4 text-[10px]">{item.attempted}</td>
                  <td className="p-4 text-[10px] text-green-600 font-bold">{item.delivered}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: item.ratio }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-primary w-8">{item.ratio}</span>
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
