export function uid(): string {
  // good enough for local IDs; swap for uuid if you want
  return crypto.randomUUID()
}

export function monthKey(dateISO: string): string {
  // normalize to first of month
  const [y,m] = dateISO.split('-')
  return `${y}-${m}-01`
}

export function fmtMoney(n: number): string {
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  return `${sign}$${abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function clampDay(day: number): number {
  if (!Number.isFinite(day)) return 1
  return Math.min(31, Math.max(1, Math.round(day)))
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}
