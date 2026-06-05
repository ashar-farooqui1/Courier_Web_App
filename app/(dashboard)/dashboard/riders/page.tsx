"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Trash2, Plus, Edit2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateRiderDialog } from "@/components/riders/CreateRiderDialog";
import { EditRiderDialog } from "@/components/riders/EditRiderDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { parseApiErrorMessage } from "@/lib/api/errors";
import {
  emptyRiderSearchFilters,
  filterRiders,
  type RiderSearchFilters,
} from "@/lib/riders/filter-riders";
import { displayFileRef, isBrowserImageUrl } from "@/lib/riders/rider-display";
import type { Rider } from "@/lib/types/rider";

const TABLE_HEADERS = [
  "Rider ID",
  "Name",
  "Contact #",
  "Image",
  "Email",
  "Address",
  "Area",
  "City",
  "CNIC",
  "License",
  "Vehicle Registered Number",
  "Action",
] as const;

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterInputs, setFilterInputs] = useState<RiderSearchFilters>(emptyRiderSearchFilters);
  const [appliedFilters, setAppliedFilters] = useState<RiderSearchFilters>(emptyRiderSearchFilters);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editRiderId, setEditRiderId] = useState<number | null>(null);
  const [riderToDelete, setRiderToDelete] = useState<Rider | null>(null);
  const [deletingRiderId, setDeletingRiderId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchRiders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/riders");
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${response.status})`);
      }
      const data: Rider[] = await response.json();
      setRiders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load riders");
      setRiders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 5000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const handleRiderSaved = (message: string) => {
    setSuccessMessage(message);
    fetchRiders();
  };

  const openDeleteConfirm = (rider: Rider) => {
    setDeleteError(null);
    setRiderToDelete(rider);
  };

  const closeDeleteConfirm = () => {
    if (deletingRiderId !== null) return;
    setRiderToDelete(null);
    setDeleteError(null);
  };

  const confirmDeleteRider = async () => {
    if (!riderToDelete) return;

    setDeletingRiderId(riderToDelete.riderId);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/riders/${riderToDelete.riderId}`, {
        method: "DELETE",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(parseApiErrorMessage(body, `Delete failed (${response.status})`));
      }
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(riderToDelete.riderId);
        return next;
      });
      setRiderToDelete(null);
      handleRiderSaved(
        (body as { message?: string }).message ?? "Rider deleted successfully"
      );
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete rider");
    } finally {
      setDeletingRiderId(null);
    }
  };

  const deleteRiderLabel = riderToDelete
    ? `${riderToDelete.name} (ID ${riderToDelete.riderId})`
    : undefined;

  const filteredRiders = useMemo(
    () => filterRiders(riders, appliedFilters),
    [riders, appliedFilters]
  );

  const totalPages = Math.max(1, Math.ceil(filteredRiders.length / pageSize));

  const paginatedRiders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRiders.slice(start, start + pageSize);
  }, [filteredRiders, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageIds = paginatedRiders.map((r) => r.riderId);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleRow = (riderId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(riderId)) next.delete(riderId);
      else next.add(riderId);
      return next;
    });
  };

  const handleFilterSearch = () => {
    setAppliedFilters({ ...filterInputs });
    setCurrentPage(1);
  };

  const handleFilterClear = () => {
    setFilterInputs(emptyRiderSearchFilters);
    setAppliedFilters(emptyRiderSearchFilters);
    setCurrentPage(1);
  };

  const rangeStart =
    filteredRiders.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filteredRiders.length);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <CreateRiderDialog
        isOpen={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSuccess={handleRiderSaved}
      />

      <EditRiderDialog
        riderId={editRiderId}
        isOpen={editRiderId !== null}
        onClose={() => setEditRiderId(null)}
        onSuccess={handleRiderSaved}
      />

      <ConfirmDialog
        isOpen={riderToDelete !== null}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDeleteRider}
        title="Delete Rider"
        message="Are you sure you want to delete this rider?"
        description={
          deleteRiderLabel
            ? `${deleteRiderLabel} will be permanently removed.`
            : undefined
        }
        error={deleteError ?? undefined}
        cancelLabel="No"
        confirmLabel="Yes"
        loading={deletingRiderId !== null}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          Rider List
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAddDialogOpen(true)}
            className="h-9 px-4 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <Plus size={14} />
            New
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wide">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="shrink-0 p-1 hover:bg-emerald-100 rounded-full transition-colors"
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <form
        className="bg-white rounded-xl shadow-sm border border-slate-100 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleFilterSearch();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Rider ID
            </label>
            <input
              type="text"
              value={filterInputs.riderId}
              onChange={(e) =>
                setFilterInputs((f) => ({ ...f, riderId: e.target.value }))
              }
              placeholder="Enter Rider ID"
              className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Name
            </label>
            <input
              type="text"
              value={filterInputs.name}
              onChange={(e) =>
                setFilterInputs((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="Enter Rider Name"
              className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Email
            </label>
            <input
              type="text"
              value={filterInputs.email}
              onChange={(e) =>
                setFilterInputs((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="Enter Rider Email"
              className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Contact #
            </label>
            <input
              type="text"
              value={filterInputs.contactNumber}
              onChange={(e) =>
                setFilterInputs((f) => ({ ...f, contactNumber: e.target.value }))
              }
              placeholder="Enter Contact #"
              className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              CNIC #
            </label>
            <input
              type="text"
              value={filterInputs.cnic}
              onChange={(e) =>
                setFilterInputs((f) => ({ ...f, cnic: e.target.value }))
              }
              placeholder="Enter Rider CNIC #"
              className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleFilterClear}
            className="h-10 px-10 border border-slate-200 text-slate-600 text-[11px] font-bold rounded uppercase hover:bg-slate-50 active:scale-95 transition-all"
          >
            Clear
          </button>
          <button
            type="submit"
            className="h-10 px-12 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            Search
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-9 border border-slate-200 rounded px-2 text-xs font-bold text-primary"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-[11px] font-bold text-slate-500 uppercase">entries</span>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm flex items-center justify-between gap-4">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchRiders}
              className="shrink-0 h-8 px-4 bg-primary text-white text-[11px] font-bold rounded uppercase"
            >
              Retry
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleSelectAll}
                    disabled={loading || paginatedRiders.length === 0}
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </th>
                {TABLE_HEADERS.map((header) => (
                  <th
                    key={header}
                    className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[11px] font-medium text-slate-600">
              {loading ? (
                <tr>
                  <td
                    colSpan={TABLE_HEADERS.length + 1}
                    className="p-8 text-center text-slate-400"
                  >
                    Loading riders…
                  </td>
                </tr>
              ) : paginatedRiders.length === 0 ? (
                <tr>
                  <td
                    colSpan={TABLE_HEADERS.length + 1}
                    className="p-8 text-center text-slate-400"
                  >
                    No riders found
                  </td>
                </tr>
              ) : (
                paginatedRiders.map((rider) => (
                  <tr
                    key={rider.riderId}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(rider.riderId)}
                        onChange={() => toggleRow(rider.riderId)}
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="p-4">{rider.riderId}</td>
                    <td className="p-4">{rider.name}</td>
                    <td className="p-4">{rider.contactNumber}</td>
                    <td className="p-4">
                      {isBrowserImageUrl(rider.image) ? (
                        <img
                          src={rider.image!}
                          alt={rider.name}
                          className="h-10 w-10 rounded object-cover border border-slate-200"
                        />
                      ) : null}
                    </td>
                    <td className="p-4 lowercase">{rider.email}</td>
                    <td className="p-4 text-[10px] max-w-[200px] truncate" title={rider.address}>
                      {rider.address}
                    </td>
                    <td className="p-4">{rider.area}</td>
                    <td className="p-4">{rider.city}</td>
                    <td className="p-4">{rider.cnic}</td>
                    <td className="p-4 text-[10px] max-w-[120px] truncate" title={rider.license ?? ""}>
                      {displayFileRef(rider.license)}
                    </td>
                    <td className="p-4">{rider.vehicleRegisteredNumber}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditRiderId(rider.riderId)}
                          className="p-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors flex items-center justify-center"
                          aria-label={`Edit ${rider.name}`}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteConfirm(rider)}
                          className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center"
                          aria-label={`Delete ${rider.name}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50/30 flex flex-wrap items-center justify-between gap-4 border-t border-slate-50">
          <p className="text-[10px] font-bold text-slate-400 uppercase">
            {filteredRiders.length === 0
              ? "Showing 0 entries"
              : `Showing ${rangeStart} to ${rangeEnd} of ${filteredRiders.length} entries`}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-8 h-8 rounded text-[11px] font-bold transition-all",
                    page === currentPage
                      ? "bg-primary text-white shadow-md"
                      : "text-slate-400 hover:bg-slate-100"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
