"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FileOutput, ChevronDown, Eye, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function AdminOrderStatusReportView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const tableHeaders = [
    "AWB ID",
    "Order ID",
    "Client",
    "Customer",
    "City",
    "Service",
    "Current Status",
    "Action",
  ];

  useEffect(() => {
    const fakeData = Array(10)
      .fill(null)
      .map((_, i) => ({
        awbId: `STX${5000 + i}`,
        orderId: `ORD-${9000 + i}`,
        client: "Saeed Ghani",
        customer: "Ahmed Ali",
        city: "Karachi",
        service: "COD",
        status: i % 3 === 0 ? "Pending" : i % 3 === 1 ? "In Transit" : "Delivered",
      }));
    setData(fakeData);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Order Status Report</h1>
        <Button className="h-10 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 gap-2">
          <FileOutput size={14} /> Export Report
        </Button>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <ReportFilter label="Start Date" type="date" value="2026-04-01" />
          <ReportFilter label="End Date" type="date" value="2026-04-29" />
          <ReportFilter label="Status" placeholder="Select Status" type="select" />
          <Button className="h-10 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-lg">
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Order Status Summary</h3>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Search:</span>
            <input
              type="text"
              className="h-9 border border-slate-200 rounded-lg px-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/20">
                <th className="p-4">
                  <input type="checkbox" className="rounded border-slate-300" />
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
                  <td colSpan={9} className="p-20 text-center text-slate-400 font-bold animate-pulse">
                    Loading Data...
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-slate-600">
                    <td className="p-4">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className="p-4 text-[10px] font-bold text-primary underline cursor-pointer">{item.awbId}</td>
                    <td className="p-4 text-[10px] font-bold">{item.orderId}</td>
                    <td className="p-4 text-[10px] font-bold">{item.client}</td>
                    <td className="p-4 text-[10px]">{item.customer}</td>
                    <td className="p-4 text-[10px] font-bold">{item.city}</td>
                    <td className="p-4 text-[10px]">{item.service}</td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                          item.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : item.status === "In Transit"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                        )}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button className="p-1.5 bg-primary/10 text-primary rounded hover:bg-primary hover:text-white transition-all">
                          <RefreshCcw size={12} />
                        </button>
                        <button className="p-1.5 bg-primary/10 text-primary rounded hover:bg-primary hover:text-white transition-all">
                          <Eye size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
