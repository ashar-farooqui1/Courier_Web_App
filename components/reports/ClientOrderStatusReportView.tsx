"use client";

import React from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const ReportFilter = ({
  label,
  placeholder,
  type = "text",
  value = "",
  options,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
  options?: { value: string; label: string }[];
}) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative">
      {type === "select" ? (
        <>
          <select
            defaultValue={value}
            className="w-full h-10 px-4 bg-white border border-slate-200 rounded-md text-xs font-bold text-primary appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20"
          >
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            )) ?? <option value="">{placeholder}</option>}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={14}
          />
        </>
      ) : (
        <>
          <input
            type={type}
            defaultValue={value}
            placeholder={placeholder}
            className="w-full h-10 px-4 bg-white border border-slate-200 rounded-md text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-slate-300"
          />
          {type === "date" && (
            <Calendar
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={14}
            />
          )}
        </>
      )}
    </div>
  </div>
);

export default function ClientOrderStatusReportView() {
  return (
    <div className="space-y-4 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <h1 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Order Status Report</h1>

      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ReportFilter
            label="Email (Report Receiving)"
            type="email"
            value="e2ztechservices@gmail.com"
          />
          <ReportFilter
            label="Date Filter On"
            type="select"
            value="pickup"
            options={[
              { value: "pickup", label: "Pickup Date" },
              { value: "booking", label: "Booking Date" },
              { value: "delivery", label: "Delivery Date" },
            ]}
          />
          <ReportFilter label="Date (From)" type="date" value="2026-06-01" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ReportFilter label="Date (To)" type="date" value="2026-06-03" />
          <ReportFilter label="Status" placeholder="Select Status" type="select" />
          <ReportFilter label="City" placeholder="Select City" type="select" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <Button className="h-10 w-full bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-md">
            Show Table
          </Button>
          <Button className="h-10 w-full bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-md">
            Show Statuses
          </Button>
          <Button className="h-10 w-full bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-md">
            Export Report
          </Button>
          <Button className="h-10 w-full bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-md">
            Export Report All
          </Button>
        </div>
      </div>
    </div>
  );
}
