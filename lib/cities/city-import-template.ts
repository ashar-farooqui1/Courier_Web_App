/** Column order must match backend Excel parsing: CityName, ZoneId, ShortForm, Province, Status. */
export const CITY_IMPORT_TEMPLATE_HEADERS = [
  "CityName",
  "ZoneId",
  "ShortForm",
  "Province",
  "Status",
] as const;

export const CITY_IMPORT_TEMPLATE_FILENAME = "city-import-template.xlsx";

export async function buildCityImportTemplateBuffer(): Promise<Buffer> {
  const XLSX = await import("xlsx");

  const worksheet = XLSX.utils.aoa_to_sheet([
    [...CITY_IMPORT_TEMPLATE_HEADERS],
    ["Karachi", 1, "KHI", "Sindh", "Active"],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Cities");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
