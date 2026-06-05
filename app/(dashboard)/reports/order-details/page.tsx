"use client";

import React from "react";
import { useAuthSession } from "@/hooks/useAuthRole";
import { isClientRole } from "@/lib/auth/role";
import ClientOrderDetailsReportView from "@/components/reports/ClientOrderDetailsReportView";
import AdminOrderDetailsReportView from "@/components/reports/AdminOrderDetailsReportView";

export default function OrderDetailsReportPage() {
  const { role, ready } = useAuthSession();

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-400">Loading report...</p>
      </div>
    );
  }

  if (isClientRole(role)) {
    return <ClientOrderDetailsReportView />;
  }

  return <AdminOrderDetailsReportView />;
}
