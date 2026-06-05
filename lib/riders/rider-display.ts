/** Only render <img> when the API returns a browser-loadable URL. */
export function isBrowserImageUrl(src: string | null | undefined): boolean {
  if (!src?.trim()) return false;
  return src.startsWith("http://") || src.startsWith("https://");
}

export function displayFileRef(value: string | null | undefined): string {
  if (!value?.trim()) return "";
  if (isBrowserImageUrl(value)) return value;
  const parts = value.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] || value;
}
