/** Formats API ISO date for table display; hides sentinel empty dates. */
export function formatArrivalAt(value: string): string {
  if (!value || value.startsWith('0001-')) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatStatusLabel(status: string): string {
  if (!status) return '—';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}
