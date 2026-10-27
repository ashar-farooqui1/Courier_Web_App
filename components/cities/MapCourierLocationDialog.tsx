"use client";

import React, { useEffect, useState } from "react";
import {
  AppDialog,
  DialogBody,
  DialogError,
  DialogFormFooter,
  DialogLoading,
} from "@/components/ui/AppDialog";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { dialogLabelClass } from "@/components/ui/dialog-styles";
import { parseApiErrorMessage } from "@/lib/api/errors";
import { MP_COURIER_CODE } from "@/lib/types/courier-location";
import type { CourierExternalLocation } from "@/lib/types/courier-location";
import type { City } from "@/lib/types/city";

const FORM_ID = "map-courier-location-form";

export type MapCourierLocationSeed = {
  cityId?: number;
  externalLocationId?: string;
  externalLocationName?: string;
};

interface MapCourierLocationDialogProps {
  isOpen: boolean;
  seed: MapCourierLocationSeed | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function MapCourierLocationDialog({
  isOpen,
  seed,
  onClose,
  onSuccess,
}: MapCourierLocationDialogProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [locations, setLocations] = useState<CourierExternalLocation[]>([]);
  const [cityId, setCityId] = useState("");
  const [externalLocationId, setExternalLocationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setCityId(seed?.cityId ? String(seed.cityId) : "");
    setExternalLocationId(seed?.externalLocationId ?? "");
    setError(null);
    setSubmitting(false);
    setLoading(true);

    const courierCode = encodeURIComponent(MP_COURIER_CODE);

    Promise.all([
      fetch("/api/cities").then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? `Failed to load cities (${response.status})`);
        }
        return response.json() as Promise<City[]>;
      }),
      fetch(`/api/courier-locations?courierCode=${courierCode}`).then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(
            parseApiErrorMessage(body, `Failed to load M&P locations (${response.status})`)
          );
        }
        return response.json() as Promise<CourierExternalLocation[]>;
      }),
    ])
      .then(([cityList, locationList]) => {
        setCities(Array.isArray(cityList) ? cityList : []);
        let nextLocations = Array.isArray(locationList) ? locationList : [];

        // Keep a manually-seeded unmatched location even if it isn't in the synced list yet.
        if (
          seed?.externalLocationId &&
          !nextLocations.some((loc) => loc.externalLocationId === seed.externalLocationId)
        ) {
          nextLocations = [
            {
              externalLocationId: seed.externalLocationId,
              externalLocationName: seed.externalLocationName ?? seed.externalLocationId,
            },
            ...nextLocations,
          ];
        }

        setLocations(nextLocations);
      })
      .catch((err) => {
        setCities([]);
        setLocations([]);
        setError(err instanceof Error ? err.message : "Failed to load form data");
      })
      .finally(() => setLoading(false));
  }, [isOpen, seed]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const selectedCityId = Number(cityId);
    const selectedLocation = locations.find(
      (loc) => loc.externalLocationId === externalLocationId
    );

    if (!Number.isFinite(selectedCityId) || selectedCityId <= 0) {
      setError("Select a city");
      return;
    }
    if (!selectedLocation) {
      setError("Select an M&P location");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/courier-locations/mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courierCode: MP_COURIER_CODE,
          cityId: selectedCityId,
          externalLocationId: selectedLocation.externalLocationId,
          externalLocationName: selectedLocation.externalLocationName,
        }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          parseApiErrorMessage(body, `Save failed (${response.status})`)
        );
      }

      onSuccess(
        `Mapped ${selectedLocation.externalLocationName} to city ${selectedCityId}`
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save mapping");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppDialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Map M&P Location"
      maxWidth="lg"
      disableClose={submitting}
      footer={
        loading ? undefined : (
          <DialogFormFooter
            formId={FORM_ID}
            onCancel={handleClose}
            submitLabel="Save Mapping"
            submittingLabel="Saving..."
            submitting={submitting}
          />
        )
      }
    >
      {loading ? (
        <DialogLoading message="Loading cities and M&P locations…" />
      ) : (
        <DialogBody>
          {error ? <DialogError message={error} /> : null}
          <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className={dialogLabelClass}>City</label>
              <SearchableSelect
                value={cityId}
                onChange={setCityId}
                disabled={submitting}
                placeholder="Select city"
                options={cities.map((city) => ({
                  value: String(city.cityId),
                  label: `${city.cityName} (${city.cityId})`,
                  keywords: `${city.cityName} ${city.cityId} ${city.shortForm}`,
                }))}
              />
            </div>

            <div className="space-y-2">
              <label className={dialogLabelClass}>M&P Location</label>
              <SearchableSelect
                value={externalLocationId}
                onChange={setExternalLocationId}
                disabled={submitting}
                placeholder="Select M&P location"
                options={locations.map((loc) => ({
                  value: loc.externalLocationId,
                  label: `${loc.externalLocationName} (${loc.externalLocationId})`,
                  keywords: `${loc.externalLocationName} ${loc.externalLocationId}`,
                }))}
              />
            </div>
          </form>
        </DialogBody>
      )}
    </AppDialog>
  );
}
