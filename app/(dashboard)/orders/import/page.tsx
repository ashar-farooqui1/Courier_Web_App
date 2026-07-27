"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthRole";
import { isAdminRole, isClientRole } from "@/lib/auth/role";
import { OrderImportView } from "@/components/orders/OrderImportView";
import { ArrowLeft } from "lucide-react";

function BackToOrdersLink() {
  return (
    <Link
      href="/orders/details"
      className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
    >
      <ArrowLeft size={14} />
      Back to Orders
    </Link>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-24">
      <p className="text-sm text-slate-400">Loading…</p>
    </div>
  );
}

function AdminOrderImport() {
  const searchParams = useSearchParams();
  const clientId = Number(searchParams.get("clientId"));
  const clientLabel = searchParams.get("clientName") ?? "";

  if (!Number.isInteger(clientId) || clientId < 1) {
    return (
      <div className="max-w-lg mx-auto py-24 space-y-4 text-center">
        <p className="text-sm text-slate-600">
          Select a client from the Import action on the Orders page first.
        </p>
        <BackToOrdersLink />
      </div>
    );
  }

  return <OrderImportView variant="admin" adminClientId={clientId} adminClientLabel={clientLabel} />;
}

export default function OrderImportPage() {
  const { role, ready } = useAuthSession();

  if (!ready) {
    return <LoadingState />;
  }

  if (isAdminRole(role)) {
    return (
      <Suspense fallback={<LoadingState />}>
        <AdminOrderImport />
      </Suspense>
    );
  }

  if (!isClientRole(role)) {
    return (
      <div className="max-w-lg mx-auto py-24 space-y-4 text-center">
        <p className="text-sm text-slate-600">Order import is available for client accounts.</p>
        <BackToOrdersLink />
      </div>
    );
  }

  return <OrderImportView />;
}
