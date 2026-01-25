import { useEffect, useMemo, useState } from 'react'
import type { Debt, PayoffStrategy } from '../types'
import { deleteDebt, listDebts, upsertDebt } from '../lib/dataAdapter'
import { fmtMoney, uid } from '../lib/utils'
import { projectPayoff } from '../lib/calculations/payoff'
import { seedIfEmpty } from '../lib/seed'

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [editing, setEditing] = useState<Debt | null>(null)
  const [budget, setBudget] = useState<number>(250)
  const [strategy, setStrategy] = useState<PayoffStrategy>('snowball')

  async function refresh() {
    setDebts(await listDebts())
  }
  useEffect(() => { seedIfEmpty().then(refresh) }, [])

  function startNew() {
    setEditing({
      id: uid(),
      name: '',
      current_balance: 0,
      interest_rate_annual: 0,
      minimum_payment: 0,
      due_day: 1,
      auto_pay: false,
    })
  }

  async function save(d: Debt) {
    const debtToSave = { ...d, due_day: d.due_day < 1 || d.due_day > 31 ? 1 : d.due_day }
    await upsertDebt(debtToSave)
    setEditing(null)
    await refresh()
  }

  async function remove(id: string) {
    if (!confirm('Delete this debt?')) return
    await deleteDebt(id)
    await refresh()
  }

  const projection = useMemo(() => {
    if (!debts.length) return []
    return projectPayoff(debts, budget, strategy, 120)
  }, [debts, budget, strategy])

  const headline = useMemo(() => {
    if (!projection.length) return null
    const last = projection[projection.length - 1]
    return {
      months: projection.length,
      debtFreeMonth: last.monthLabel,
      interest: projection.reduce((s,r) => s + r.totals.interest, 0)
    }
  }, [projection])

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <div className="big" style={{ fontSize: 22 }}>Debts</div>
          <small>Run snowball/avalanche projections locally.</small>
        </div>
        <button className="btn" onClick={startNew}>+ Add debt</button>
      </div>

      <div className="card">
        <h3>Your debts</h3>
        {/* Desktop Table View */}
        <table className="table debts-table" aria-label="Debts table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Due</th>
              <th>APR</th>
              <th>Min</th>
              <th className="right">Balance</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {debts.map(d => (
              <tr key={d.id}>
                <td style={{ fontWeight: 850 }}>{d.name}</td>
                <td>Day {d.due_day}</td>
                <td>{d.interest_rate_annual}%</td>
                <td>{fmtMoney(d.minimum_payment)}</td>
                <td className="right">{fmtMoney(d.current_balance)}</td>
                <td className="right">
                  <button className="btn secondary" onClick={() => setEditing(d)} style={{ marginRight: 8 }}>Edit</button>
                  <button className="btn secondary" onClick={() => remove(d.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!debts.length && <tr><td colSpan={6}><small>Add your debts to see a projection.</small></td></tr>}
          </tbody>
        </table>

        {/* Mobile Card List View */}
        <div className="debts-mobile-list">
          {debts.length === 0 ? (
            <small>Add your debts to see a projection.</small>
          ) : (
            <div className="grid" style={{ gap: 12 }}>
              {debts.map(d => (
                <div key={d.id} className="card bill-card">
                  <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{d.name}</div>
                      <div style={{ fontSize: 24, fontWeight: 850, color: '#00C6B6', marginBottom: 8 }}>
                        {fmtMoney(d.current_balance)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="row" style={{ gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                    <span className="pill">Due: Day {d.due_day}</span>
                    <span className="pill">{d.interest_rate_annual}% APR</span>
                    <span className="pill">Min: {fmtMoney(d.minimum_payment)}</span>
                  </div>

                  {d.notes && (
                    <div style={{ marginBottom: 12, fontSize: 13, color: '#9fb0d0' }}>
                      {d.notes}
                    </div>
                  )}

                  <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
                    <button className="btn secondary" onClick={() => setEditing(d)}>Edit</button>
                    <button className="btn secondary" onClick={() => remove(d.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Debt Editor Modal */}
      {editing && (
        <>
          <div 
            className="bill-modal-overlay" 
            onClick={() => setEditing(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 200,
            }}
          />
          <div 
            className="bill-modal"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              background: 'var(--bg)',
              border: '1px solid rgba(34,49,84,.8)',
              borderRadius: '18px',
              padding: '20px',
              zIndex: 201,
              overflowY: 'auto',
              boxShadow: '0 10px 40px rgba(0,0,0,.5)',
            }}
            aria-label="Debt editor"
          >
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontWeight: 900, fontSize: 20 }}>
                {editing.id && debts.find(d => d.id === editing.id) ? 'Edit debt' : 'Add debt'}
              </div>
              <button 
                className="settings-close" 
                onClick={() => setEditing(null)}
                style={{
                  background: 'rgba(18,27,46,.6)',
                  border: '1px solid rgba(34,49,84,.8)',
                  borderRadius: '12px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#e8eefc',
                  fontSize: '24px',
                  lineHeight: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                ×
              </button>
            </div>

            <div className="grid" style={{ gap: 14 }}>
              <div>
                <label>Name</label>
                <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="e.g., Capital One, Affirm, Klarna" />
              </div>

              <div className="grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
                <div>
                  <label>Current balance</label>
                  <input 
                    type="number"
                    step="0.01"
                    inputMode="decimal" 
                    value={editing.current_balance || ''} 
                    onChange={e => {
                      const val = e.target.value
                      setEditing({ ...editing, current_balance: val === '' ? 0 : parseFloat(val) || 0 })
                    }} 
                  />
                </div>
                <div>
                  <label>APR %</label>
                  <input 
                    type="number"
                    step="0.01"
                    inputMode="decimal" 
                    value={editing.interest_rate_annual || ''} 
                    onChange={e => {
                      const val = e.target.value
                      setEditing({ ...editing, interest_rate_annual: val === '' ? 0 : parseFloat(val) || 0 })
                    }} 
                  />
                </div>
                <div>
                  <label>Minimum payment</label>
                  <input 
                    type="number"
                    step="0.01"
                    inputMode="decimal" 
                    value={editing.minimum_payment || ''} 
                    onChange={e => {
                      const val = e.target.value
                      setEditing({ ...editing, minimum_payment: val === '' ? 0 : parseFloat(val) || 0 })
                    }} 
                  />
                </div>
              </div>

              <div className="grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                <div>
                  <label>Due day (1-31)</label>
                  <input 
                    type="number"
                    min="1"
                    max="31"
                    inputMode="numeric" 
                    placeholder="1"
                    value={editing.due_day === 0 ? '' : (editing.due_day || '')} 
                    onChange={e => {
                      const val = e.target.value
                      if (val === '') {
                        setEditing({ ...editing, due_day: 0 })
                      } else {
                        const num = Number(val)
                        if (!isNaN(num)) {
                          const clamped = num < 1 ? 1 : num > 31 ? 31 : num
                          setEditing({ ...editing, due_day: clamped })
                        }
                      }
                    }}
                    onBlur={e => {
                      const val = e.target.value
                      if (val === '' || Number(val) < 1 || Number(val) > 31) {
                        setEditing({ ...editing, due_day: 1 })
                      }
                    }}
                  />
                </div>
              </div>

              <div className="row" style={{ marginTop: 12 }}>
                <label style={{ margin: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editing.auto_pay || false}
                    onChange={e => setEditing({ ...editing, auto_pay: e.target.checked })}
                    style={{ width: 18, height: 18, marginRight: 8 }}
                  />
                  Auto Pay
                </label>
              </div>

              <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button className="btn secondary" onClick={() => setEditing(null)}>Cancel</button>
                <button className="btn" onClick={() => save(editing)}>Save</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
