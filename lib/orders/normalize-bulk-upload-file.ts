/** Backend expects an empty `test` column before `Location_id` (column position). */
export const BACKEND_BULK_UPLOAD_PLACEHOLDER_COLUMN = "test";

function normalizeHeader(value: string): string {
  return String(value)
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/refrenc/g, "referenc")
    .replace(/\s+/g, " ")
    .trim();
}

function isTestHeader(header: string): boolean {
  return normalizeHeader(header) === "test";
}

function isLocationIdHeader(header: string): boolean {
  const compact = normalizeHeader(header).replace(/\s+/g, "");
  return compact === "locationid" || compact === "location_id";
}

function insertTestColumnBeforeLocation(rows: unknown[][]): unknown[][] {
  if (rows.length === 0) return rows;

  const headers = rows[0].map((cell) => String(cell ?? "").trim());
  if (headers.some(isTestHeader)) return rows;

  const locationIndex = headers.findIndex(isLocationIdHeader);
  if (locationIndex === -1) return rows;

  return rows.map((row, rowIndex) => {
    const next = [...row];
    next.splice(locationIndex, 0, rowIndex === 0 ? BACKEND_BULK_UPLOAD_PLACEHOLDER_COLUMN : "");
    return next;
  });
}

function normalizeSheetRows(rows: unknown[][]): unknown[][] {
  return insertTestColumnBeforeLocation(rows);
}

async function normalizeExcelBuffer(buffer: Buffer): Promise<Buffer> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return buffer;

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  const normalizedRows = normalizeSheetRows(rows);
  const nextSheet = XLSX.utils.aoa_to_sheet(normalizedRows);
  workbook.Sheets[sheetName] = nextSheet;

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
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

function stringifyCsvLine(values: unknown[]): string {
  return values
    .map((value) => {
      const text = String(value ?? "");
      if (/[",\n]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    })
    .join(",");
}

function normalizeCsvBuffer(buffer: Buffer): Buffer {
  const text = buffer.toString("utf-8");
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines.length === 0) return buffer;

  const rows = lines
    .filter((line, index) => index === 0 || line.trim())
    .map((line) => parseCsvLine(line));

  const normalizedRows = normalizeSheetRows(rows);
  const output = normalizedRows.map((row) => stringifyCsvLine(row)).join("\n");
  return Buffer.from(output, "utf-8");
}

/** Inserts the backend-required placeholder column before upload. */
export async function normalizeBulkUploadFileBuffer(
  buffer: Buffer,
  fileName: string
): Promise<Buffer> {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  if (extension === "csv") {
    return normalizeCsvBuffer(buffer);
  }

  if (extension === "xlsx" || extension === "xls") {
    return normalizeExcelBuffer(buffer);
  }

  return buffer;
}
