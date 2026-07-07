"use client";

import React from "react";
import { dialogFileInputClass, dialogLabelClass } from "@/components/ui/dialog-styles";
import type { ClientDocumentFiles } from "@/lib/types/onboard-client";

interface OnboardDocumentsStepProps {
  files: ClientDocumentFiles;
  onChange: (field: keyof ClientDocumentFiles, file: File | null) => void;
}

const DOCUMENT_FIELDS: {
  key: keyof ClientDocumentFiles;
  label: string;
  hint: string;
}[] = [
  { key: "logo", label: "Client Logo", hint: "Upload client logo image" },
  { key: "cnicFront", label: "CNIC Front", hint: "Upload CNIC front image" },
  { key: "cnicBack", label: "CNIC Back", hint: "Upload CNIC back image" },
  { key: "blankCheque", label: "Bank Cheque", hint: "Upload blank cheque image" },
];

export function OnboardDocumentsStep({ files, onChange }: OnboardDocumentsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold text-slate-700">Upload Documents</h2>
        <p className="text-xs text-slate-500 mt-1">
          Upload client logo, CNIC images, and bank cheque to complete onboarding.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOCUMENT_FIELDS.map((field) => {
          const selectedFile = files[field.key];

          return (
            <div key={field.key} className="space-y-1.5">
              <label className={dialogLabelClass}>{field.label} *</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onChange(field.key, e.target.files?.[0] ?? null)}
                className={dialogFileInputClass}
              />
              <p className="text-[10px] text-slate-400">
                {selectedFile ? selectedFile.name : field.hint}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
