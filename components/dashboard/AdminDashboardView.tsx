"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Calendar, Download } from "lucide-react";

const FilterField = ({
  label,
  placeholder,
  type = "text",
  value = "",
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
}) => (
  <div className="flex-1 min-w-[200px] space-y-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="w-full h-10 px-4 bg-white border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-300"
      />
      {type === "date" && (
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
      )}
    </div>
  </div>
);

const SelectField = ({ label, placeholder }: { label: string; placeholder: string }) => (
  <div className="flex-1 min-w-[200px] space-y-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <select className="w-full h-10 px-4 bg-white border border-slate-200 rounded-md text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all">
        <option value="">{placeholder}</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
    </div>
  </div>
);

const StatusCard = ({
  label,
  value,
  colorClass,
  active,
  onClick,
}: {
  label: string;
  value: number;
  colorClass: string;
  active: boolean;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center p-6 rounded-lg text-white shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer min-h-[120px]",
      colorClass,
      active && "ring-4 ring-primary ring-offset-2 scale-[1.05] z-10"
    )}
  >
    <span className="text-xs font-bold uppercase tracking-widest mb-2 opacity-90">{label}</span>
    <span className="text-4xl font-black">{value}</span>
  </div>
);

export default function AdminDashboardView() {
  const [selectedStatus, setSelectedStatus] = useState<string | null>("Booking");

  const stats = [
    { label: "Total", value: 0, color: "bg-slate-500" },
    { label: "Booking", value: 0, color: "bg-yellow-400" },
    { label: "Picked", value: 0, color: "bg-[#002B5B]" },
    { label: "In Transit", value: 0, color: "bg-slate-500" },
    { label: "Out for Delivery", value: 0, color: "bg-blue-500" },
    { label: "Shipper Advise", value: 0, color: "bg-cyan-500" },
    { label: "Delivered", value: 0, color: "bg-green-400" },
    { label: "Return In Transit", value: 0, color: "bg-orange-400" },
    { label: "Returned", value: 0, color: "bg-slate-700" },
    { label: "Payment Settled", value: 0, color: "bg-green-600" },
    { label: "Cancelled", value: 0, color: "bg-red-500" },
  ];

  const tableHeaders = [
    "CN",
    "Origin",
    "Destination",
    "Client",
    "Customer Name",
    "Phone Number",
    "COD Amount",
    "Last Status",
    "Booking Date",
    "Pickup Date",
    "Last Status Date",
    "Payment Date",
    "Shipper Advise",
    "Transaction No",
    "Support Ticket",
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SelectField label="Filter By" placeholder="Booking Date" />
          <FilterField label="From" placeholder="" type="date" value="2026-04-01" />
          <FilterField label="To" placeholder="" type="date" value="2026-04-29" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FilterField label="Client" placeholder="Select Client" />
          <FilterField label="Origin" placeholder="Origin" />
          <FilterField label="Destination" placeholder="Destination" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {stats.map((stat) => (
          <StatusCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            colorClass={stat.color}
            active={selectedStatus === stat.label}
            onClick={() => setSelectedStatus(stat.label)}
          />
        ))}
      </div>

      {selectedStatus && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="p-8 border-b border-slate-50 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Show</span>
                  <select className="h-9 border border-slate-200 rounded px-2 text-xs font-bold text-primary">
                    <option>50</option>
                    <option>100</option>
                  </select>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">entries</span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-600 flex items-center gap-2">
                <span className="text-emerald-500">{selectedStatus}</span> Shipments Details
              </h2>

              <button className="h-10 px-6 bg-emerald-500 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                <Download size={16} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/30">
                  {tableHeaders.map((header) => (
                    <th
                      key={header}
                      className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-slate-50">
                  {tableHeaders.map((header) => (
                    <td key={header} className="p-2">
                      {header.includes("Date") ? (
                        <input
                          type="date"
                          className="w-full h-8 px-2 border border-slate-100 rounded text-[10px] font-bold text-primary focus:outline-none appearance-none"
                        />
                      ) : (
                        <input
                          type="text"
                          className="w-full h-8 px-2 border border-slate-100 rounded text-[10px] font-bold text-primary focus:outline-none"
                        />
                      )}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={tableHeaders.length} className="py-12 text-center">
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
      )}
    </div>
  );
}
