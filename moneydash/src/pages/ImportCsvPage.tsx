import { useMemo, useState } from 'react'
import { parseCsv } from '../lib/csv'
import { addTransaction } from '../lib/dataAdapter'
import { todayISO } from '../lib/utils'
import type { Transaction } from '../types'

type ColumnMap = {
  date?: string
  description?: string
  amount?: string
}

function guessColumn(headers: string[], candidates: string[]): string | undefined {
  const lower = headers.map(h => h.toLowerCase())
  for (const c of candidates) {
    const idx = lower.findIndex(h => h.includes(c))
    if (idx >= 0) return headers[idx]
  }
  return undefined
}

export default function ImportCsvPage() {
  const [raw, setRaw] = useState<string>('')
  const rows = useMemo(() => parseCsv(raw), [raw])
  const headers = useMemo(() => (rows[0] ? Object.keys(rows[0]) : []), [rows])

  const [map, setMap] = useState<ColumnMap>({})

  // Auto-guess mapping once headers exist
  useMemo(() => {
    if (!headers.length) return null
    setMap((m) => ({
      date: m.date ?? guessColumn(headers, ['date', 'posted', 'transaction date']),
      description: m.description ?? guessColumn(headers, ['description', 'merchant', 'payee', 'name', 'details']),
      amount: m.amount ?? guessColumn(headers, ['amount', 'amt', 'debit', 'credit', 'value']),
    }))
    return null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headers.join('|')])

  async function onFile(file: File) {
    const text = await file.text()
    setRaw(text)
  }

  function parseAmount(v: string): number | null {
    const cleaned = v.replace(/[$,]/g,'').trim()
    if (!cleaned) return null
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : null
  }

  function parseDate(v: string): string | null {
    // Try yyyy-mm-dd first, else Date.parse
    const s = v.trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
    const d = new Date(s)
    if (isNaN(d.getTime())) return null
    return d.toISOString().slice(0,10)
  }

  async function importRows(limit = 200) {
    if (!map.date || !map.description || !map.amount) return alert('Map Date, Description, and Amount columns first.')
    if (!rows.length) return alert('Paste CSV text or upload a file.')

    const toImport: Omit<Transaction,'id'>[] = []
    for (const r of rows.slice(0, limit)) {
      const date = parseDate(r[map.date] ?? '')
      const desc = (r[map.description] ?? '').trim()
      const amt = parseAmount(r[map.amount] ?? '')
      if (!date || !desc || amt === null) continue

      // Banks often export debits as negative OR use separate debit/credit columns.
      // Here we assume a single amount column where expenses are negative.
      // If your CSV uses positive numbers for expenses, flip it after import.
      const type = amt < 0 ? 'expense' : 'income'
      toImport.push({ transaction_date: date, description: desc, amount: amt, type })
    }

    for (const tx of toImport) {
      await addTransaction(tx)
    }
    alert(`Imported ${toImport.length} transactions.`)
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div>
        <div className="big" style={{ fontSize: 22 }}>Import CSV</div>
        <small>Upload a bank CSV, map columns, and import transactions into local storage.</small>
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 900 }}>1) Upload file</div>
            <small>Or paste CSV text below.</small>
          </div>
          <input type="file" accept=".csv,text/csv" onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onFile(f)
          }} />
        </div>

        <label>Paste CSV</label>
        <textarea rows={8} value={raw} onChange={e => setRaw(e.target.value)} placeholder="Paste CSV content here…" />

        <div className="row" style={{ justifyContent: 'space-between', marginTop: 10 }}>
          <div className="row">
            <span className="pill">Rows: {rows.length}</span>
            <span className="pill">Headers: {headers.length}</span>
          </div>
          <button className="btn secondary" onClick={() => setRaw('')}>Clear</button>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 900 }}>2) Map columns</div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginTop: 10 }}>
          <div>
            <label>Date</label>
            <select value={map.date ?? ''} onChange={e => setMap({ ...map, date: e.target.value || undefined })}>
              <option value="">—</option>
              {headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div>
            <label>Description</label>
            <select value={map.description ?? ''} onChange={e => setMap({ ...map, description: e.target.value || undefined })}>
              <option value="">—</option>
              {headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div>
            <label>Amount</label>
            <select value={map.amount ?? ''} onChange={e => setMap({ ...map, amount: e.target.value || undefined })}>
              <option value="">—</option>
              {headers.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>

        <div className="row" style={{ justifyContent: 'space-between', marginTop: 10 }}>
          <small>
            Tip: many banks export expenses as negative numbers. If yours uses positive debits, we can add a “flip sign” toggle.
          </small>
          <button className="btn" onClick={() => importRows(500)}>Import up to 500</button>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 900 }}>3) Preview (first 5 rows)</div>
        {!rows.length ? <small>No rows yet.</small> : (
          <table className="table" aria-label="CSV preview">
            <thead>
              <tr>
                {headers.slice(0, 6).map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 5).map((r, rowIdx) => (
                <tr key={rowIdx}>
                  {headers.slice(0, 6).map((h, colIdx) => <td key={`${rowIdx}-${colIdx}-${h}`}><small>{r[h]}</small></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
