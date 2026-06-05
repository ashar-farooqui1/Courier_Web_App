"use client";

import React from "react";
import { useAuthSession } from "@/hooks/useAuthRole";
import { isClientRole } from "@/lib/auth/role";
import { OrderImportView } from "@/components/orders/OrderImportView";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function OrderImportPage() {
  const { role, ready } = useAuthSession();

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    );
  }

  if (!isClientRole(role)) {
    return (
      <div className="max-w-lg mx-auto py-24 space-y-4 text-center">
        <p className="text-sm text-slate-600">Order import is available for client accounts.</p>
        <Link
          href="/orders/details"
          className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Orders
        </Link>
      </div>
    );
  }

  return <OrderImportView />;
}
