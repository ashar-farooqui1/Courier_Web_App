/** Column headers for the bulk order import Excel template (exact names required by backend). */
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
  "Location_id",
] as const;

export const ORDER_IMPORT_TEMPLATE_FILENAME = "order-import-template.xlsx";

export async function buildOrderImportTemplateBuffer(): Promise<Buffer> {
  const XLSX = await import("xlsx");

  const worksheet = XLSX.utils.aoa_to_sheet([
    [...ORDER_IMPORT_TEMPLATE_HEADERS],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
