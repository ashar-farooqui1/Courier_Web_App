"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { FileOutput, ChevronDown, Search, Eye, FileText } from 'lucide-react';
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

export default function DeliveryChargesReportPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const tableHeaders = [
    'AWB ID', 'Client Name', 'Customer Name', 'Customer Number', 'Consultant Number', 
    'Area', 'City', 'Delivery Address', 'Amount', 'Service', 
    'Order Time & Date', 'Exp. Delivery Date', 'Status', 'Action'
  ];

  useEffect(() => {
    // Simulating API Fetch with fake data from screenshot
    const fakeData = Array(10).fill(null).map((_, i) => ({
      id: `1012119${i + 7}`,
      clientName: 'Saeed Ghani',
      customerName: 'Ahmed Talal',
      customerNumber: '03217999919',
      consultantNumber: '',
      area: 'B-703, 7th floor lateef dueplex luxuria opposite eden banquet hall scheme 33 gulzar e hijri Karachi',
      city: 'KARACHI',
      address: 'B-703, 7th floor lateef dueplex luxuria opposite eden banquet hall scheme 33 gulzar e hijri Karachi',
      amount: 'Rs. 11871',
      service: 'COD within the city',
      orderDate: '2023-12-01 09:50',
      expDate: '2023-12-04',
      status: 'Client Settled'
    }));
    setData(fakeData);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Delivery Charges Report</h1>
        <Button className="h-10 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 gap-2">
          <FileOutput size={14} /> Export
        </Button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ReportFilter label="Date (From)" type="date" />
          <ReportFilter label="Date (To)" type="date" />
          <ReportFilter label="Client Name" placeholder="Select Name" type="select" />
          <ReportFilter label="Status" placeholder="Select Status" type="select" />
        </div>
        <div className="flex justify-center">
          <Button className="h-10 px-20 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-lg">
            View Report
          </Button>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Order Details Reports</h3>
            <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Show</span>
              <select className="h-8 border border-slate-200 rounded px-2 text-xs font-bold text-primary">
                <option>10</option>
              </select>
              <span className="text-[11px] font-bold text-slate-500 uppercase">entries</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="h-8 px-4 text-[10px] font-bold bg-primary text-white">Select All</Button>
              <Button variant="outline" className="h-8 px-4 text-[10px] font-bold bg-primary text-white">Deselect All</Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <span className="text-[11px] font-bold text-slate-500 uppercase">Search:</span>
             <input type="text" className="h-9 border border-slate-200 rounded-lg px-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 w-64" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/20">
                <th className="p-4"><input type="checkbox" className="rounded border-slate-300" /></th>
                {tableHeaders.map((header, idx) => (
                  <th key={idx} className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={15} className="p-20 text-center text-slate-400 font-bold animate-pulse">Loading Data...</td></tr>
              ) : data.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-slate-600">
                  <td className="p-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                  <td className="p-4 text-[10px] font-bold text-primary underline cursor-pointer">{item.id}</td>
                  <td className="p-4 text-[10px] font-bold">{item.clientName}</td>
                  <td className="p-4 text-[10px]">{item.customerName}</td>
                  <td className="p-4 text-[10px]">{item.customerNumber}</td>
                  <td className="p-4 text-[10px]">{item.consultantNumber || '--'}</td>
                  <td className="p-4 text-[10px] max-w-[200px] truncate">{item.area}</td>
                  <td className="p-4 text-[10px] font-bold">{item.city}</td>
                  <td className="p-4 text-[10px] max-w-[200px] truncate">{item.address}</td>
                  <td className="p-4 text-[10px] font-bold text-primary">{item.amount}</td>
                  <td className="p-4 text-[10px]">{item.service}</td>
                  <td className="p-4 text-[10px] whitespace-nowrap">{item.orderDate}</td>
                  <td className="p-4 text-[10px] whitespace-nowrap">{item.expDate}</td>
                  <td className="p-4 text-[10px] font-bold">{item.status}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button className="p-1.5 bg-primary/10 text-primary rounded hover:bg-primary hover:text-white transition-all"><Eye size={12} /></button>
                      <button className="p-1.5 bg-green-500/10 text-green-600 rounded hover:bg-green-600 hover:text-white transition-all"><FileText size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Placeholder */}
        <div className="p-6 border-t border-slate-50 flex justify-between items-center bg-slate-50/10">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Showing 1 to 10 of 827207 entries</span>
          <div className="flex gap-1">
             <button className="w-8 h-8 rounded bg-primary text-white text-[10px] font-bold">1</button>
             <button className="w-8 h-8 rounded text-slate-400 text-[10px] font-bold hover:bg-slate-100">2</button>
             <button className="w-8 h-8 rounded text-slate-400 text-[10px] font-bold hover:bg-slate-100">3</button>
             <span className="self-end px-2 text-slate-300">...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
