import { useState, useEffect } from 'react'
import type { Bill, Subscription, Debt } from '../types'
import { upsertBill, upsertSubscription, upsertDebt } from '../lib/dataAdapter'

type ItemForNotes = Bill | Subscription | Debt

interface BillNotesModalProps {
  bill: ItemForNotes | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function BillNotesModal({ bill, isOpen, onClose, onSave }: BillNotesModalProps) {
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (bill) {
      setNotes(bill.notes || '')
    }
  }, [bill, isOpen])

  if (!isOpen || !bill) return null

  async function handleSave() {
    if (!bill) return
    const trimmedNotes = notes.trim() || undefined
    
    // Determine type: Bill has auto_pay, Subscription has is_active but no auto_pay, Debt has neither
    if ('auto_pay' in bill) {
      // It's a Bill
      await upsertBill({ ...bill as Bill, notes: trimmedNotes })
    } else if ('is_active' in bill) {
      // It's a Subscription
      await upsertSubscription({ ...bill as Subscription, notes: trimmedNotes })
    } else {
      // It's a Debt
      await upsertDebt({ ...bill as Debt, notes: trimmedNotes })
    }
    onSave()
    onClose()
  }
  
  const itemName = bill.name

  return (
    <>
      <div
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
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '500px',
          background: 'var(--bg)',
          border: '1px solid rgba(34,49,84,.8)',
          borderRadius: '18px',
          padding: '20px',
          zIndex: 201,
          boxShadow: '0 10px 40px rgba(0,0,0,.5)',
        }}
      >
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Notes for {itemName}</div>
          <button
            className="settings-close"
            onClick={onClose}
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
            <label>Notes</label>
            <textarea
              rows={6}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add notes..."
              style={{ fontFamily: 'inherit' }}
            />
          </div>

          <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button className="btn secondary" onClick={onClose}>Cancel</button>
            <button className="btn" onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    </>
  )
}
