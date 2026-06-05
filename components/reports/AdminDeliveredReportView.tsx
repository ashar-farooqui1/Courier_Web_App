"use client";

import React, { useState, useEffect } from "react";
import { FileOutput, ChevronDown, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function AdminDeliveredReportView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const tableHeaders = [
    "AWB ID",
    "Order ID",
    "Client Name",
    "Customer Name",
    "Customer Number",
    "Destination",
    "Amount",
    "Delivery Date",
    "Delivered By",
    "Status",
    "Action",
  ];

  useEffect(() => {
    const fakeData = Array(10)
      .fill(null)
      .map((_, i) => ({
        awbId: `STX${1000 + i}`,
        orderId: `ORD-${5000 + i}`,
        clientName: "Saeed Ghani",
        customerName: "Ahmed Ali",
        customerNumber: "03001234567",
        destination: "Karachi",
        amount: "Rs. 1,500",
        deliveryDate: "2026-04-29 14:30",
        deliveredBy: "Rider Hassan",
        status: "Delivered",
      }));
    setData(fakeData);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6 max-w-[1900px] mx-auto animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Delivered Orders Report</h1>
        <Button className="h-10 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 gap-2 px-6">
          <FileOutput size={14} /> Export
        </Button>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ReportFilter label="Date (From)" type="date" value="2026-04-28" />
          <ReportFilter label="Date (To)" type="date" value="2026-04-29" />
          <ReportFilter label="Client Name" placeholder="Select Client" type="select" />
          <ReportFilter label="City" placeholder="Select City" type="select" />
        </div>
        <div className="flex justify-start">
          <Button className="h-12 px-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95">
            View Report
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between bg-slate-50/30 gap-4">
          <div className="flex items-center gap-6">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Delivered List</h3>
            <div className="flex items-center gap-2 border-l pl-6 border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Show</span>
              <select className="h-9 border border-slate-200 rounded px-3 text-xs font-bold text-primary">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span className="text-[10px] font-bold text-slate-500 uppercase">entries</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button className="h-9 px-4 text-[10px] font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-white">
                Select All
              </Button>
              <Button className="h-9 px-4 text-[10px] font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-white">
                Deselect All
              </Button>
            </div>
            <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Search:</span>
              <input
                type="text"
                className="h-9 border border-slate-200 rounded-lg px-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 w-64 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/20">
                <th className="p-4 w-10">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary" />
                </th>
                {tableHeaders.map((header) => (
                  <th
                    key={header}
                    className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={12} className="p-32 text-center text-slate-400 font-bold animate-pulse">
                    Loading Data...
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary" />
                    </td>
                    <td className="p-4 text-[11px] font-black text-primary hover:underline cursor-pointer">{item.awbId}</td>
                    <td className="p-4 text-[11px] font-bold text-slate-700">{item.orderId}</td>
                    <td className="p-4 text-[11px] font-bold text-slate-700">{item.clientName}</td>
                    <td className="p-4 text-[11px] text-slate-600 font-medium">{item.customerName}</td>
                    <td className="p-4 text-[11px] text-slate-600">{item.customerNumber}</td>
                    <td className="p-4 text-[11px] font-black text-slate-700">{item.destination}</td>
                    <td className="p-4 text-[11px] font-black text-primary">{item.amount}</td>
                    <td className="p-4 text-[11px] text-slate-500 whitespace-nowrap">{item.deliveryDate}</td>
                    <td className="p-4 text-[11px] text-slate-600">{item.deliveredBy}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-wider">
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
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-50 flex flex-wrap justify-between items-center bg-slate-50/10 gap-4">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Showing 1 to 10 of 45 entries
          </span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded-md bg-primary text-white text-[11px] font-black">1</button>
            <button className="px-3 py-1.5 rounded-md text-slate-400 text-[11px] font-black hover:bg-slate-100 transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 rounded-md text-slate-400 text-[11px] font-black hover:bg-slate-100 transition-colors">
              3
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
