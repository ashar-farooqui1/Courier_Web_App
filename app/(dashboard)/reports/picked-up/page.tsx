"use client";

import React from "react";
import { useAuthSession } from "@/hooks/useAuthRole";
import { isClientRole } from "@/lib/auth/role";
import ClientPickedUpReportView from "@/components/reports/ClientPickedUpReportView";
import AdminPickedUpReportView from "@/components/reports/AdminPickedUpReportView";

export default function PickedUpReportPage() {
  const { role, ready } = useAuthSession();

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-400">Loading report...</p>
      </div>
    );
  }

  if (isClientRole(role)) {
    return <ClientPickedUpReportView />;
  }

  return <AdminPickedUpReportView />;
}
