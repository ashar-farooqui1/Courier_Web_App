"use client";

import React from "react";
import { useAuthSession } from "@/hooks/useAuthRole";
import { isClientRole } from "@/lib/auth/role";
import AdminLoadsheetsClientList from "@/components/loadsheets/AdminLoadsheetsClientList";
import ClientLoadsheetsView from "@/components/loadsheets/ClientLoadsheetsView";

export default function LoadsheetsPage() {
  const { role, ready } = useAuthSession();

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    );
  }

  if (isClientRole(role)) {
    return <ClientLoadsheetsView />;
  }

  return <AdminLoadsheetsClientList />;
}
