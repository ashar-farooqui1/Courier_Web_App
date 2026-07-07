"use client";

import React from "react";
import { useAuthSession } from "@/hooks/useAuthRole";
import { isAdminRole, isClientRole } from "@/lib/auth/role";
import ClientOrdersView from "@/components/orders/ClientOrdersView";
import AdminOrdersView from "@/components/orders/AdminOrdersView";

export default function OrderDetailsPage() {
  const { role, ready } = useAuthSession();

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-400">Loading orders...</p>
      </div>
    );
  }

  if (isAdminRole(role)) {
    return <AdminOrdersView />;
  }

  if (isClientRole(role)) {
    return <ClientOrdersView />;
  }

  return (
    <div className="flex items-center justify-center py-24">
      <p className="text-sm text-slate-400">Unable to load orders for this account.</p>
    </div>
  );
}
