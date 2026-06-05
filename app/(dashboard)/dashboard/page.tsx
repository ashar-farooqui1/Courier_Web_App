"use client";

import React from "react";
import { useAuthSession } from "@/hooks/useAuthRole";
import { isClientRole } from "@/lib/auth/role";
import ClientDashboardView from "@/components/dashboard/ClientDashboardView";
import AdminDashboardView from "@/components/dashboard/AdminDashboardView";

export default function DashboardPage() {
  const { role, ready } = useAuthSession();

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-400">Loading dashboard...</p>
      </div>
    );
  }

  if (isClientRole(role)) {
    return <ClientDashboardView />;
  }

  return <AdminDashboardView />;
}
