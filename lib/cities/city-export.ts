import { CITY_IMPORT_TEMPLATE_HEADERS } from "@/lib/cities/city-import-template";
import type { City } from "@/lib/types/city";

export const CITIES_EXPORT_FILENAME = "cities-export.xlsx";

function cityToExportRow(city: City): (string | number)[] {
  return [
    city.cityName,
    city.zoneId,
    city.shortForm,
    city.province ?? "",
    city.status,
  ];
}

export async function buildCitiesExportBuffer(cities: City[]): Promise<Buffer> {
  const XLSX = await import("xlsx");

  const sortedCities = [...cities].sort((left, right) =>
    left.cityName.localeCompare(right.cityName, undefined, { sensitivity: "base" })
  );

  const worksheet = XLSX.utils.aoa_to_sheet([
    [...CITY_IMPORT_TEMPLATE_HEADERS],
    ...sortedCities.map(cityToExportRow),
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Cities");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
