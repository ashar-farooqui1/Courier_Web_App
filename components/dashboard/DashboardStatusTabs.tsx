"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface DashboardStatusTab {
  label: string;
  value: number;
  disabled?: boolean;
}

export default function DashboardStatusTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: DashboardStatusTab[];
  active: string | null;
  onChange: (label: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-2 flex flex-wrap gap-1">
      {tabs.map((tab) => {
        const isActive = active === tab.label && !tab.disabled;
        return (
          <button
            key={tab.label}
            type="button"
            disabled={tab.disabled}
            onClick={() => onChange(tab.label)}
            title={tab.disabled ? "Not tracked yet" : undefined}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all",
              tab.disabled
                ? "opacity-40 cursor-not-allowed text-slate-400"
                : isActive
                  ? "bg-primary text-white shadow-md cursor-pointer"
                  : "text-slate-500 hover:bg-slate-50 cursor-pointer"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "min-w-[22px] px-1.5 py-0.5 rounded-full text-center text-[10px] font-black",
                isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              )}
            >
              {tab.value}
            </span>
          </button>
        );
      })}
    </div>
  );
}
