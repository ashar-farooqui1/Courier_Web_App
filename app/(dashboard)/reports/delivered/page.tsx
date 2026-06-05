"use client";

import React from "react";
import { useAuthSession } from "@/hooks/useAuthRole";
import { isClientRole } from "@/lib/auth/role";
import ClientDeliveredReportView from "@/components/reports/ClientDeliveredReportView";
import AdminDeliveredReportView from "@/components/reports/AdminDeliveredReportView";

export default function DeliveredReportPage() {
  const { role, ready } = useAuthSession();

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-400">Loading report...</p>
      </div>
    );
  }

  if (isClientRole(role)) {
    return <ClientDeliveredReportView />;
  }

  return <AdminDeliveredReportView />;
}
