"use client";

import React, { useEffect, useRef, useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import {
  AppDialog,
  DialogBody,
  DialogError,
  DialogFormFooter,
} from "@/components/ui/AppDialog";
import { dialogInputClass, dialogLabelClass } from "@/components/ui/dialog-styles";
import { parseApiErrorMessage } from "@/lib/api/errors";
import { CITY_IMPORT_TEMPLATE_HEADERS } from "@/lib/cities/city-import-template";

const FORM_ID = "import-cities-form";

interface ImportCitiesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function ImportCitiesDialog({ isOpen, onClose, onSuccess }: ImportCitiesDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setSelectedFile(null);
    setError(null);
    setSubmitting(false);
    setDownloadingTemplate(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [isOpen]);

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    setError(null);

    try {
      const response = await fetch("/api/cities/import-template");
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed to download template (${response.status})`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "city-import-template.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download template");
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please select an Excel file to import.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/cities/bulk-upload", {
        method: "POST",
        body: formData,
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(parseApiErrorMessage(body, `Import failed (${response.status})`));
      }

      onSuccess(body.message ?? "Cities imported successfully");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import cities");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Import Cities"
      maxWidth="lg"
      disableClose={submitting}
      footer={
        <DialogFormFooter
          formId={FORM_ID}
          onCancel={onClose}
          submitLabel="Import Cities"
          submittingLabel="Importing..."
          submitting={submitting}
        />
      }
    >
      <DialogBody>
        {error ? <DialogError message={error} /> : null}

        <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Upload an Excel file with columns in this order:{" "}
            <span className="font-bold">{CITY_IMPORT_TEMPLATE_HEADERS.join(", ")}</span>.
            The first row can be headers; data rows should follow the same column order.
          </p>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={downloadingTemplate || submitting}
            className="text-sm font-bold text-primary hover:text-primary/80 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadingTemplate ? "Preparing template…" : "Download city import template"}
          </button>

          <div className="space-y-1.5">
            <label className={dialogLabelClass}>Excel File *</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setSelectedFile(file);
                setError(null);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={submitting}
              className={`${dialogInputClass} flex items-center justify-between gap-3 text-left`}
            >
              <span className={selectedFile ? "text-slate-700" : "text-slate-400"}>
                {selectedFile?.name ?? "Choose Excel file"}
              </span>
              <FileSpreadsheet size={16} className="text-slate-400 shrink-0" />
            </button>
          </div>
        </form>
      </DialogBody>
    </AppDialog>
  );
}
