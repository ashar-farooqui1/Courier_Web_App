"use client";

import CreateLoadsheetView from "@/components/loadsheets/CreateLoadsheetView";
import { useAuthSession } from "@/hooks/useAuthRole";

export default function ClientCreateLoadsheetView() {
  const { clientId, ready } = useAuthSession();

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    );
  }

  return <CreateLoadsheetView clientId={clientId} backHref="/dashboard/loadsheets" />;
}
