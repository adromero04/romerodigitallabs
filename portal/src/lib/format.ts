export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(Number(amount));
}

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || Number.isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function truncate(text: string, max = 140): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1)}…`;
}
