"use client";

import { useParams } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthRole";
import { isClientRole } from "@/lib/auth/role";
import { ReturnDocumentView } from "@/components/documents/ReturnDocumentView";

export default function ReturnDocumentViewPage() {
  const params = useParams<{ number: string }>();
  const returnDocumentId = Number(params.number);
  const { token, role, user, clientId, ready } = useAuthSession();

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!Number.isInteger(returnDocumentId) || returnDocumentId < 1) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">Invalid return document id</p>
      </div>
    );
  }

  return (
    <ReturnDocumentView
      returnDocumentId={returnDocumentId}
      backHref="/documents/return/list"
      token={token}
      role={role}
      userId={isClientRole(role) ? clientId : user?.userId ?? 0}
      roleId={user?.roleId ?? 0}
    />
  );
}
