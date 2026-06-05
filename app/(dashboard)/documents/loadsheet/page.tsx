"use client";

import React from "react";
import { useAuthSession } from "@/hooks/useAuthRole";
import { isClientRole } from "@/lib/auth/role";
import ClientLoadsheetDocumentView from "@/components/documents/ClientLoadsheetDocumentView";
import AdminLoadsheetDocumentView from "@/components/documents/AdminLoadsheetDocumentView";

export default function LoadsheetDocumentPage() {
  const { role, ready } = useAuthSession();

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    );
  }

  if (isClientRole(role)) {
    return <ClientLoadsheetDocumentView />;
  }

  return <AdminLoadsheetDocumentView />;
}
