"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FileOutput, FileSpreadsheet, Plus, Search, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateCityDialog } from "@/components/cities/CreateCityDialog";
import { EditCityDialog } from "@/components/cities/EditCityDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { parseApiErrorMessage } from "@/lib/api/errors";
import type { City } from "@/lib/types/city";

const TABLE_HEADERS = [
  "City ID",
  "City Name",
  "Service",
  "Short Form",
  "Status",
  "Action",
] as const;

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [cityToDelete, setCityToDelete] = useState<City | null>(null);
  const [deletingCityId, setDeletingCityId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchCities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/cities");
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${response.status})`);
      }
      const data: City[] = await response.json();
      setCities(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cities");
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 5000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const handleCitySaved = (message: string) => {
    setSuccessMessage(message);
    fetchCities();
  };

  const closeDeleteConfirm = () => {
    if (deletingCityId !== null) return;
    setCityToDelete(null);
    setDeleteError(null);
  };

  const confirmDeleteCity = async () => {
    if (!cityToDelete) return;

    setDeletingCityId(cityToDelete.cityId);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/cities/${cityToDelete.cityId}`, {
        method: "DELETE",
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(parseApiErrorMessage(body, `Delete failed (${response.status})`));
      }

      setCityToDelete(null);
      setSuccessMessage(body.message ?? "City deleted successfully");
      fetchCities();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete city");
    } finally {
      setDeletingCityId(null);
    }
  };

  const filteredCities = useMemo(() => {
    const query = appliedSearch.trim().toLowerCase();
    if (!query) return cities;

    return cities.filter((city) =>
      [
        city.cityId,
        city.cityName,
        city.serviceName,
        city.shortForm,
        city.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [cities, appliedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredCities.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearch, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedCities = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCities.slice(start, start + pageSize);
  }, [filteredCities, currentPage, pageSize]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setAppliedSearch("");
  };

  const rangeStart = filteredCities.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filteredCities.length);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <CreateCityDialog
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCitySaved}
      />
      <EditCityDialog
        city={editingCity}
        onClose={() => setEditingCity(null)}
        onSuccess={handleCitySaved}
      />

      <ConfirmDialog
        isOpen={cityToDelete !== null}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDeleteCity}
        title="Delete City"
        message="Are you sure you want to delete this city?"
        description={
          cityToDelete
            ? `${cityToDelete.cityName} (${cityToDelete.shortForm}) will be permanently removed.`
            : undefined
        }
        error={deleteError ?? undefined}
        cancelLabel="No"
        confirmLabel="Yes"
        loading={deletingCityId !== null}
      />

      {successMessage ? (
        <div className="p-3 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm font-medium">
          {successMessage}
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Cities</h1>
        <div className="flex items-center gap-2">
          <button className="h-9 px-4 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md flex items-center gap-2 active:scale-95 transition-all">
            <FileOutput size={14} />
            Export
          </button>
          <button className="h-9 px-4 bg-[#F2994A] text-white text-[11px] font-bold rounded uppercase shadow-md flex items-center gap-2 active:scale-95 transition-all">
            <FileSpreadsheet size={14} />
            Import From Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="h-10 px-6 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={14} />
            Add City
          </button>
        </div>

        <form
          onSubmit={handleSearch}
          className="bg-white rounded-xl shadow-sm border border-slate-100 p-6"
        >
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="search key"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 h-10 px-4 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
            <button
              type="submit"
              className="h-10 px-6 bg-primary text-white text-[11px] font-bold rounded uppercase shadow-md active:scale-95 transition-all flex items-center gap-2"
            >
              <Search size={14} />
              Search
            </button>
            {appliedSearch ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="h-10 px-4 border border-slate-200 text-slate-500 text-[11px] font-bold rounded uppercase hover:bg-slate-50 transition-all"
              >
                Clear
              </button>
            ) : null}
          </div>
        </form>
      </div>

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

          {error ? (
            <button
              onClick={fetchCities}
              className="text-xs font-bold text-primary uppercase hover:underline"
            >
              Retry
            </button>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
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
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={TABLE_HEADERS.length} className="py-16 text-center">
                    <p className="text-slate-400 font-bold animate-pulse text-sm">Loading cities...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={TABLE_HEADERS.length} className="py-16 text-center">
                    <p className="text-red-500 text-sm font-medium">{error}</p>
                  </td>
                </tr>
              ) : paginatedCities.length === 0 ? (
                <tr>
                  <td colSpan={TABLE_HEADERS.length} className="py-16 text-center">
                    <p className="text-slate-300 italic text-sm font-medium">No cities found</p>
                  </td>
                </tr>
              ) : (
                paginatedCities.map((city) => (
                  <tr key={city.cityId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-xs font-bold text-primary">{city.cityId}</td>
                    <td className="p-4 text-xs font-bold text-slate-700 uppercase">{city.cityName}</td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase">
                        {city.serviceName}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-600">{city.shortForm}</td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "inline-block px-2 py-1 text-[10px] font-bold rounded uppercase",
                          city.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {city.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingCity(city)}
                          className="p-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                          aria-label="Edit city"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCityToDelete(city)}
                          className="p-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                          aria-label="Delete city"
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

        <div className="p-4 border-t border-slate-50 flex flex-wrap items-center justify-between gap-4 bg-slate-50/10">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing {rangeStart} to {rangeEnd} of {filteredCities.length} entries
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1.5 rounded text-[11px] font-bold text-slate-400 hover:bg-slate-100 disabled:opacity-40"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .map((page, index, pages) => (
                <React.Fragment key={page}>
                  {index > 0 && pages[index - 1] !== page - 1 ? (
                    <span className="px-1 text-slate-300">...</span>
                  ) : null}
                  <button
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
                </React.Fragment>
              ))}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1.5 rounded text-[11px] font-bold text-slate-400 hover:bg-slate-100 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
