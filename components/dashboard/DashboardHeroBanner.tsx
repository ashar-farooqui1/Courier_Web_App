"use client";

import React from "react";

export default function DashboardHeroBanner({
  greetingName,
  totalOrders,
  subtitle,
}: {
  greetingName?: string;
  totalOrders: number;
  subtitle?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary p-8 text-white shadow-lg shadow-primary/20">
      <div className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -right-6 -bottom-24 w-56 h-56 rounded-full bg-white/5" />

      <div className="relative flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">Dashboard</p>
          <h1 className="text-2xl font-black mt-1">Welcome back{greetingName ? `, ${greetingName}` : ""}</h1>
          <p className="text-sm text-white/70 mt-1">
            {subtitle ?? "Here's what's happening with your shipments."}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 rounded-xl px-6 py-4 backdrop-blur-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Total Orders</p>
            <p className="text-3xl font-black">{totalOrders}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
