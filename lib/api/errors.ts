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
