"use client";

import React from "react";
import { useAuthSession } from "@/hooks/useAuthRole";
import { isClientRole } from "@/lib/auth/role";
import ClientSettlementView from "@/components/settlement/ClientSettlementView";
import AdminClientSettlementView from "@/components/settlement/AdminClientSettlementView";

export default function ClientSettlementPage() {
  const { role, ready } = useAuthSession();

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-400">Loading settlement...</p>
      </div>
    );
  }

  if (isClientRole(role)) {
    return <ClientSettlementView />;
  }

  return <AdminClientSettlementView />;
}
