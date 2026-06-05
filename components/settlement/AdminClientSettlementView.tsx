"use client";

import React from "react";
import { Calendar, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const TABLE_HEADERS = [
  "Date",
  "Client ID",
  "Client",
  "Transaction No.",
  "Settlement Amount",
  "Income TAX",
  "Withholding TAX",
  "Transport Amount",
  "Fuel Surcharge Amount",
  "Additional Amount",
  "Invoice Charges",
  "Total Orders",
  "Delivered Orders",
  "Return Orders",
  "Print",
];

const FilterField = ({
  label,
  type = "text",
  value,
  placeholder,
}: {
  label: string;
  type?: string;
  value?: string;
  placeholder?: string;
}) => (
  <div className="space-y-1">
    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="w-full h-9 px-3 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-slate-300"
      />
      {type === "date" && (
        <Calendar
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          size={12}
        />
      )}
    </div>
  </div>
);

export default function AdminClientSettlementView() {
  return (
    <div className="space-y-4 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Client Settlement</h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Show</span>
            <div className="relative">
              <select className="h-8 border border-slate-200 rounded pl-2 pr-7 text-xs font-bold text-primary appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20">
                <option>10</option>
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={12}
              />
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">entries</span>
          </div>

          <div className="w-full sm:w-48">
            <FilterField label="Client" placeholder="Select Client" />
          </div>
          <div className="w-full sm:w-64">
            <FilterField label="Settlement ID" placeholder="Enter Settlement ID" />
          </div>
        </div>

        <div className="p-6 border-b border-slate-50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Tracking ID
              </label>
              <textarea
                placeholder="Enter Tracking ID"
                rows={5}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-slate-300 resize-none"
              />
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
              <FilterField label="From Date" type="date" value="2026-06-02" />
              <FilterField label="To Date" type="date" value="2026-06-03" />

              <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-1">
                <Button className="flex-1 h-10 font-bold bg-primary text-white shadow-md">Search</Button>
                <button
                  type="button"
                  className="h-10 w-full sm:w-12 flex items-center justify-center bg-primary text-white rounded-md shadow-md hover:bg-primary/90 transition-colors"
                  aria-label="Download"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                {TABLE_HEADERS.map((header) => (
                  <th
                    key={header}
                    className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={TABLE_HEADERS.length} className="py-20 text-center">
                  <p className="text-slate-300 italic text-sm font-medium">No Data</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50/30 border-t border-slate-50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing 0 to 0 of 0 entries
          </p>
        </div>
      </div>
    </div>
  );
}
