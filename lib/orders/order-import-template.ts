/**
 * Column order must match backend Excel parsing (row.Cell(1) … row.Cell(12)):
 * ConsigneeName, ConsigneeAddress, ConsigneeContactNo, ProductName, COD, Pieces,
 * Weight, Destination, CustomerReference, CustomerComment, LocationId, ServiceId.
 * Keep names exactly as written — including "Customer Refrences" and lowercase "weight".
 */
export const ORDER_IMPORT_TEMPLATE_HEADERS = [
  "Consignee Name",
  "Consignee Address",
  "Consignee Contact No",
  "Product Name",
  "COD",
  "Pieces",
  "weight",
  "Destination",
  "Customer Refrences",
  "Customer Comment",
  "Locationid",
  "ServiceId",
] as const;

/** Shipment fields only (excludes Locationid / ServiceId). */
export const ORDER_IMPORT_DATA_HEADERS = ORDER_IMPORT_TEMPLATE_HEADERS.filter(
  (header) => header !== "Locationid" && header !== "ServiceId"
);

export const ORDER_IMPORT_TEMPLATE_SAMPLE_ROW = [
  "John Doe",
  "House 1, Street 2",
  "03001234567",
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
