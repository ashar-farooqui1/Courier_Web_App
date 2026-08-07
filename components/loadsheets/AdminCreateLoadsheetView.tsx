"use client";

import { useEffect, useState } from "react";
import CreateLoadsheetView from "@/components/loadsheets/CreateLoadsheetView";
import type { Client } from "@/lib/types/client";

interface AdminCreateLoadsheetViewProps {
  clientId: number;
}

export default function AdminCreateLoadsheetView({ clientId }: AdminCreateLoadsheetViewProps) {
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/clients/${clientId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setClient(data);
      })
      .catch(() => {
        if (!cancelled) setClient(null);
      });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const clientLabel = client ? `${client.clientName} (#${clientId})` : `Client #${clientId}`;

  return (
    <CreateLoadsheetView
      clientId={clientId}
      clientLabel={clientLabel}
      backHref={`/dashboard/loadsheets/${clientId}`}
    />
  );
}
