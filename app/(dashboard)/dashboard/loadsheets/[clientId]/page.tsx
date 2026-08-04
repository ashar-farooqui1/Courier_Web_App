"use client";

import { useParams } from "next/navigation";
import AdminLoadsheetsView from "@/components/loadsheets/AdminLoadsheetsView";

export default function ClientLoadsheetsAdminPage() {
  const params = useParams<{ clientId: string }>();
  const clientId = Number(params.clientId);

  if (!Number.isInteger(clientId) || clientId < 1) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">Invalid client ID</p>
      </div>
    );
  }

  return <AdminLoadsheetsView clientId={clientId} />;
}
