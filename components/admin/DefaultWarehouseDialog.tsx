"use client";

import React, { useEffect, useState } from "react";
import { AppDialog, DialogBody, DialogError, DialogLoading } from "@/components/ui/AppDialog";
import type { Warehouse } from "@/lib/types/warehouse";

const selectClass =
  "w-full h-11 px-4 bg-white border border-primary/40 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all";

interface DefaultWarehouseDialogProps {
  isOpen: boolean;
  adminName: string;
  onConfirm: (warehouse: Warehouse) => void;
}

export function DefaultWarehouseDialog({
  isOpen,
  adminName,
  onConfirm,
}: DefaultWarehouseDialogProps) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | "">("");

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError(null);
    setSelectedId("");

    fetch("/api/warehouses")
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.message ?? `Failed to load warehouses (${response.status})`);
        }
        const data: Warehouse[] = await response.json();
        setWarehouses(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setWarehouses([]);
        setError(err instanceof Error ? err.message : "Failed to load warehouses");
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleConfirm = () => {
    const warehouse = warehouses.find((w) => w.warehouseId === selectedId);
    if (!warehouse) return;
    onConfirm(warehouse);
  };

  return (
    <AppDialog
      isOpen={isOpen}
      onClose={() => {}}
      title={`Hi ${adminName}`}
      titleId="default-warehouse-title"
      maxWidth="md"
      disableClose
      footer={
        !loading ? (
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedId}
            className="h-10 px-8 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Continue
          </button>
        ) : undefined
      }
    >
      {loading ? (
        <DialogLoading message="Loading warehouses…" />
      ) : (
        <DialogBody>
          {error && <DialogError message={error} />}
          <p className="text-sm font-bold text-primary">Please Set Default Warehouse!</p>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Warehouse
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className={selectClass}
            >
              <option value="">--select--</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.warehouseId} value={warehouse.warehouseId}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
        </DialogBody>
      )}
    </AppDialog>
  );
}
