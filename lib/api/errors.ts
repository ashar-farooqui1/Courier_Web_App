export function parseApiErrorMessage(
  body: unknown,
  fallback = "Request failed"
): string {
  if (typeof body === "string") {
    try {
      return parseApiErrorMessage(JSON.parse(body), fallback);
    } catch {
      return body || fallback;
    }
  }

  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;

    if (typeof record.message === "string" && record.message) {
      return record.message;
    }

    if (typeof record.Message === "string" && record.Message) {
      return record.Message;
    }

    if (typeof record.title === "string" && record.title) {
      const validationMessages = extractValidationMessages(record.errors);
      if (validationMessages.length > 0) {
        return validationMessages.join(" ");
      }
      return record.title;
    }

    if (typeof record.error === "string" && record.error) {
      try {
        return parseApiErrorMessage(JSON.parse(record.error), record.error);
      } catch {
        return record.error;
      }
    }
  }

  return fallback;
}

function extractValidationMessages(errors: unknown): string[] {
  if (!errors || typeof errors !== "object") return [];

  return Object.values(errors as Record<string, unknown>).flatMap((value) => {
    if (typeof value === "string" && value) return [value];
    if (Array.isArray(value)) {
      return value.filter((entry): entry is string => typeof entry === "string" && Boolean(entry));
    }
    return [];
  });
}
