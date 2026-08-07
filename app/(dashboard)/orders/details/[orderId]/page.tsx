"use client";

import { useParams } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthRole";
import { isClientRole } from "@/lib/auth/role";
import { OrderDetailView } from "@/components/orders/OrderDetailView";

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = Number(params.orderId);
  const { token, role, user, clientId, ready } = useAuthSession();

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!Number.isInteger(orderId) || orderId < 1) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">Invalid order ID</p>
      </div>
    );
  }

  return (
    <OrderDetailView
      orderId={orderId}
      backHref="/orders/details"
      token={token}
      role={role}
      userId={isClientRole(role) ? clientId : user?.userId ?? 0}
      roleId={user?.roleId ?? 0}
    />
  );
}
