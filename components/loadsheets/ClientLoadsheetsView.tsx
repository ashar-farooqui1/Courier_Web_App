"use client";

import LoadsheetsView from "@/components/loadsheets/LoadsheetsView";
import { useAuthSession } from "@/hooks/useAuthRole";

export default function ClientLoadsheetsView() {
  const { clientId, ready } = useAuthSession();

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    );
  }

  return <LoadsheetsView clientId={clientId} />;
}
