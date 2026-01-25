import { useEffect, useState } from 'react'
import type { Frequency, Subscription } from '../types'
import { deleteSubscription, listSubscriptions, upsertSubscription } from '../lib/dataAdapter'
import { fmtMoney, uid, todayISO } from '../lib/utils'
import { seedIfEmpty } from '../lib/seed'

const frequencies: Frequency[] = ['monthly','12mo','24mo','36mo','48mo']

function formatFrequency(f: Frequency): string {
  if (f === 'monthly') return 'Monthly'
  return f
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [editingSub, setEditingSub] = useState<Subscription | null>(null)

  async function refresh() {
    setSubscriptions(await listSubscriptions())
  }
  useEffect(() => { seedIfEmpty().then(refresh) }, [])

  function startNewSub() {
    setEditingSub({
      id: uid(),
      name: '',
      amount: 0,
      due_day: 1,
      frequency: 'monthly',
      is_active: true,
      auto_pay: false,
      start_date: todayISO(),
    })
  }

  async function saveSub(s: Subscription) {
    const subToSave = { ...s, due_day: s.due_day < 1 || s.due_day > 31 ? 1 : s.due_day }
    await upsertSubscription(subToSave)
    setEditingSub(null)
    await refresh()
  }

  async function removeSub(id: string) {
    if (!confirm('Delete this subscription?')) return
    await deleteSubscription(id)
    await refresh()
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="row subscriptions-header" style={{ justifyContent: 'space-between' }}>
        <div>
          <div className="big" style={{ fontSize: 22 }}>Subscriptions</div>
          <small>Track recurring subscription payments.</small>
        </div>
        <button className="btn subscriptions-add-btn" onClick={startNewSub}>+ Add subscription</button>
      </div>

      {!subscriptions.length ? (
        <div className="card">
          <small>No subscriptions yet. Add one.</small>
        </div>
      ) : (
        <div className="grid" style={{ gap: 12 }}>
          {subscriptions.map(s => (
            <div key={s.id} className="card" style={{ padding: '12px' }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{s.name}</div>
                  <div style={{ fontSize: 20, fontWeight: 850, color: '#00C6B6', marginBottom: 6 }}>
                    {fmtMoney(s.amount)}
                  </div>
                </div>
                {!s.is_active && (
                  <span className="pill" style={{ marginLeft: 12 }}>Inactive</span>
                )}
              </div>
              
              <div className="row" style={{ gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <span className="pill">Due: Day {s.due_day}</span>
                <span className="pill">{formatFrequency(s.frequency)}</span>
              </div>

              {s.notes && (
                <div style={{ marginBottom: 12, fontSize: 13, color: '#9fb0d0' }}>
                  {s.notes}
                </div>
              )}

              <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
                <button className="btn secondary" onClick={() => setEditingSub(s)}>Edit</button>
                <button className="btn secondary" onClick={() => removeSub(s.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subscription Editor Modal */}
      {editingSub && (
        <>
          <div 
            className="bill-modal-overlay" 
            onClick={() => setEditingSub(null)}
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
            aria-label="Subscription editor"
          >
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontWeight: 900, fontSize: 20 }}>
                {editingSub.id && subscriptions.find(s => s.id === editingSub.id) ? 'Edit subscription' : 'Add subscription'}
              </div>
              <button 
                className="settings-close" 
                onClick={() => setEditingSub(null)}
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
                <input value={editingSub.name} onChange={e => setEditingSub({ ...editingSub, name: e.target.value })} placeholder="e.g., Netflix" />
              </div>

              <div className="grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
                <div>
                  <label>Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    value={editingSub.amount || ''}
                    onChange={e => {
                      const val = e.target.value
                      setEditingSub({ ...editingSub, amount: val === '' ? 0 : parseFloat(val) || 0 })
                    }}
                  />
                </div>
                <div>
                  <label>Due day (1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    inputMode="numeric"
                    placeholder="1"
                    value={editingSub.due_day === 0 ? '' : (editingSub.due_day || '')}
                    onChange={e => {
                      const val = e.target.value
                      if (val === '') {
                        setEditingSub({ ...editingSub, due_day: 0 })
                      } else {
                        const num = Number(val)
                        if (!isNaN(num)) {
                          const clamped = num < 1 ? 1 : num > 31 ? 31 : num
                          setEditingSub({ ...editingSub, due_day: clamped })
                        }
                      }
                    }}
                    onBlur={e => {
                      const val = e.target.value
                      if (val === '' || Number(val) < 1 || Number(val) > 31) {
                        setEditingSub({ ...editingSub, due_day: 1 })
                      }
                    }}
                  />
                </div>
                <div>
                  <label>Frequency</label>
                  <select value={editingSub.frequency} onChange={e => setEditingSub({ ...editingSub, frequency: e.target.value as any })}>
                    {frequencies.map(f => <option key={f} value={f}>{formatFrequency(f)}</option>)}
                  </select>
                </div>
              </div>

              <div className="row" style={{ marginTop: 12, gap: 16 }}>
                <label style={{ margin: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editingSub.is_active}
                    onChange={e => setEditingSub({ ...editingSub, is_active: e.target.checked })}
                    style={{ width: 18, height: 18, marginRight: 8 }}
                  />
                  Active
                </label>
                <label style={{ margin: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editingSub.auto_pay || false}
                    onChange={e => setEditingSub({ ...editingSub, auto_pay: e.target.checked })}
                    style={{ width: 18, height: 18, marginRight: 8 }}
                  />
                  Auto Pay
                </label>
              </div>

              <label>Notes</label>
              <textarea rows={3} value={editingSub.notes ?? ''} onChange={e => setEditingSub({ ...editingSub, notes: e.target.value })} />

              <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button className="btn secondary" onClick={() => setEditingSub(null)}>Cancel</button>
                <button className="btn" onClick={() => saveSub(editingSub)}>Save</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
