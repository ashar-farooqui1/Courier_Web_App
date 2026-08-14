"use client";

import { useParams } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthRole";
import { isClientRole } from "@/lib/auth/role";
import { RollcartView } from "@/components/documents/RollcartView";

export default function RollcartViewPage() {
  const params = useParams<{ number: string }>();
  const sheetId = Number(params.number);
  const { token, role, user, clientId, ready } = useAuthSession();

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!Number.isInteger(sheetId) || sheetId < 1) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">Invalid delivery sheet id</p>
      </div>
    );
  }

  return (
    <RollcartView
      sheetId={sheetId}
      backHref="/documents/rollcarts"
      token={token}
      role={role}
      userId={isClientRole(role) ? clientId : user?.userId ?? 0}
      roleId={user?.roleId ?? 0}
    />
  );
}
