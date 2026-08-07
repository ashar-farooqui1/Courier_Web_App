"use client";

import React, { useEffect, useState } from "react";
import { AppDialog, DialogBody, DialogError, DialogLoading } from "@/components/ui/AppDialog";
import type { Warehouse } from "@/lib/types/warehouse";

const selectClass =
  "w-full h-11 px-4 bg-white border border-primary/40 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all";

interface DefaultWarehouseDialogProps {
  isOpen: boolean;
  adminName: string;
  warehouses: Warehouse[];
  loading?: boolean;
  error?: string | null;
  onConfirm: (warehouse: Warehouse) => void;
}

export function DefaultWarehouseDialog({
  isOpen,
  adminName,
  warehouses,
  loading = false,
  error,
  onConfirm,
}: DefaultWarehouseDialogProps) {
  const [selectedId, setSelectedId] = useState<number | "">("");

  useEffect(() => {
    if (!isOpen) return;
    setSelectedId("");
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
          {!error && warehouses.length === 0 ? (
            <DialogError message="No warehouse is assigned to your account. Please contact an administrator." />
          ) : (
            <>
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
            </>
          )}
        </DialogBody>
      )}
    </AppDialog>
  );
}
