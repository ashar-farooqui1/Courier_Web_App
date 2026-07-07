/** Empty column required by backend at position 10 (leave blank in every row). */
export const ORDER_IMPORT_PLACEHOLDER_COLUMN = "test";

/**
 * Column order must match backend Excel parsing (row.Cell(1) … row.Cell(12)).
 * Keep names exactly as written — including "Customer Refrences" and lowercase "weight".
 */
export const ORDER_IMPORT_TEMPLATE_HEADERS = [
  "Consignee Name",
  "Consignee Contact No",
  "Consignee Address",
  "Product Name",
  "COD",
  "Pieces",
  "weight",
  "Destination",
  "Customer Refrences",
  ORDER_IMPORT_PLACEHOLDER_COLUMN,
  "Locationid",
  "ServiceId",
] as const;

/** Shipment fields only (excludes test / Locationid / ServiceId). */
export const ORDER_IMPORT_DATA_HEADERS = ORDER_IMPORT_TEMPLATE_HEADERS.filter(
  (header) =>
    header !== ORDER_IMPORT_PLACEHOLDER_COLUMN &&
    header !== "Locationid" &&
    header !== "ServiceId"
);

export const ORDER_IMPORT_TEMPLATE_SAMPLE_ROW = [
  "John Doe",
  "03001234567",
  "House 1, Street 2",
  "Sample Product",
  "500",
  "1",
  "1",
  "Karachi",
  "REF-001",
  "",
  "1",
  "1",
] as const;

export const ORDER_IMPORT_TEMPLATE_FILENAME = "order-import-template.xlsx";

export async function buildOrderImportTemplateBuffer(): Promise<Buffer> {
  const XLSX = await import("xlsx");

  const worksheet = XLSX.utils.aoa_to_sheet([
    [...ORDER_IMPORT_TEMPLATE_HEADERS],
    [...ORDER_IMPORT_TEMPLATE_SAMPLE_ROW],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
