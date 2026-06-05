"use client";

import React from 'react';
import { Download, Trash2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InvoicesPage() {
  const tableHeaders = [
    'Client ID', 'Client', 'Create Date', 'Changed Date', 'Invoice No.', 
    'Total Orders', 'Freight Charges', 'Fuel Charges', 'GST Charges', 
    'Gross Freight Charges', 'From Date', 'To Date', 'Status', 'Action'
  ];

  const invoices = [
    { id: 1338, client: 'Digi Khata-South', createDate: '17 Oct 2025 11:06 am', changeDate: '17 Oct 2025 11:10 am', invoiceNo: '13287', totalOrders: 433, freight: 45315, fuel: 0, gst: 0, gross: 45315, from: '2025-10-16', to: '2025-10-16', status: 'Charged' },
    { id: 1243, client: 'ORIO TECHNOLOGIES', createDate: '17 Oct 2025 11:06 am', changeDate: '17 Oct 2025 11:13 am', invoiceNo: '13286', totalOrders: 65, freight: 8436, fuel: 0, gst: 0, gross: 8436, from: '2025-10-16', to: '2025-10-16', status: 'Charged' },
    { id: 935, client: 'Smartlane', createDate: '17 Oct 2025 11:06 am', changeDate: '17 Oct 2025 11:24 am', invoiceNo: '13285', totalOrders: 146, freight: 27962, fuel: 0, gst: 0, gross: 27962, from: '2025-10-16', to: '2025-10-16', status: 'Charged' },
    { id: 1173, client: 'Digikhata', createDate: '17 Oct 2025 11:05 am', changeDate: '17 Oct 2025 11:11 am', invoiceNo: '13284', totalOrders: 25, freight: 2675, fuel: 0, gst: 0, gross: 2675, from: '2025-10-15', to: '2025-10-15', status: 'Charged' },
    { id: 567, client: 'Orient Textile', createDate: '17 Oct 2025 11:05 am', changeDate: '17 Oct 2025 11:13 am', invoiceNo: '13283', totalOrders: 47, freight: 9585.51, fuel: 0, gst: 0, gross: 9585.51, from: '2025-10-16', to: '2025-10-16', status: 'Charged' },
    { id: 210, client: 'Saeed Ghani', createDate: '17 Oct 2025 11:05 am', changeDate: '17 Oct 2025 11:22 am', invoiceNo: '13282', totalOrders: 49, freight: 5567.88, fuel: 0, gst: 0, gross: 5567.88, from: '2025-10-16', to: '2025-10-16', status: 'Charged' },
    { id: 766, client: 'Mashq Calligraphy Store', createDate: '17 Oct 2025 10:35 am', changeDate: 'Not Settle', invoiceNo: '13252', totalOrders: 2, freight: 1560, fuel: 0, gst: 0, gross: 1560, from: '2025-10-03', to: '2025-10-04', status: 'Pending' },
    { id: 890, client: 'Noors collection', createDate: '17 Oct 2025 10:49 am', changeDate: '17 Oct 2025 10:49 am', invoiceNo: '13251', totalOrders: 4, freight: 1200, fuel: 0, gst: 0, gross: 1200, from: '2025-10-04', to: '2025-10-04', status: 'Charged' },
    { id: 920, client: 'Ecom Beast Pvt Ltd.', createDate: '17 Oct 2025 10:42 am', changeDate: '17 Oct 2025 10:42 am', invoiceNo: '13250', totalOrders: 35, freight: 5570, fuel: 0, gst: 0, gross: 5570, from: '2025-10-04', to: '2025-10-04', status: 'Charged' },
    { id: 1078, client: 'Meraas', createDate: '17 Oct 2025 10:35 am', changeDate: '17 Oct 2025 10:47 am', invoiceNo: '13249', totalOrders: 116, freight: 16820, fuel: 0, gst: 0, gross: 16820, from: '2025-10-16', to: '2025-10-16', status: 'Charged' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Client Invoices</h1>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</label>
            <div className="relative">
              <select className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none appearance-none cursor-pointer">
                <option>Please select client</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Invoice</label>
            <div className="relative">
              <select className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none appearance-none cursor-pointer">
                <option>--All--</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From Date</label>
            <input type="date" defaultValue="2026-03-31" className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To Date</label>
            <input type="date" defaultValue="2026-04-30" className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none" />
          </div>
        </div>
        <div className="mt-4 flex gap-2 justify-end">
          <button className="h-10 px-12 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all">
            Search
          </button>
          <button className="h-10 px-12 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all">
            Export
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Show</span>
            <select className="h-9 border border-slate-200 rounded px-2 text-xs font-bold text-primary">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span className="text-[11px] font-bold text-slate-500 uppercase">entries</span>
          </div>
        </div>

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
              {invoices.map((inv, idx) => (
                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">{inv.id}</td>
                  <td className="p-4 font-bold">{inv.client}</td>
                  <td className="p-4 text-[10px]">{inv.createDate}</td>
                  <td className="p-4 text-[10px]">{inv.changeDate}</td>
                  <td className="p-4">{inv.invoiceNo}</td>
                  <td className="p-4">{inv.totalOrders}</td>
                  <td className="p-4">{inv.freight}</td>
                  <td className="p-4">{inv.fuel}</td>
                  <td className="p-4">{inv.gst}</td>
                  <td className="p-4">{inv.gross}</td>
                  <td className="p-4 text-[10px]">{inv.from}</td>
                  <td className="p-4 text-[10px]">{inv.to}</td>
                  <td className="p-4">
                    {inv.status === 'Charged' ? (
                      <span className="px-2 py-1 bg-emerald-500 text-white text-[9px] font-bold rounded uppercase">Charged</span>
                    ) : (
                      <div className="relative">
                        <select className="h-8 px-2 border border-slate-200 rounded text-[9px] font-bold text-primary focus:outline-none appearance-none cursor-pointer pr-6">
                          <option>Pending</option>
                        </select>
                        <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
                        <Download size={14} />
                      </button>
                      {inv.status === 'Pending' && (
                        <button className="p-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50/30 flex items-center justify-between border-t border-slate-50">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Showing 1 to 10 of 10130 entries</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '...', 1012, 1013].map((page, i) => (
              <button key={i} className={cn(
                "w-8 h-8 rounded text-[11px] font-bold transition-all",
                page === 1 ? "bg-primary text-white shadow-md" : "text-slate-400 hover:bg-slate-100"
              )}>
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
