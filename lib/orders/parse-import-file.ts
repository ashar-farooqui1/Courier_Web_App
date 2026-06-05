import type { BulkUploadShipmentPreview } from "@/lib/types/order";

function normalizeHeader(value: string): string {
  return String(value)
    .replace(/^\uFEFF/, "")
    .replace(/\*+$/, "")
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/refrenc/g, "referenc")
    .replace(/\s+/g, " ")
    .trim();
}

function cellValue(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function cellNumberOrString(value: unknown): string | number {
  if (value == null || value === "") return "";
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const text = String(value).trim();
  if (!text) return "";
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : text;
}

const HEADER_MAP: Record<keyof BulkUploadShipmentPreview, string[]> = {
  consigneeName: [
    "consignee name",
    "customer name",
    "consignee",
    "receiver name",
    "receiver",
  ],
  consigneeContactNo: [
    "consignee contact no",
    "consignee contact",
    "consignee phone",
    "customer phone",
    "contact no",
    "contact number",
    "phone number",
    "phone no",
    "mobile no",
    "mobile number",
    "mobile",
    "phone",
    "cell",
  ],
  deliveryAddress: [
    "consignee address",
    "delivery address",
    "receiver address",
    "shipping address",
    "complete address",
    "ship address",
    "address",
  ],
  customerReference: [
    "customer references",
    "customer reference",
    "customer ref",
    "cust reference",
    "order reference",
    "reference no",
    "reference number",
    "reference id",
    "reference",
    "ref no",
    "ref",
    "order no",
    "order id",
  ],
  productName: ["product name", "product", "item name", "item", "goods description"],
  destination: [
    "destination",
    "destination city",
    "dest city",
    "city",
    "receiver city",
    "delivery city",
  ],
  quantity: [
    "quantity",
    "qty",
    "envelopes",
    "packages",
    "package",
    "envelope",
    "pcs",
    "pieces",
    "piece",
    "no of pieces",
  ],
  weight: ["weight", "weight kg", "weight (kg)", "wt"],
  amount: [
    "amount",
    "cod amount",
    "cod",
    "collection amount",
    "price",
    "value",
    "cash on delivery",
    "order amount",
  ],
  service: [
    "service",
    "service name",
    "service type",
    "delivery type",
    "delivery service",
    "product type",
  ],
  replacementId: [
    "replacement id",
    "replacement order id",
    "replacement",
    "rep id",
    "replace id",
  ],
};

function headerMatches(headerNorm: string, alias: string): boolean {
  if (headerNorm === alias) return true;

  const headerCompact = headerNorm.replace(/\s+/g, "");
  const aliasCompact = alias.replace(/\s+/g, "");
  if (headerCompact === aliasCompact) return true;

  if (alias.length >= 5) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const wordBoundary = new RegExp(`(^|\\s)${escaped}(\\s|$)`);
    if (wordBoundary.test(headerNorm)) return true;
    if (headerNorm.startsWith(`${alias} `) || headerNorm.endsWith(` ${alias}`)) return true;
  }

  return false;
}

function buildColumnMap(headers: string[]): Map<keyof BulkUploadShipmentPreview, string> {
  const columnMap = new Map<keyof BulkUploadShipmentPreview, string>();
  const usedHeaders = new Set<string>();

  const normalizedHeaders = headers.map((header) => ({
    raw: header,
    norm: normalizeHeader(header),
  }));

  for (const [field, aliases] of Object.entries(HEADER_MAP) as [
    keyof BulkUploadShipmentPreview,
    string[],
  ][]) {
    for (const alias of aliases) {
      const match = normalizedHeaders.find(
        (header) => !usedHeaders.has(header.raw) && headerMatches(header.norm, alias)
      );
      if (match) {
        columnMap.set(field, match.raw);
        usedHeaders.add(match.raw);
        break;
      }
    }
  }

  return columnMap;
}

function mapRowWithColumns(
  row: Record<string, unknown>,
  columnMap: Map<keyof BulkUploadShipmentPreview, string>
): BulkUploadShipmentPreview | null {
  const read = (field: keyof BulkUploadShipmentPreview, asNumber = false) => {
    const key = columnMap.get(field);
    if (!key) return asNumber ? "" : "";
    return asNumber ? cellNumberOrString(row[key]) : cellValue(row[key]);
  };

  const consigneeName = read("consigneeName");
  const productName = read("productName");

  if (!consigneeName && !productName) return null;

  return {
    consigneeName: String(consigneeName || productName),
    consigneeContactNo: read("consigneeContactNo") as string,
    deliveryAddress: read("deliveryAddress") as string,
    customerReference: read("customerReference") as string,
    productName: String(productName || consigneeName),
    destination: read("destination") as string,
    quantity: read("quantity", true),
    weight: read("weight", true),
    amount: read("amount", true),
    service: read("service") as string,
    replacementId: read("replacementId") as string,
  };
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseRows(records: Record<string, unknown>[]): BulkUploadShipmentPreview[] {
  if (records.length === 0) return [];

  const columnMap = buildColumnMap(Object.keys(records[0] ?? {}));

  return records
    .map((row) => mapRowWithColumns(row, columnMap))
    .filter((row): row is BulkUploadShipmentPreview => row !== null);
}

function parseCsvText(text: string): BulkUploadShipmentPreview[] {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.trim());

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const records: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvLine(lines[i]);
    const record: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ?? "";
    });
    records.push(record);
  }

  return parseRows(records);
}

async function parseExcelBuffer(buffer: Buffer): Promise<BulkUploadShipmentPreview[]> {
  let XLSX: typeof import("xlsx");
  try {
    XLSX = await import("xlsx");
  } catch {
    throw new Error(
      "Excel preview is unavailable. Save the file as CSV, or run npm install in the project."
    );
  }

  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });

  return parseRows(jsonRows);
}

export async function parseOrderImportBuffer(
  buffer: Buffer,
  fileName: string
): Promise<BulkUploadShipmentPreview[]> {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  if (extension === "csv") {
    return parseCsvText(buffer.toString("utf-8"));
  }

  if (extension === "xlsx" || extension === "xls") {
    return parseExcelBuffer(buffer);
  }

  throw new Error("Unsupported file type. Upload a CSV or Excel file.");
}
