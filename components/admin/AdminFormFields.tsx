"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  dialogFileInputClass,
  dialogInputClass,
  dialogLabelClass,
} from "@/components/ui/dialog-styles";
import type { Role } from "@/types/role";
import type { Warehouse } from "@/lib/types/warehouse";

export interface AdminFormValues {
  adminName: string;
  cnic: string;
  contactNumber: string;
  adminEmail: string;
  designation: string;
  roleId: string;
}

interface AdminFormFieldsProps {
  values: AdminFormValues;
  onChange: (field: keyof AdminFormValues, value: string) => void;
  adminImage: File | null;
  onImageChange: (file: File | null) => void;
  showRole?: boolean;
  roles?: Role[];
  loadingRoles?: boolean;
  existingImageUrl?: string | null;
  existingImageAlt?: string;
  showWarehouses?: boolean;
  warehouses?: Warehouse[];
  loadingWarehouses?: boolean;
  selectedWarehouseIds?: number[];
  onWarehouseIdsChange?: (ids: number[]) => void;
}

function WarehouseMultiSelect({
  warehouses,
  loading,
  selectedIds,
  onChange,
}: {
  warehouses: Warehouse[];
  loading: boolean;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = (warehouseId: number) => {
    onChange(
      selectedIds.includes(warehouseId)
        ? selectedIds.filter((id) => id !== warehouseId)
        : [...selectedIds, warehouseId]
    );
  };

  const summary =
    selectedIds.length === 0
      ? "Select warehouses"
      : selectedIds.length === 1
      ? warehouses.find((w) => w.warehouseId === selectedIds[0])?.name ?? "1 selected"
      : `${selectedIds.length} selected`;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={loading}
        className={cn(dialogInputClass, "flex items-center justify-between cursor-pointer disabled:opacity-50")}
      >
        <span className={cn("truncate text-left", selectedIds.length === 0 && "text-slate-400 font-normal")}>
          {loading ? "Loading warehouses…" : summary}
        </span>
        <ChevronDown className="text-slate-400 shrink-0" size={14} />
      </button>
      {open && !loading && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-slate-200 rounded shadow-lg">
          {warehouses.length === 0 ? (
            <p className="px-3 py-2 text-xs text-slate-400 italic">No warehouses available</p>
          ) : (
            warehouses.map((warehouse) => (
              <label
                key={warehouse.warehouseId}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(warehouse.warehouseId)}
                  onChange={() => toggle(warehouse.warehouseId)}
                  className="accent-primary"
                />
                {warehouse.name}
                {warehouse.city ? ` (${warehouse.city})` : ""}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function AdminFormFields({
  values,
  onChange,
  adminImage,
  onImageChange,
  showRole = false,
  roles = [],
  loadingRoles = false,
  existingImageUrl,
  existingImageAlt,
  showWarehouses = false,
  warehouses = [],
  loadingWarehouses = false,
  selectedWarehouseIds = [],
  onWarehouseIdsChange,
}: AdminFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className={dialogLabelClass}>
          Admin Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={values.adminName}
          onChange={(e) => onChange("adminName", e.target.value)}
          className={dialogInputClass}
          required
        />
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>
          CNIC <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={values.cnic}
          onChange={(e) => onChange("cnic", e.target.value)}
          className={dialogInputClass}
          required
        />
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>
          Contact Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={values.contactNumber}
          onChange={(e) => onChange("contactNumber", e.target.value)}
          className={dialogInputClass}
          required
        />
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>
          Admin Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={values.adminEmail}
          onChange={(e) => onChange("adminEmail", e.target.value)}
          className={dialogInputClass}
          required
        />
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>Designation</label>
        <input
          type="text"
          value={values.designation}
          onChange={(e) => onChange("designation", e.target.value)}
          className={dialogInputClass}
        />
      </div>

      {showRole && (
        <div className="space-y-1">
          <label className={dialogLabelClass}>
            Role <span className="text-red-500">*</span>
          </label>
          <select
            value={values.roleId}
            onChange={(e) => onChange("roleId", e.target.value)}
            className={cn(dialogInputClass, "cursor-pointer appearance-none")}
            required
            disabled={loadingRoles}
          >
            <option value="">Select role</option>
            {roles.map((role) => (
              <option key={role.roleId} value={role.roleId}>
                {role.roleName}
              </option>
            ))}
          </select>
        </div>
      )}

      {showWarehouses && (
        <div className="space-y-1">
          <label className={dialogLabelClass}>Warehouses</label>
          <WarehouseMultiSelect
            warehouses={warehouses}
            loading={loadingWarehouses}
            selectedIds={selectedWarehouseIds}
            onChange={(ids) => onWarehouseIdsChange?.(ids)}
          />
        </div>
      )}

      <div className="space-y-1">
        <label className={dialogLabelClass}>Admin Image</label>
        {existingImageUrl && (
          <img
            src={existingImageUrl}
            alt={existingImageAlt ?? "Admin"}
            className="h-16 w-16 rounded object-cover border border-slate-200 mb-2"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
          className={dialogFileInputClass}
        />
        {existingImageUrl && (
          <p className="text-[10px] text-slate-400">Leave empty to keep current image</p>
        )}
      </div>
    </div>
  );
}
