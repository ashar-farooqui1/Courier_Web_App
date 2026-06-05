"use client";

import React from "react";
import { FileOutput, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const DocumentFilter = ({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  type?: string;
}) => (
  <div className="flex-1 min-w-[180px] space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        className="w-full h-10 px-4 bg-white border border-slate-200 rounded-md text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300"
      />
      {type === "date" && (
        <Calendar
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          size={14}
        />
      )}
    </div>
  </div>
);

const TABLE_HEADERS = [
  "AWB ID",
  "Client Name",
  "Booking Date",
  "Customer Contact #",
  "Customer Name",
  "Reference ID",
  "WT",
  "PCS",
  "Amount",
  "Dest.City Name",
  "Status",
];

export default function ClientLoadsheetDocumentView() {
  return (
    <div className="space-y-6 max-w-[1900px] mx-auto animate-in fade-in duration-500 pb-10">
      <h1 className="text-sm font-bold text-slate-700 uppercase tracking-wide">LoadSheet Document</h1>

      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <DocumentFilter label="AWB ID" placeholder="Enter AWB ID" />
          <DocumentFilter label="Date (From)" type="date" placeholder="mm/dd/yyyy" />
          <DocumentFilter label="Date (To)" type="date" placeholder="mm/dd/yyyy" />
          <div className="flex gap-3 ml-auto">
            <Button className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-md gap-2">
              <FileOutput size={14} /> Export
            </Button>
            <Button className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-md gap-2">
              <Trash2 size={14} /> Clear Logs
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex flex-wrap items-center justify-between bg-slate-50/30 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Show</span>
            <select className="h-8 border border-slate-200 rounded px-2 text-xs font-bold text-primary focus:outline-none">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span className="text-[10px] font-bold text-slate-500 uppercase">entries</span>
          </div>

          <div className="flex gap-2">
            <Button className="h-8 px-4 text-[10px] font-bold uppercase bg-primary hover:bg-primary/90 text-white">
              Deselect All
            </Button>
            <Button className="h-8 px-4 text-[10px] font-bold uppercase bg-primary hover:bg-primary/90 text-white">
              Select All
            </Button>
          </div>
        </div>

        <div className="py-4 text-center border-b border-slate-50">
          <h2 className="text-xs font-bold text-sky-500 uppercase tracking-widest">LoadSheet Documents</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/20">
                <th className="p-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-primary" />
                </th>
                {TABLE_HEADERS.map((header) => (
                  <th
                    key={header}
                    className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={TABLE_HEADERS.length + 1} className="py-16 text-center">
                  <p className="text-slate-300 italic text-sm font-medium">No Data</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-50 bg-slate-50/10">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing 0 to 0 of 0 entries
          </span>
        </div>
      </div>
    </div>
  );
}
