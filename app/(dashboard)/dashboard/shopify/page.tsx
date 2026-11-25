"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, ExternalLink, KeyRound, RefreshCw, ShoppingBag, Trash2 } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthRole";
import { isClientRole } from "@/lib/auth/role";
import { buildAppAuthHeaders } from "@/lib/api/app-request-context";
import { SHOPIFY_APP_URL } from "@/lib/api/config";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";
import type { ShopifyConnection } from "@/lib/types/shopify-integration";

const STATUS_STYLES: Record<string, string> = {
  connected: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  disconnected: "bg-slate-50 text-slate-500 border-slate-200",
  revoked: "bg-red-50 text-red-600 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  connected: "Connected",
  pending: "Waiting for store",
  disconnected: "Disconnected",
  revoked: "Revoked",
};

function formatDate(value: string | null): string {
  if (!value || value.startsWith("0001-")) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

const STEPS = [
  "Click “Generate connection key” below and copy the key. It is shown only once.",
  "Install the Stallionex Courier app on your Shopify store.",
  "Open the app from Shopify admin → Apps → Stallionex Courier and paste the key.",
  "Your Shopify orders now appear in the app; book them and print airway bills from there.",
];

export default function ShopifyIntegrationPage() {
  const { role, user, token, ready } = useAuthSession();
  const [connections, setConnections] = useState<ShopifyConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<ShopifyConnection | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState("");

  const headers = useMemo(
    () => buildAppAuthHeaders(token, role, user?.userId ?? 0),
    [token, role, user?.userId]
  );

  const fetchConnections = useCallback(async (): Promise<ShopifyConnection[]> => {
    const res = await fetch("/api/shopify-integration", { headers });
    const payload = await res.json().catch(() => null);
    if (!res.ok) throw new Error(payload?.message ?? `Failed to load connections (${res.status})`);
    return Array.isArray(payload) ? payload : [];
  }, [headers]);

  const applyResult = useCallback((request: Promise<ShopifyConnection[]>) => {
    return request
      .then((rows) => {
        setConnections(rows);
        setError("");
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load connections"))
      .finally(() => setLoading(false));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    await applyResult(fetchConnections());
  }, [applyResult, fetchConnections]);

  useEffect(() => {
    if (ready && isClientRole(role)) void applyResult(fetchConnections());
  }, [ready, role, applyResult, fetchConnections]);

  const generateKey = async () => {
    setCreating(true);
    setError("");
    setCopied(false);
    try {
      const res = await fetch("/api/shopify-integration/key", { method: "POST", headers });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.message ?? `Failed to create key (${res.status})`);
      setNewKey(payload?.data?.connectionKey ?? null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create key");
    } finally {
      setCreating(false);
    }
  };

  const copyKey = async () => {
    if (!newKey) return;
    try {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const confirmRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    setRevokeError("");
    try {
      const res = await fetch(
        `/api/shopify-integration/${revokeTarget.shopifyConnectionId}/revoke`,
        { method: "POST", headers }
      );
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.message ?? `Failed to revoke (${res.status})`);
      setRevokeTarget(null);
      await load();
    } catch (e) {
      setRevokeError(e instanceof Error ? e.message : "Failed to revoke");
    } finally {
      setRevoking(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!isClientRole(role)) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate-500">Shopify integration is available to client accounts only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white rounded shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-[#95BF47]/15 text-[#5E8E3E] flex items-center justify-center">
            <ShoppingBag size={26} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Shopify Integration</h1>
            <p className="text-xs text-slate-500">
              Connect your Shopify store to book Stallionex shipments directly from Shopify orders.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={SHOPIFY_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-4 border border-slate-200 text-slate-600 text-xs font-bold rounded flex items-center gap-2 hover:bg-slate-50"
          >
            <ExternalLink size={14} /> Install Shopify app
          </a>
          <button
            onClick={generateKey}
            disabled={creating}
            className="h-10 px-4 bg-primary text-white text-xs font-bold rounded flex items-center gap-2 shadow-sm hover:bg-primary/90 disabled:opacity-60"
          >
            <KeyRound size={14} /> {creating ? "Generating..." : "Generate connection key"}
          </button>
        </div>
      </div>

      {/* One-time key */}
      {newKey && (
        <div className="bg-emerald-50 border border-emerald-200 rounded p-5 space-y-3">
          <p className="text-sm font-bold text-emerald-800">Your new connection key</p>
          <p className="text-xs text-emerald-700">
            Copy it now and paste it in the Stallionex Courier app inside Shopify. For security it will not be shown again.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <code className="flex-1 bg-white border border-emerald-200 rounded px-3 py-2 text-xs font-mono break-all text-slate-700">
              {newKey}
            </code>
            <button
              onClick={copyKey}
              className="h-10 px-4 bg-emerald-600 text-white text-xs font-bold rounded flex items-center justify-center gap-2 hover:bg-emerald-700"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <button onClick={() => setNewKey(null)} className="text-[11px] font-bold text-emerald-700 underline">
            I have copied it, hide key
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded p-3">{error}</div>
      )}

      {/* How it works */}
      <div className="bg-white rounded shadow-sm border border-slate-100 p-6">
        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">How to connect</h2>
        <ol className="grid gap-3 md:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={i} className="flex gap-3 text-xs text-slate-600">
              <span className="h-6 w-6 shrink-0 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Connections */}
      <div className="bg-white rounded shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Connected stores & keys</h2>
          <button
            onClick={() => void load()}
            disabled={loading}
            className="text-slate-400 hover:text-primary disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw size={16} className={cn(loading && "animate-spin")} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                {["Store", "Key", "Status", "Created", "Connected", "Last used", "Action"].map((h) => (
                  <th key={h} className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[11px] font-medium text-slate-600">
              {!loading && connections.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No keys yet. Generate a connection key to connect your Shopify store.
                  </td>
                </tr>
              )}
              {connections.map((c) => {
                const canRevoke = c.status === "pending" || c.status === "connected";
                return (
                  <tr key={c.shopifyConnectionId} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-700">{c.shopDomain ?? "—"}</td>
                    <td className="p-4 font-mono text-slate-400">{c.keyPrefix}…</td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "px-2 py-1 rounded border text-[10px] font-bold whitespace-nowrap",
                          STATUS_STYLES[c.status] ?? STATUS_STYLES.disconnected
                        )}
                      >
                        {STATUS_LABELS[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                    <td className="p-4 whitespace-nowrap">{formatDate(c.connectedAt)}</td>
                    <td className="p-4 whitespace-nowrap">{formatDate(c.lastUsedAt)}</td>
                    <td className="p-4">
                      {canRevoke ? (
                        <button
                          onClick={() => {
                            setRevokeError("");
                            setRevokeTarget(c);
                          }}
                          className="h-8 px-3 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold rounded flex items-center gap-1 hover:bg-red-100"
                        >
                          <Trash2 size={12} /> Revoke
                        </button>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={revokeTarget !== null}
        onClose={() => !revoking && setRevokeTarget(null)}
        onConfirm={confirmRevoke}
        title="Revoke connection"
        message={
          revokeTarget?.shopDomain
            ? `Disconnect ${revokeTarget.shopDomain} from Stallionex?`
            : "Revoke this unused connection key?"
        }
        description="The store will no longer be able to book shipments with this key. To reconnect, generate a new key."
        error={revokeError}
        confirmLabel="Revoke"
        cancelLabel="Cancel"
        loading={revoking}
      />
    </div>
  );
}
