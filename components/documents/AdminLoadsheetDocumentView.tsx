"use client";

import React, { useState, useEffect } from "react";
import { FileOutput, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const DocumentFilter = ({ label, placeholder, type = "text", value = "" }: any) => (
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

export default function AdminLoadsheetDocumentView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const tableHeaders = [
    "AWB ID",
    "Client Name",
    "Booking Date",
    "Customer Contact #",
    "Customer Name",
    "Reference ID",
    "WT",
    "PCS",
    "Amount",
    "Dest. City Name",
    "Status",
  ];

  useEffect(() => {
    setTimeout(() => {
      setData([]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="space-y-6 max-w-[1900px] mx-auto animate-in fade-in duration-500 pb-10">
      <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">LoadSheet Document</h1>

      <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm space-y-8">
        <div className="flex flex-wrap items-end gap-6">
          <DocumentFilter label="AWB ID" placeholder="Enter AWB ID" />
          <DocumentFilter label="Client Name" placeholder="Select Name" type="select" />
          <DocumentFilter label="Date (From)" type="date" />
          <DocumentFilter label="Date (To)" type="date" />

          <div className="flex gap-3">
            <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 gap-2">
              <FileOutput size={14} /> Export
            </Button>
            <Button
              variant="outline"
              className="h-12 px-8 border-slate-200 text-slate-500 hover:bg-slate-50 font-black uppercase tracking-widest gap-2"
            >
              <Trash2 size={14} /> Clear Logs
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between bg-slate-50/30 gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Show</span>
              <select className="h-9 border border-slate-200 rounded px-3 text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary/20">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span className="text-[10px] font-bold text-slate-500 uppercase">entries</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-9 px-6 text-[10px] font-black uppercase tracking-wider border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              Deselect All
            </Button>
            <Button className="h-9 px-6 text-[10px] font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-white">
              Select All
            </Button>
          </div>
        </div>

        <div className="py-4 text-center border-b border-slate-50">
          <h2 className="text-xs font-bold text-primary uppercase tracking-widest opacity-60">LoadSheet Documents</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/20">
                {tableHeaders.map((header) => (
                  <th
                    key={header}
                    className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={11} className="p-32 text-center text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">
                    Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-10 text-center text-slate-300 font-medium text-[11px] uppercase tracking-widest">
                    No Data Available
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-50 bg-slate-50/10">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Showing 0 to 0 of 0 entries
          </span>
        </div>
      </div>
    </div>
  );
}
