"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/hooks/useAuthRole";
import { buildAppAuthHeaders } from "@/lib/api/app-request-context";
import type { BulkUploadShipmentPreview } from "@/lib/types/order";
import type { ClientCity } from "@/lib/types/client-city";
import type { PickupLocation } from "@/lib/types/pickup-location";
import type { Service } from "@/lib/types/service";
import { ORDER_IMPORT_TEMPLATE_FILENAME } from "@/lib/orders/order-import-template";

const IMPORT_TABLE_HEADERS = [
  "#",
  "Consignee Name",
  "Consignee Contact No",
  "Delivery Address",
  "Customer Reference",
  "Product Name",
  "Destination",
  "Quantity",
  "Weight",
  "Amount",
  "Location Id",
  "Service Id",
] as const;

function formatPreviewCell(value: number | string | undefined | null): string {
  if (value == null || value === "") return "—";
  return String(value);
}

const importButtonClass =
  "inline-flex items-center gap-2 h-9 px-4 bg-primary text-white text-[11px] font-bold rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

function ReferenceDropdown({
  label,
  items,
  loading,
  emptyMessage,
}: {
  label: string;
  items: string[];
  loading: boolean;
  emptyMessage: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={importButtonClass}
      >
        {label}
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[220px] max-h-48 overflow-y-auto rounded border border-slate-200 bg-white shadow-lg">
          {loading ? (
            <p className="px-3 py-2 text-xs text-slate-400">Loading…</p>
          ) : items.length === 0 ? (
            <p className="px-3 py-2 text-xs text-slate-400">{emptyMessage}</p>
          ) : (
            items.map((item) => (
              <div
                key={item}
                className="px-3 py-2 text-xs font-medium text-slate-700 border-b border-slate-50 last:border-0"
              >
                {item}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function OrderImportView() {
  const router = useRouter();
  const { user, token, ready, clientId, role } = useAuthSession();
  const clientLabel =
    [user?.displayName?.trim(), clientId > 0 ? String(clientId) : ""]
      .filter(Boolean)
      .join(" - ") || "—";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewTableRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [shipments, setShipments] = useState<BulkUploadShipmentPreview[]>([]);
  const [parsing, setParsing] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [finalized, setFinalized] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [cities, setCities] = useState<ClientCity[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingReference, setLoadingReference] = useState(false);

  const loadReferenceData = useCallback(async () => {
    if (!Number.isInteger(clientId) || clientId < 1) return;

    setLoadingReference(true);
    try {
      const [locationsRes, citiesRes, servicesRes] = await Promise.all([
        fetch(`/api/clients/${clientId}/pickup-locations`),
        fetch(`/api/clients/${clientId}/cities`),
        fetch("/api/services"),
      ]);

      const locationsPayload = (await locationsRes.json().catch(() => null)) as
        | PickupLocation[]
        | null;
      const citiesPayload = (await citiesRes.json().catch(() => null)) as ClientCity[] | null;
      const servicesPayload = (await servicesRes.json().catch(() => null)) as
        | Service[]
        | { data?: Service[] }
        | null;

      setPickupLocations(Array.isArray(locationsPayload) ? locationsPayload : []);
      setCities(Array.isArray(citiesPayload) ? citiesPayload : []);
      const serviceRows = Array.isArray(servicesPayload)
        ? servicesPayload
        : Array.isArray(servicesPayload?.data)
          ? servicesPayload.data
          : [];
      setServices(serviceRows);
    } catch {
      setPickupLocations([]);
      setCities([]);
      setServices([]);
    } finally {
      setLoadingReference(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (ready) loadReferenceData();
  }, [ready, loadReferenceData]);

  const pickupLabels = pickupLocations.map(
    (location) =>
      `${location.locationName} (Locationid: ${location.pickupLocationId})${
        location.isDefault ? " — Default" : ""
      }`
  );
  const cityLabels = cities.map((city) => city.cityName);
  const serviceLabels = services.map(
    (service) => `${service.serviceName} (ServiceId: ${service.serviceId})`
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setSelectedFileName(file?.name ?? "");
    setUploadError(null);
    setUploadMessage(null);
    setShipments([]);
    setFinalized(false);
  };

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    setUploadError(null);

    try {
      const response = await fetch("/api/orders/import-template");
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? `Failed to download template (${response.status})`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = ORDER_IMPORT_TEMPLATE_FILENAME;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to download import template");
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleAddShipments = async () => {
    const file = fileInputRef.current?.files?.[0] ?? selectedFile;
    if (!file) {
      setUploadError("Please choose a file first.");
      return;
    }

    setSelectedFile(file);
    setSelectedFileName(file.name);
    setParsing(true);
    setUploadError(null);
    setUploadMessage(null);
    setFinalized(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/orders/parse-import", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
        data?: BulkUploadShipmentPreview[];
        count?: number;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? `Failed to read file (${response.status})`);
      }

      const rows = Array.isArray(payload?.data) ? payload.data : [];
      if (rows.length === 0) {
        throw new Error(
          "No valid shipment rows found. Check that row 1 has column headers and data starts from row 2."
        );
      }

      setShipments(rows);
      setUploadMessage(
        `${rows.length} shipment(s) loaded for preview. Scroll down to review the table, then click Finalize Import.`
      );
      requestAnimationFrame(() => {
        previewTableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      setShipments([]);
      setUploadError(err instanceof Error ? err.message : "Failed to read import file");
    } finally {
      setParsing(false);
    }
  };

  const handleFinalizeImport = async () => {
    if (!selectedFile || shipments.length === 0) {
      setUploadError("Please load shipments from a file first.");
      return;
    }

    if (!token) {
      setUploadError("Authentication required. Please log in again.");
      return;
    }

    if (!Number.isInteger(clientId) || clientId < 1) {
      setUploadError("Client session not found. Please log in again.");
      return;
    }

    setFinalizing(true);
    setUploadError(null);
    setUploadMessage(null);

    try {
      const formData = new FormData();
      formData.append("ClientId", String(clientId));
      formData.append("file", selectedFile);

      const response = await fetch("/api/orders/bulk-upload", {
        method: "POST",
        headers: buildAppAuthHeaders(token, role, clientId),
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
        details?: {
          data?: { errors?: string[] };
          errors?: string[];
        };
      } | null;

      if (!response.ok) {
        const detailErrors = payload?.details?.data?.errors ?? payload?.details?.errors;
        const detailText =
          Array.isArray(detailErrors) && detailErrors.length > 0
            ? ` ${detailErrors.join(" ")}`
            : "";
        throw new Error(
          `${payload?.message ?? `Finalize import failed (${response.status})`}${detailText}`
        );
      }

      setFinalized(true);
      setUploadMessage(payload?.message ?? "Import finalized successfully.");
      router.push("/orders/details");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Finalize import failed");
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="space-y-2">
        <Link
          href="/orders/details"
          className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Orders
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Order Import</h1>
      </div>

      {(uploadError || uploadMessage) && (
        <div
          className={cn(
            "p-4 rounded-lg border text-xs font-medium",
            uploadError
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          )}
        >
          {uploadError ?? uploadMessage}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-8">
        <section className="space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            <span className="font-bold">Step 1.</span> Download the excel model below and fill in the
            data. You can change the order of the columns, but you must keep their names as they are.
            At least the <span className="font-bold">Pieces</span> column needs to contain the number
            of pieces (for example 1). Column <span className="font-bold">test</span> (column 10) must
            stay <span className="font-bold">empty</span>. Use valid{" "}
            <span className="font-bold">Locationid</span> and <span className="font-bold">ServiceId</span>{" "}
            from the reference lists below. Download the template — do not remove or rename columns.
          </p>
          <button
            type="button"
            disabled={downloadingTemplate}
            className="text-sm font-bold text-primary hover:text-primary/80 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDownloadTemplate}
          >
            {downloadingTemplate ? "Preparing template…" : "Download order import template"}
          </button>

          <div className="space-y-3 pt-2">
            <p className="text-sm font-bold text-slate-800">Valid value for Client</p>
            <ul className="list-disc pl-6 text-sm text-slate-700">
              <li>{clientLabel}</li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-800">Valid reference values</p>
            <div className="flex flex-wrap gap-2">
              <ReferenceDropdown
                label="Services"
                items={serviceLabels}
                loading={loadingReference}
                emptyMessage="No services found"
              />
              <ReferenceDropdown
                label="Pickup Locations"
                items={pickupLabels}
                loading={loadingReference}
                emptyMessage="No pickup locations found"
              />
              <ReferenceDropdown
                label="Cities"
                items={cityLabels}
                loading={loadingReference}
                emptyMessage="No cities found"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t border-slate-100 pt-8">
          <p className="text-sm text-slate-700 leading-relaxed">
            <span className="font-bold">Step 2.</span> Save the file and upload it below (normal Excel
            format, or CSV) and press &apos;Add shipments&apos; button.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              disabled={finalized}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.value = "";
                fileInputRef.current?.click();
              }}
              disabled={finalized}
              className="h-9 px-4 border border-slate-300 rounded bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Choose File
            </button>
            <span className="text-xs text-slate-500">
              {selectedFileName || "No file chosen"}
            </span>
          </div>
          <button
            type="button"
            disabled={!selectedFile || parsing || finalized}
            onClick={handleAddShipments}
            className={importButtonClass}
          >
            {parsing ? "Reading file…" : "Add Shipments"}
          </button>
        </section>

        <section className="space-y-4 border-t border-slate-100 pt-8">
          <p className="text-sm text-slate-700 leading-relaxed">
            <span className="font-bold">Step 3.</span> If the shipments displayed are correct, press
            Finalize import.
          </p>
          <button
            type="button"
            disabled={shipments.length === 0 || finalizing || finalized}
            onClick={handleFinalizeImport}
            className={importButtonClass}
          >
            {finalizing ? "Finalizing…" : finalized ? "Import Finalized" : "Finalize Import"}
          </button>
          <p className="text-sm font-bold text-slate-800">
            Total Shipments: {shipments.length}
            {shipments.length > 0 ? " — preview table is below" : ""}
          </p>
        </section>
      </div>

      <div
        ref={previewTableRef}
        className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                {IMPORT_TABLE_HEADERS.map((header) => (
                  <th
                    key={header}
                    className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[11px] font-medium text-slate-600">
              {shipments.length === 0 ? (
                <tr>
                  <td
                    colSpan={IMPORT_TABLE_HEADERS.length}
                    className="py-16 text-center text-slate-300 italic text-sm font-medium"
                  >
                    Upload a file and click Add Shipments to preview orders
                  </td>
                </tr>
              ) : (
                shipments.map((row, index) => (
                  <tr key={`${row.consigneeName}-${index}`} className="border-b border-slate-50">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 whitespace-nowrap">{formatPreviewCell(row.consigneeName)}</td>
                    <td className="p-3 whitespace-nowrap">{formatPreviewCell(row.consigneeContactNo)}</td>
                    <td className="p-3 whitespace-nowrap">{formatPreviewCell(row.deliveryAddress)}</td>
                    <td className="p-3 whitespace-nowrap">{formatPreviewCell(row.customerReference)}</td>
                    <td className="p-3 whitespace-nowrap">{formatPreviewCell(row.productName)}</td>
                    <td className="p-3 whitespace-nowrap">{formatPreviewCell(row.destination)}</td>
                    <td className="p-3 whitespace-nowrap">{formatPreviewCell(row.quantity)}</td>
                    <td className="p-3 whitespace-nowrap">{formatPreviewCell(row.weight)}</td>
                    <td className="p-3 whitespace-nowrap">{formatPreviewCell(row.amount)}</td>
                    <td className="p-3 whitespace-nowrap">{formatPreviewCell(row.locationId)}</td>
                    <td className="p-3 whitespace-nowrap">{formatPreviewCell(row.serviceId)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
