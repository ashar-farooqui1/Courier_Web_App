"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Trash2, Plus, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import CreateAdminDialog from "@/components/admin/CreateAdminDialog";
import EditAdminDialog from "@/components/admin/EditAdminDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { parseApiErrorMessage } from "@/lib/api/errors";
import type { Admin } from "@/types/admin";

const TABLE_HEADERS = [
  "Admin ID",
  "Admin Name",
  "CNIC #",
  "Contact #",
  "Admin Email",
  "Designation #",
  "Admin Image",
  "Action",
] as const;

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

type AdminFilters = {
  adminId: string;
  adminName: string;
  adminEmail: string;
  contactNumber: string;
  cnic: string;
};

const emptyFilters: AdminFilters = {
  adminId: "",
  adminName: "",
  adminEmail: "",
  contactNumber: "",
  cnic: "",
};

function matchesFilters(admin: Admin, filters: AdminFilters): boolean {
  const adminId = filters.adminId.trim();
  const adminName = filters.adminName.trim().toLowerCase();
  const adminEmail = filters.adminEmail.trim().toLowerCase();
  const contactNumber = filters.contactNumber.trim();
  const cnic = filters.cnic.trim().toLowerCase();

  if (adminId && !String(admin.adminId).includes(adminId)) return false;
  if (adminName && !admin.adminName.toLowerCase().includes(adminName)) return false;
  if (adminEmail && !admin.adminEmail.toLowerCase().includes(adminEmail)) return false;
  if (contactNumber && !admin.contactNumber.includes(contactNumber)) return false;
  if (cnic && !admin.cnic.toLowerCase().includes(cnic)) return false;

  return true;
}

