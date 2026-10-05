"use client";

import React, { useEffect, useState } from "react";
import {
  AppDialog,
  DialogBody,
  DialogError,
  DialogFormFooter,
} from "@/components/ui/AppDialog";
import { dialogInputClass, dialogLabelClass } from "@/components/ui/dialog-styles";
import { isSaleManagerAdmin } from "@/lib/admin/sale-manager";
import { buildAppAuthHeaders } from "@/lib/api/app-request-context";
import { parseApiErrorMessage } from "@/lib/api/errors";
import { useAuthSession } from "@/hooks/useAuthRole";
import type { Admin } from "@/types/admin";
import type { Client } from "@/lib/types/client";

interface AssignClientDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string, adminId: number) => void;
}

const FORM_ID = "assign-client-form";

export function AssignClientDialog({
  client,
  isOpen,
  onClose,
  onSuccess,
}: AssignClientDialogProps) {
  const { role, user, token } = useAuthSession();
  const [saleManagers, setSaleManagers] = useState<Admin[]>([]);
  const [adminId, setAdminId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !client) return;

    setAdminId(client.salesPersonId ? String(client.salesPersonId) : "");
    setError(null);
    setSubmitting(false);
    setLoading(true);

    fetch("/api/admin")
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? body.message ?? "Failed to load sale managers");
        }
        const data: Admin[] = await response.json();
        const managers = (Array.isArray(data) ? data : []).filter(isSaleManagerAdmin);
        setSaleManagers(managers);
        setAdminId((current) => {
          const selected = current || (client.salesPersonId ? String(client.salesPersonId) : "");
          return managers.some((manager) => String(manager.adminId) === selected) ? selected : "";
        });
      })
      .catch(() => {
        setSaleManagers([]);
        setError("Failed to load sale managers");
      })
      .finally(() => setLoading(false));
  }, [isOpen, client]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!client) return;

    const selectedAdminId = Number(adminId);
    if (!Number.isInteger(selectedAdminId) || selectedAdminId < 1) {
      setError("Select a Sale Manager.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/assign-client", {
        method: "POST",
        headers: buildAppAuthHeaders(token, role, user?.userId ?? 0, {
          "Content-Type": "application/json",
        }, user?.roleId),
        body: JSON.stringify({
          adminId: selectedAdminId,
          clientId: client.clientId,
        }),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(parseApiErrorMessage(body, `Assign failed (${response.status})`));
      }

      const message =
        typeof body.message === "string" && body.message
          ? body.message
          : "Client assigned successfully";
      onSuccess(message, selectedAdminId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign client");
    } finally {
      setSubmitting(false);
    }
  };

  const clientLabel =
    client?.clientName?.trim() ||
    client?.brandName?.trim() ||
    (client ? `#${client.clientId}` : "");

  return (
    <AppDialog
      isOpen={isOpen && client !== null}
      onClose={onClose}
      title="Assign Client"
      titleId="assign-client-title"
      maxWidth="lg"
      disableClose={submitting}
      footer={
        <DialogFormFooter
          onCancel={onClose}
          submitLabel="Assign"
          submittingLabel="Assigning…"
          submitting={submitting || loading}
          formId={FORM_ID}
        />
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
        <DialogBody>
          {error && <DialogError message={error} />}
          <p className="text-xs font-medium text-slate-600">
            Assign <span className="font-bold text-slate-800">{clientLabel}</span> to a Sale Manager.
          </p>
          <div className="space-y-1">
            <label className={dialogLabelClass} htmlFor="assign-sale-manager">
              Sale Manager <span className="text-red-500">*</span>
            </label>
            <select
              id="assign-sale-manager"
              value={adminId}
              onChange={(event) => setAdminId(event.target.value)}
              className={dialogInputClass}
              required
              disabled={loading || submitting}
            >
              <option value="">{loading ? "Loading sale managers…" : "Select Sale Manager"}</option>
              {saleManagers.map((manager) => (
                <option key={manager.adminId} value={manager.adminId}>
                  {manager.adminName.trim()}
                  {manager.designation ? ` (${manager.designation})` : ""}
                </option>
              ))}
            </select>
          </div>
        </DialogBody>
      </form>
    </AppDialog>
  );
}
