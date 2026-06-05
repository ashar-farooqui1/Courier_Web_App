"use client";

import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  dialogErrorClass,
  dialogMaxWidthClass,
  type DialogMaxWidth,
} from "@/components/ui/dialog-styles";

interface AppDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleId?: string;
  maxWidth?: DialogMaxWidth;
  children: React.ReactNode;
  footer?: React.ReactNode;
  disableClose?: boolean;
  role?: "dialog" | "alertdialog";
}

export function AppDialog({
  isOpen,
  onClose,
  title,
  titleId,
  maxWidth = "2xl",
  children,
  footer,
  disableClose = false,
  role = "dialog",
}: AppDialogProps) {
  if (!isOpen) return null;

  const headingId = titleId ?? "app-dialog-title";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200"
      role={role}
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <div
        className={cn(
          "bg-white rounded-xl shadow-2xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200",
          dialogMaxWidthClass[maxWidth]
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
          <h3
            id={headingId}
            className="font-bold text-slate-700 text-sm uppercase tracking-wide"
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={disableClose}
            className="hover:bg-slate-50 p-1 rounded-full transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {children}

        {footer ? (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 shrink-0">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface DialogFormFooterProps {
  onCancel: () => void;
  submitLabel: string;
  submittingLabel: string;
  submitting?: boolean;
  cancelLabel?: string;
  formId?: string;
  variant?: "primary" | "danger";
}

export function DialogFormFooter({
  onCancel,
  submitLabel,
  submittingLabel,
  submitting = false,
  cancelLabel = "Cancel",
  formId,
  variant = "primary",
}: DialogFormFooterProps) {
  const submitClass =
    variant === "danger"
      ? "h-10 px-8 bg-red-600 text-white text-[11px] font-bold rounded uppercase shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors disabled:opacity-60"
      : "h-10 px-8 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-60";

  return (
    <>
      <button
        type="button"
        onClick={onCancel}
        disabled={submitting}
        className="h-10 px-6 border border-slate-200 text-slate-600 text-[11px] font-bold rounded uppercase hover:bg-slate-50 transition-colors disabled:opacity-50"
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        form={formId}
        disabled={submitting}
        className={submitClass}
      >
        {submitting ? submittingLabel : submitLabel}
      </button>
    </>
  );
}

export function DialogError({ message }: { message: string }) {
  return <div className={dialogErrorClass}>{message}</div>;
}

export function DialogBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("p-6 overflow-y-auto space-y-4 min-h-0 flex-1", className)}>
      {children}
    </div>
  );
}

export function DialogLoading({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
      {message}
    </div>
  );
}