export default function AdminPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterInputs, setFilterInputs] = useState<AdminFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<AdminFilters>(emptyFilters);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [deletingAdminId, setDeletingAdminId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin");
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${response.status})`);
      }
      const data: Admin[] = await response.json();
      setAdmins(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admins");
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const filteredAdmins = useMemo(() => {
    let result = admins.filter((admin) => matchesFilters(admin, appliedFilters));

    const query = search.trim().toLowerCase();
    if (!query) return result;

    return result.filter(
      (admin) =>
        String(admin.adminId).includes(query) ||
        admin.adminName.toLowerCase().includes(query) ||
        admin.cnic.toLowerCase().includes(query) ||
        admin.contactNumber.includes(query) ||
        admin.adminEmail.toLowerCase().includes(query) ||
        admin.designation.toLowerCase().includes(query) ||
        admin.roleName.toLowerCase().includes(query)
    );
  }, [admins, appliedFilters, search]);

  const totalPages = Math.max(1, Math.ceil(filteredAdmins.length / pageSize));

  const paginatedAdmins = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAdmins.slice(start, start + pageSize);
  }, [filteredAdmins, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, pageSize, appliedFilters]);

  const handleFilterSearch = () => {
    setAppliedFilters({ ...filterInputs });
    setCurrentPage(1);
  };

  const handleFilterClear = () => {
    setFilterInputs(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageIds = paginatedAdmins.map((a) => a.adminId);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));

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

  const toggleRow = (adminId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(adminId)) next.delete(adminId);
      else next.add(adminId);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedIds(new Set(filteredAdmins.map((a) => a.adminId)));
  };

  const deselectAll = () => setSelectedIds(new Set());

  const openDeleteConfirm = (admin: Admin) => {
    setDeleteError(null);
    setAdminToDelete(admin);
  };

  const closeDeleteConfirm = () => {
    if (deletingAdminId !== null) return;
    setAdminToDelete(null);
    setDeleteError(null);
  };

  const confirmDeleteAdmin = async () => {
    if (!adminToDelete) return;

    setDeletingAdminId(adminToDelete.adminId);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/admin/${adminToDelete.adminId}`, {
        method: "DELETE",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(parseApiErrorMessage(body, `Delete failed (${response.status})`));
      }
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(adminToDelete.adminId);
        return next;
      });
      setAdminToDelete(null);
      await fetchAdmins();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete admin");
    } finally {
      setDeletingAdminId(null);
    }
  };

  const deleteAdminLabel = adminToDelete
    ? `${adminToDelete.adminName} (ID ${adminToDelete.adminId})`
    : undefined;

  const rangeStart = filteredAdmins.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filteredAdmins.length);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Admin List</h1>
        <div className="flex items-center gap-2">
          <button className="h-9 px-4 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md flex items-center gap-2 active:scale-95 transition-all">
            <Trash2 size={14} />
            Delete
          </button>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="h-9 px-4 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <Plus size={14} />
            New
          </button>
        </div>
      </div>

      <form
        className="bg-white rounded-xl shadow-sm border border-slate-100 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleFilterSearch();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin ID</label>
            <input
              type="text"
              value={filterInputs.adminId}
              onChange={(e) => setFilterInputs((f) => ({ ...f, adminId: e.target.value }))}
              placeholder="Enter Admin ID"
              className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Name</label>
            <input
              type="text"
              value={filterInputs.adminName}
              onChange={(e) => setFilterInputs((f) => ({ ...f, adminName: e.target.value }))}
              placeholder="Enter Admin Name"
              className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Email</label>
            <input
              type="text"
              value={filterInputs.adminEmail}
              onChange={(e) => setFilterInputs((f) => ({ ...f, adminEmail: e.target.value }))}
              placeholder="Enter Admin Email"
              className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact #</label>
            <input
              type="text"
              value={filterInputs.contactNumber}
              onChange={(e) => setFilterInputs((f) => ({ ...f, contactNumber: e.target.value }))}
              placeholder="Enter Contact #"
              className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CNIC #</label>
            <input
              type="text"
              value={filterInputs.cnic}
              onChange={(e) => setFilterInputs((f) => ({ ...f, cnic: e.target.value }))}
              placeholder="Enter CNIC #"
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
        <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={selectAllFiltered}
              className="h-9 px-4 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-sm active:scale-95 transition-all"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={deselectAll}
              className="h-9 px-4 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-sm active:scale-95 transition-all"
            >
              Deselect All
            </button>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Search:</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 px-3 border border-slate-200 rounded text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm flex items-center justify-between gap-4">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchAdmins}
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
                    disabled={loading || paginatedAdmins.length === 0}
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
                  <td colSpan={TABLE_HEADERS.length + 1} className="p-8 text-center text-slate-400">
                    Loading admins...
                  </td>
                </tr>
              ) : paginatedAdmins.length === 0 ? (
                <tr>
                  <td colSpan={TABLE_HEADERS.length + 1} className="p-8 text-center text-slate-400">
                    No admins found
                  </td>
                </tr>
              ) : (
                paginatedAdmins.map((admin) => (
                  <tr
                    key={admin.adminId}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(admin.adminId)}
                        onChange={() => toggleRow(admin.adminId)}
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="p-4">{admin.adminId}</td>
                    <td className="p-4">{admin.adminName}</td>
                    <td className="p-4">{admin.cnic}</td>
                    <td className="p-4">{admin.contactNumber}</td>
                    <td className="p-4 lowercase">{admin.adminEmail}</td>
                    <td className="p-4">{admin.designation}</td>
                    <td className="p-4">
                      {admin.adminImage ? (
                        <img
                          src={admin.adminImage}
                          alt={admin.adminName}
                          className="h-10 w-10 rounded object-cover border border-slate-200"
                        />
                      ) : null}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingAdmin(admin)}
                          className="p-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                          title={`Edit ${admin.adminName}`}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteConfirm(admin)}
                          className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          title={`Delete ${admin.adminName}`}
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
            {filteredAdmins.length === 0
              ? "Showing 0 entries"
              : `Showing ${rangeStart} to ${rangeEnd} of ${filteredAdmins.length} entries`}
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

      <CreateAdminDialog
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={fetchAdmins}
      />

      <EditAdminDialog
        admin={editingAdmin}
        isOpen={editingAdmin !== null}
        onClose={() => setEditingAdmin(null)}
        onSuccess={fetchAdmins}
      />

      <ConfirmDialog
        isOpen={adminToDelete !== null}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDeleteAdmin}
        title="Delete Admin"
        message="Are you sure you want to delete this admin?"
        description={
          deleteAdminLabel
            ? `${deleteAdminLabel} will be permanently removed.`
            : undefined
        }
        error={deleteError ?? undefined}
        cancelLabel="No"
        confirmLabel="Yes"
        loading={deletingAdminId !== null}
      />
    </div>
  );
}
