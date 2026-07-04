"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";
import { dialogInputClass, dialogLabelClass } from "@/components/ui/dialog-styles";
import type { DeliveryChargeSlab } from "@/lib/types/onboard-client";

interface ChargeSlabEditorProps {
  title: string;
  slabs: DeliveryChargeSlab[];
  onChange: (slabs: DeliveryChargeSlab[]) => void;
}

export function ChargeSlabEditor({ title, slabs, onChange }: ChargeSlabEditorProps) {
  const updateSlab = (index: number, field: keyof DeliveryChargeSlab, value: string) => {
    onChange(
      slabs.map((slab, i) =>
        i === index
          ? { ...slab, [field]: field === "weight" || field === "charges" ? Number(value) || 0 : value }
          : slab
      )
    );
  };

  const addSlab = () => {
    onChange([...slabs, { weight: 0, charges: 0 }]);
  };

  const removeSlab = (index: number) => {
    if (slabs.length <= 1) return;
    onChange(slabs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{title}</p>
      <div className="space-y-2">
        {slabs.map((slab, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-1 space-y-1">
              <label className={dialogLabelClass}>Weight</label>
              <input
                type="number"
                step="0.1"
                min={0}
                value={slab.weight}
                onChange={(e) => updateSlab(index, "weight", e.target.value)}
                className={dialogInputClass}
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className={dialogLabelClass}>Charges</label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={slab.charges}
                onChange={(e) => updateSlab(index, "charges", e.target.value)}
                className={dialogInputClass}
              />
            </div>
            <div className="flex items-end gap-1 pt-5">
              <button
                type="button"
                onClick={addSlab}
                className="h-9 w-9 bg-primary text-white rounded flex items-center justify-center hover:bg-primary/90"
                aria-label="Add charge row"
              >
                <Plus size={14} />
              </button>
              <button
                type="button"
                onClick={() => removeSlab(index)}
                disabled={slabs.length <= 1}
                className="h-9 w-9 bg-primary text-white rounded flex items-center justify-center hover:bg-primary/90 disabled:opacity-40"
                aria-label="Remove charge row"
              >
                <Minus size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
