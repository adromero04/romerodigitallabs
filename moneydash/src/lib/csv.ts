export type CsvRow = Record<string, string>

function splitCsvLine(line: string): string[] {
  // Handles basic quoted fields
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { // escaped quote
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out.map(s => s.trim())
}

export function parseCsv(text: string, maxRows = 5000): CsvRow[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean)
  if (!lines.length) return []
  const headers = splitCsvLine(lines[0]).map(h => h.replace(/^"|"$/g, ''))
  const rows: CsvRow[] = []
  for (let i = 1; i < lines.length && rows.length < maxRows; i++) {
    const cols = splitCsvLine(lines[i])
    const row: CsvRow = {}
    headers.forEach((h, idx) => row[h] = (cols[idx] ?? '').replace(/^"|"$/g, ''))
    rows.push(row)
  }
  return rows
}
