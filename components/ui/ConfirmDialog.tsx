"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { AppDialog, DialogError, DialogFormFooter } from "@/components/ui/AppDialog";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  description?: string;
  error?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm",
  message,
  description,
  error,
  confirmLabel = "Yes",
  cancelLabel = "No",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <AppDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      titleId="confirm-dialog-title"
      maxWidth="md"
      disableClose={loading}
      role="alertdialog"
      footer={
        <DialogFormFooter
          onCancel={onClose}
          cancelLabel={cancelLabel}
          submitLabel={confirmLabel}
          submittingLabel="Please wait…"
          submitting={loading}
          variant="danger"
          formId="confirm-dialog-form"
        />
      }
    >
      <form
        id="confirm-dialog-form"
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm();
        }}
        className="flex flex-col min-h-0 flex-1"
      >
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={28} className="text-red-500" />
          </div>
          <div className="space-y-2">
            <p id="confirm-dialog-message" className="text-sm font-bold text-slate-700">
              {message}
            </p>
            {description && (
              <p className="text-xs text-slate-400 font-medium">{description}</p>
            )}
            {error && <DialogError message={error} />}
          </div>
        </div>
      </form>
    </AppDialog>
  );
}
