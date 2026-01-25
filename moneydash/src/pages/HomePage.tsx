import { useEffect, useMemo, useState } from 'react'
import { seedIfEmpty } from '../lib/seed'
import { 
  listBills, 
  listDebts, 
  listSubscriptions, 
  listTransactions, 
  markBillPaid, 
  unmarkBillPaid, 
  isBillPaidThisMonth,
  markSubscriptionPaid,
  unmarkSubscriptionPaid,
  isSubscriptionPaidThisMonth,
  markDebtPaid,
  unmarkDebtPaid,
  isDebtPaidThisMonth,
  upsertBill,
  upsertSubscription,
  upsertDebt
} from '../lib/dataAdapter'
import { useAsync } from '../hooks/useAsync'
import { fmtMoney, todayISO } from '../lib/utils'
import BillsCalendar from '../components/BillsCalendar'
import BillNotesModal from '../components/BillNotesModal'
import ViewToggle from '../components/ViewToggle'
import type { Bill, Subscription, Debt } from '../types'

type ItemForNotes = Bill | Subscription | Debt

function monthISOFromToday() {
  const t = todayISO()
  return t.slice(0,7) // yyyy-mm
}

export default function HomePage() {
  const [monthISO] = useState(monthISOFromToday())
  const [billsView, setBillsView] = useState<'table' | 'calendar'>('table')
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())
  const [notesModalItem, setNotesModalItem] = useState<ItemForNotes | null>(null)
  const [paidStatus, setPaidStatus] = useState<Record<string, boolean>>({})

  useEffect(() => { seedIfEmpty() }, [])

  const billsQ = useAsync(() => listBills(), [])
  const debtsQ = useAsync(() => listDebts(), [])
  const subscriptionsQ = useAsync(() => listSubscriptions(), [])
  const txQ = useAsync(() => listTransactions(monthISO), [monthISO])

  // Load paid status for all items
  useEffect(() => {
    async function loadPaidStatus() {
      const status: Record<string, boolean> = {}
      
      // Load bill paid status
      if (billsQ.data) {
        for (const bill of billsQ.data) {
          status[bill.id] = await isBillPaidThisMonth(bill.id)
        }
      }
      
      // Load subscription paid status
      if (subscriptionsQ.data) {
        for (const sub of subscriptionsQ.data) {
          status[sub.id] = await isSubscriptionPaidThisMonth(sub.id)
        }
      }
      
      // Load debt paid status
      if (debtsQ.data) {
        for (const debt of debtsQ.data) {
          status[debt.id] = await isDebtPaidThisMonth(debt.id)
        }
      }
      
      setPaidStatus(status)
    }
    if (billsQ.data || subscriptionsQ.data || debtsQ.data) {
      loadPaidStatus()
    }
  }, [billsQ.data, subscriptionsQ.data, debtsQ.data])

  const totals = useMemo(() => {
    const tx = txQ.data ?? []
    const income = tx.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0)
    const expense = tx.filter(t => t.amount < 0).reduce((s,t) => s + t.amount, 0)
    return { income, expense, net: income + expense }
  }, [txQ.data])

  type UpcomingItem = {
    id: string
    name: string
    amount: number
    due_day: number
    type: 'bill' | 'subscription' | 'debt'
    delta: number
    bill?: Bill
    subscription?: Subscription
    debt?: Debt
  }

  const upcomingBills = useMemo(() => {
    const bills = billsQ.data ?? []
    const subscriptions = subscriptionsQ.data ?? []
    const debts = debtsQ.data ?? []
    const today = new Date()
    const day = today.getDate()
    
    const items: UpcomingItem[] = []
    
    // Add bills
    bills
      .filter(b => b.is_active)
      .forEach(b => {
        const delta = b.due_day >= day ? (b.due_day - day) : ((31 - day) + b.due_day)
        items.push({
          id: b.id,
          name: b.name,
          amount: b.amount,
          due_day: b.due_day,
          type: 'bill',
          delta,
          bill: b
        })
      })
    
    // Add subscriptions
    subscriptions
      .filter(s => s.is_active)
      .forEach(s => {
        const delta = s.due_day >= day ? (s.due_day - day) : ((31 - day) + s.due_day)
        items.push({
          id: s.id,
          name: s.name,
          amount: s.amount,
          due_day: s.due_day,
          type: 'subscription',
          delta,
          subscription: s
        })
      })
    
    // Add debts
    debts.forEach(d => {
      const delta = d.due_day >= day ? (d.due_day - day) : ((31 - day) + d.due_day)
      items.push({
        id: d.id,
        name: d.name,
        amount: d.minimum_payment,
        due_day: d.due_day,
        type: 'debt',
        delta,
        debt: d
      })
    })
    
    return items
      .sort((a,b) => a.delta - b.delta)
      .slice(0, 10)
  }, [billsQ.data, subscriptionsQ.data, debtsQ.data])

  const upcomingSubscriptions = useMemo(() => {
    const subs = subscriptionsQ.data ?? []
    const today = new Date()
    const day = today.getDate()
    return subs
      .filter(s => s.is_active)
      .map(s => {
        const delta = s.due_day >= day ? (s.due_day - day) : ((31 - day) + s.due_day)
        return {...s, delta}
      })
      .sort((a,b) => a.delta - b.delta)
      .slice(0,5)
  }, [subscriptionsQ.data])

  async function handleTogglePaid(item: UpcomingItem) {
    const isPaid = paidStatus[item.id] || false
    if (item.type === 'bill' && item.bill) {
      if (isPaid) {
        await unmarkBillPaid(item.id)
      } else {
        await markBillPaid(item.id)
      }
      billsQ.refresh()
    } else if (item.type === 'subscription' && item.subscription) {
      if (isPaid) {
        await unmarkSubscriptionPaid(item.id)
      } else {
        await markSubscriptionPaid(item.id)
      }
      subscriptionsQ.refresh()
    } else if (item.type === 'debt' && item.debt) {
      if (isPaid) {
        await unmarkDebtPaid(item.id)
      } else {
        await markDebtPaid(item.id)
      }
      debtsQ.refresh()
    }
    setPaidStatus(prev => ({ ...prev, [item.id]: !isPaid }))
  }

  async function handleNotesSave() {
    billsQ.refresh()
    subscriptionsQ.refresh()
    debtsQ.refresh()
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="grid cards">
        <div className="card" style={{ gridColumn: 'span 12' }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Upcoming bills</h3>
            <ViewToggle value={billsView} onChange={setBillsView} />
          </div>
          {billsQ.loading ? <small>Loading…</small> : (
            billsView === 'table' ? (
              <>
                {/* Desktop Table View */}
                <table className="table upcoming-bills-table" aria-label="Upcoming bills">
                  <thead>
                    <tr>
                      <th>Bill</th>
                      <th>Due</th>
                      <th className="right">Amount</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingBills.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{item.name}</span>
                            <span className="pill" style={{ fontSize: '10px', padding: '2px 6px' }}>
                              {item.type === 'bill' ? 'Bill' : item.type === 'subscription' ? 'Sub' : 'Debt'}
                            </span>
                            {((item.bill?.auto_pay) || (item.subscription?.auto_pay) || (item.debt?.auto_pay)) && (
                              <span className="pill good" style={{ fontSize: '10px', padding: '2px 6px' }}>
                                Auto-pay
                              </span>
                            )}
                          </div>
                        </td>
                        <td>Day {item.due_day}</td>
                        <td className="right">{fmtMoney(item.amount)}</td>
                        <td className="right">
                          <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
                            <label style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={paidStatus[item.id] || false}
                                onChange={() => handleTogglePaid(item)}
                                style={{ width: 18, height: 18, cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: '12px', color: paidStatus[item.id] ? '#22c55e' : 'var(--muted)' }}>
                                Paid
                              </span>
                            </label>
                            <button
                              className="btn secondary"
                              onClick={() => {
                                if (item.bill) setNotesModalItem(item.bill)
                                else if (item.subscription) setNotesModalItem(item.subscription)
                                else if (item.debt) setNotesModalItem(item.debt)
                              }}
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              Notes
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Card List View */}
                <div className="upcoming-bills-mobile-list">
                  {upcomingBills.map(item => (
                    <div key={item.id} className="card" style={{ marginBottom: 12 }}>
                      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <div style={{ fontWeight: 800, fontSize: 18 }}>{item.name}</div>
                            <span className="pill" style={{ fontSize: '10px', padding: '2px 6px' }}>
                              {item.type === 'bill' ? 'Bill' : item.type === 'subscription' ? 'Sub' : 'Debt'}
                            </span>
                            {((item.bill?.auto_pay) || (item.subscription?.auto_pay) || (item.debt?.auto_pay)) && (
                              <span className="pill good" style={{ fontSize: '10px', padding: '2px 6px' }}>
                                Auto-pay
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 24, fontWeight: 850, color: '#00C6B6', marginBottom: 8 }}>
                            {fmtMoney(item.amount)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="row" style={{ gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                        <span className="pill">Due: Day {item.due_day}</span>
                      </div>

                      <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
                        <label style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={paidStatus[item.id] || false}
                            onChange={() => handleTogglePaid(item)}
                            style={{ width: 18, height: 18, cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '12px', color: paidStatus[item.id] ? '#22c55e' : 'var(--muted)' }}>
                            Paid
                          </span>
                        </label>
                        <button
                          className="btn secondary"
                          onClick={() => {
                            if (item.bill) setNotesModalItem(item.bill)
                            else if (item.subscription) setNotesModalItem(item.subscription)
                            else if (item.debt) setNotesModalItem(item.debt)
                          }}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Notes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <BillsCalendar
                bills={billsQ.data ?? []}
                subscriptions={subscriptionsQ.data ?? []}
                debts={debtsQ.data ?? []}
                currentMonth={calendarMonth}
                onMonthChange={setCalendarMonth}
              />
            )
          )}
        </div>

        <div className="card home-subscriptions-card">
          <h3>Subscriptions</h3>
          {subscriptionsQ.loading ? <small>Loading…</small> : (
            <>
              {upcomingSubscriptions.map(s => (
                <div key={s.id} className="row" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(34,49,84,.55)' }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{s.name}</div>
                    <small>Day {s.due_day} · {s.frequency === 'monthly' ? 'Monthly' : s.frequency}</small>
                  </div>
                  <div style={{ fontWeight: 900, color: '#00C6B6' }}>{fmtMoney(s.amount)}</div>
                </div>
              ))}
              {!upcomingSubscriptions.length && (
                <small>No active subscriptions.</small>
              )}
            </>
          )}
        </div>

        <div className="card home-debts-card">
          <h3>Debts snapshot</h3>
          {debtsQ.loading ? <small>Loading…</small> : (
            <>
              {(debtsQ.data ?? []).slice(0,5).map(d => (
                <div key={d.id} className="row" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(34,49,84,.55)' }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{d.name}</div>
                    <small>{d.interest_rate_annual}% APR · Min {fmtMoney(d.minimum_payment)}</small>
                  </div>
                  <div style={{ fontWeight: 900 }}>{fmtMoney(d.current_balance)}</div>
                </div>
              ))}
              <div style={{ marginTop: 10 }}>
                <small>Tip: Start on the Debts tab to generate a payoff projection.</small>
              </div>
            </>
          )}
        </div>

      </div>

      

      <BillNotesModal
        bill={notesModalItem}
        isOpen={!!notesModalItem}
        onClose={() => setNotesModalItem(null)}
        onSave={handleNotesSave}
      />
    </div>
  )
}
