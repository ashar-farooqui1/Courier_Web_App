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
import { FieldError, fieldErrorInputClass } from "@/components/ui/FieldError";
import { rules, sanitize, type FieldErrors, type FieldRules } from "@/lib/validation";

export interface AdminFormValues {
  adminName: string;
  cnic: string;
  contactNumber: string;
  adminEmail: string;
  designation: string;
  roleId: string;
}

const ADMIN_FIELD_SANITIZERS: Partial<Record<keyof AdminFormValues, (value: string) => string>> = {
  adminName: sanitize.name,
  cnic: sanitize.cnic,
  contactNumber: sanitize.phone,
  designation: sanitize.name,
};

export const ADMIN_FIELD_RULES: FieldRules<AdminFormValues> = {
  adminName: rules.name("Admin name", { required: true }),
  cnic: rules.cnic("CNIC", { required: true }),
  contactNumber: rules.mobile("Contact number", { required: true }),
  adminEmail: rules.email("Admin email", { required: true }),
  designation: rules.name("Designation"),
  roleId: rules.selected("Role"),
};

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
  errors?: FieldErrors<AdminFormValues>;
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
  errors = {},
}: AdminFormFieldsProps) {
  const change = (field: keyof AdminFormValues, value: string) => {
    const sanitizer = ADMIN_FIELD_SANITIZERS[field];
    onChange(field, sanitizer ? sanitizer(value) : value);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className={dialogLabelClass}>
          Admin Name <span className="text-red-500">*</span>
        </label>
        <input
          maxLength={100}
          type="text"
          value={values.adminName}
          onChange={(e) => change("adminName", e.target.value)}
          className={cn(dialogInputClass, errors.adminName && fieldErrorInputClass)}
          required
        />
        <FieldError message={errors.adminName} />
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>
          CNIC <span className="text-red-500">*</span>
        </label>
        <input
          inputMode="numeric"
          placeholder="42201-1234567-1"
          type="text"
          value={values.cnic}
          onChange={(e) => change("cnic", e.target.value)}
          className={cn(dialogInputClass, errors.cnic && fieldErrorInputClass)}
          required
        />
        <FieldError message={errors.cnic} />
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>
          Contact Number <span className="text-red-500">*</span>
        </label>
        <input
          inputMode="tel"
          maxLength={13}
          placeholder="03001234567"
          type="text"
          value={values.contactNumber}
          onChange={(e) => change("contactNumber", e.target.value)}
          className={cn(dialogInputClass, errors.contactNumber && fieldErrorInputClass)}
          required
        />
        <FieldError message={errors.contactNumber} />
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>
          Admin Email <span className="text-red-500">*</span>
        </label>
        <input
          maxLength={100}
          placeholder="name@example.com"
          type="email"
          value={values.adminEmail}
          onChange={(e) => change("adminEmail", e.target.value)}
          className={cn(dialogInputClass, errors.adminEmail && fieldErrorInputClass)}
          required
        />
        <FieldError message={errors.adminEmail} />
      </div>

      <div className="space-y-1">
        <label className={dialogLabelClass}>Designation</label>
        <input
          maxLength={100}
          type="text"
          value={values.designation}
          onChange={(e) => change("designation", e.target.value)}
          className={cn(dialogInputClass, errors.designation && fieldErrorInputClass)}
        />
        <FieldError message={errors.designation} />
      </div>

      {showRole && (
        <div className="space-y-1">
          <label className={dialogLabelClass}>
            Role <span className="text-red-500">*</span>
          </label>
          <select
            value={values.roleId}
            onChange={(e) => change("roleId", e.target.value)}
            className={cn(dialogInputClass, "cursor-pointer appearance-none", errors.roleId && fieldErrorInputClass)}
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
          <FieldError message={errors.roleId} />
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
