"use client";

import { useParams } from "next/navigation";
import AdminCreateLoadsheetView from "@/components/loadsheets/AdminCreateLoadsheetView";

export default function ClientCreateLoadsheetAdminPage() {
  const params = useParams<{ clientId: string }>();
  const clientId = Number(params.clientId);

  if (!Number.isInteger(clientId) || clientId < 1) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">Invalid client ID</p>
      </div>
    );
  }

  return <AdminCreateLoadsheetView clientId={clientId} />;
}
