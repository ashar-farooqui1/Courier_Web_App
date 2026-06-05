"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { FileOutput, ChevronDown, Search, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ReportFilter = ({ label, placeholder, type = "text", value = "" }: any) => (
  <div className="flex-1 min-w-[200px] space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      {type === "select" ? (
        <div className="relative">
          <select className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg text-xs font-bold text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all">
            <option value="">{placeholder}</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
        </div>
      ) : (
        <input 
          type={type} 
          defaultValue={value}
          placeholder={placeholder}
          className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300"
        />
      )}
    </div>
  </div>
);

export default function ShipmentChargesReportPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const tableHeaders = [
    'AWB ID', 'Client Name', 'Customer Name', 'Customer Number', 'Consultant Number', 
    'Area', 'City', 'Delivery Address', 'Amount', 'Service', 
    'Order Time & Date', 'Exp. Delivery Date', 'Status', 'Action'
  ];

  useEffect(() => {
    // Simulating API Fetch with data from the image
    const fakeData = Array(10).fill(null).map((_, i) => ({
      awbId: 10121197 + i,
      clientName: 'Saeed Ghani',
      customerName: i % 2 === 0 ? 'Ahmed Talal' : 'Ayesha Ayaz',
      customerNumber: i % 2 === 0 ? '03217999919' : '03363806486',
      consultantNumber: '',
      area: i % 2 === 0 ? 'B-703, 7th floor lateef dueplex luxuria...' : 'R1128 block 17 federal b area Karachi',
      city: 'Karachi',
      deliveryAddress: i % 2 === 0 ? 'B-703, 7th floor lateef dueplex luxuria...' : 'R1128 block 17 federal b area Karachi',
      amount: i % 2 === 0 ? 'Rs. 11871' : 'Rs. 3342',
      service: 'COD within the city',
      orderDate: '2023-12-01 09:50',
      expDate: '2023-12-04',
      status: 'Client Settled'
    }));
    setData(fakeData);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6 max-w-[1900px] mx-auto animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Shipment Detail Report</h1>
        <Button className="h-10 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 gap-2 px-6">
          <FileOutput size={14} /> Export
        </Button>
      </div>

      {/* Filter Card */}
      <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ReportFilter label="Date (From)" type="date" />
          <ReportFilter label="Date (To)" type="date" />
          <ReportFilter label="Client Name" placeholder="Select Name" type="select" />
          <ReportFilter label="City" placeholder="Select City" />
        </div>
        <div className="flex justify-start">
          <Button className="h-12 px-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95">
            View Report
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between bg-slate-50/30 gap-4">
          <div className="flex items-center gap-6">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Order Details Reports</h3>
            <div className="flex items-center gap-2 border-l pl-6 border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Show</span>
              <select className="h-9 border border-slate-200 rounded px-3 text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary/20">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span className="text-[10px] font-bold text-slate-500 uppercase">entries</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button className="h-9 px-4 text-[10px] font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-white">Select All</Button>
              <Button className="h-9 px-4 text-[10px] font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-white">Deselect All</Button>
            </div>
            <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Search:</span>
              <div className="relative">
                <input type="text" className="h-9 border border-slate-200 rounded-lg px-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 w-64 transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/20">
                <th className="p-4 w-10"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" /></th>
                {tableHeaders.map((header, idx) => (
                  <th key={idx} className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={15} className="p-32 text-center text-slate-400 font-bold animate-pulse">Loading Report Data...</td></tr>
              ) : data.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" /></td>
                  <td className="p-4 text-[11px] font-black text-primary hover:underline cursor-pointer">{item.awbId}</td>
                  <td className="p-4 text-[11px] font-bold text-slate-700">{item.clientName}</td>
                  <td className="p-4 text-[11px] text-slate-600 font-medium">{item.customerName}</td>
                  <td className="p-4 text-[11px] text-slate-600">{item.customerNumber}</td>
                  <td className="p-4 text-[11px] text-slate-400 italic">{item.consultantNumber || '--'}</td>
                  <td className="p-4 text-[11px] text-slate-600 max-w-[200px] truncate" title={item.area}>{item.area}</td>
                  <td className="p-4 text-[11px] font-black text-slate-700">{item.city}</td>
                  <td className="p-4 text-[11px] text-slate-600 max-w-[200px] truncate" title={item.deliveryAddress}>{item.deliveryAddress}</td>
                  <td className="p-4 text-[11px] font-black text-primary">{item.amount}</td>
                  <td className="p-4 text-[11px] text-slate-500 font-medium whitespace-nowrap">{item.service}</td>
                  <td className="p-4 text-[11px] text-slate-500 whitespace-nowrap">{item.orderDate}</td>
                  <td className="p-4 text-[11px] text-slate-500 whitespace-nowrap">{item.expDate}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded bg-blue-50 text-primary text-[10px] font-black uppercase tracking-wider">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm">
                        <Eye size={14} />
                      </button>
                      <button className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm">
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination Section */}
        <div className="p-6 border-t border-slate-50 flex flex-wrap justify-between items-center bg-slate-50/10 gap-4">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Showing 1 to 10 of 827,207 entries
          </span>
          <div className="flex gap-1">
             <button className="px-3 py-1.5 rounded-md bg-primary text-white text-[11px] font-black shadow-lg shadow-primary/20">1</button>
             <button className="px-3 py-1.5 rounded-md text-slate-400 text-[11px] font-black hover:bg-slate-100 transition-colors">2</button>
             <button className="px-3 py-1.5 rounded-md text-slate-400 text-[11px] font-black hover:bg-slate-100 transition-colors">3</button>
             <button className="px-3 py-1.5 rounded-md text-slate-400 text-[11px] font-black hover:bg-slate-100 transition-colors">4</button>
             <span className="px-2 self-end text-slate-300">...</span>
             <button className="px-3 py-1.5 rounded-md text-slate-400 text-[11px] font-black hover:bg-slate-100 transition-colors">82720</button>
             <button className="px-3 py-1.5 rounded-md text-slate-400 text-[11px] font-black hover:bg-slate-100 transition-colors">82721</button>
          </div>
        </div>
      </div>
    </div>
  );
}
