"use client";

import React from "react";
import { useAuthSession } from "@/hooks/useAuthRole";
import { isClientRole } from "@/lib/auth/role";
import ClientOrderStatusReportView from "@/components/reports/ClientOrderStatusReportView";
import AdminOrderStatusReportView from "@/components/reports/AdminOrderStatusReportView";

export default function OrderStatusReportPage() {
  const { role, ready } = useAuthSession();

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-400">Loading report...</p>
      </div>
    );
  }

  if (isClientRole(role)) {
    return <ClientOrderStatusReportView />;
  }

  return <AdminOrderStatusReportView />;
}
