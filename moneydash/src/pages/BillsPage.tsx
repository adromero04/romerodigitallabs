import { useEffect, useMemo, useState } from 'react'
import type { Bill, Category, Frequency } from '../types'
import { clampDay, fmtMoney, uid } from '../lib/utils'
import { deleteBill, listBills, listCategoriesByType, upsertBill } from '../lib/dataAdapter'
import { seedIfEmpty, ensureCategories } from '../lib/seed'
import CustomSelect from '../components/CustomSelect'

const frequencies: Frequency[] = ['monthly','12mo','24mo','36mo','48mo']

function formatFrequency(f: Frequency): string {
  if (f === 'monthly') return 'Monthly'
  return f
}

function sortCategories(categories: Category[]): Category[] {
  const order = ['Auto', 'Rent', 'Subscription', 'Utilities', 'Other']
  return categories.sort((a, b) => {
    const indexA = order.indexOf(a.name)
    const indexB = order.indexOf(b.name)
    // If both are in the order array, sort by their position
    if (indexA !== -1 && indexB !== -1) return indexA - indexB
    // If only A is in the order array, A comes first
    if (indexA !== -1) return -1
    // If only B is in the order array, B comes first
    if (indexB !== -1) return 1
    // If neither is in the order array, maintain original order
    return 0
  })
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [editing, setEditing] = useState<Bill | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterActive, setFilterActive] = useState<string>('all')
  const [filterAutoPay, setFilterAutoPay] = useState<string>('all')
  const [filtersOpen, setFiltersOpen] = useState(false)

  async function refresh() {
    await ensureCategories()
    setBills(await listBills())
    setCategories(await listCategoriesByType('expense'))
  }

  useEffect(() => { seedIfEmpty().then(refresh) }, [])

  const filteredBills = useMemo(() => {
    return bills.filter(b => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          b.name.toLowerCase().includes(query) ||
          (b.notes && b.notes.toLowerCase().includes(query))
        if (!matchesSearch) return false
      }

      // Category filter
      if (filterCategory !== 'all') {
        if (b.category_id !== filterCategory) return false
      }

      // Active filter
      if (filterActive !== 'all') {
        if (filterActive === 'active' && !b.is_active) return false
        if (filterActive === 'inactive' && b.is_active) return false
      }

      // Auto-pay filter
      if (filterAutoPay !== 'all') {
        if (filterAutoPay === 'auto' && !b.auto_pay) return false
        if (filterAutoPay === 'manual' && b.auto_pay) return false
      }

      return true
    })
  }, [bills, searchQuery, filterCategory, filterActive, filterAutoPay])

  function startNew() {
    setEditing({
      id: uid(),
      name: '',
      amount: 0,
      due_day: 1,
      frequency: 'monthly',
      auto_pay: false,
      is_active: true,
    })
  }

  async function save(b: Bill) {
    if (!b.category_id) {
      alert('Please select a category')
      return
    }
    const billToSave = { ...b, due_day: b.due_day < 1 || b.due_day > 31 ? 1 : b.due_day }
    await upsertBill(billToSave)
    setEditing(null)
    await refresh()
  }

  async function remove(id: string) {
    if (!confirm('Delete this bill?')) return
    await deleteBill(id)
    await refresh()
  }

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return null
    return categories.find(c => c.id === categoryId)?.name
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <div className="big" style={{ fontSize: 22 }}>Bills</div>
          <small>Track recurring payments by due date.</small>
        </div>
        <button className="btn" onClick={startNew}>+ Add bill</button>
      </div>

      {/* Filters Accordion */}
      <div className="card">
        <button
          type="button"
          onClick={() => setFiltersOpen(!filtersOpen)}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'transparent',
            border: 'none',
            color: '#e8eefc',
            cursor: 'pointer',
            padding: '8px 0',
            fontSize: '16px',
            fontWeight: 700,
          }}
        >
          <span>Filters</span>
          <span style={{ 
            fontSize: '14px', 
            color: '#9fb0d0',
            transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            display: 'inline-block'
          }}>
            ▼
          </span>
        </button>
        
        {filtersOpen && (
          <div className="grid" style={{ gap: 12, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(34,49,84,.8)' }}>
            <div>
              <label>Search</label>
              <input
                type="text"
                placeholder="Search bills by name or notes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              <CustomSelect
                label="Category"
                value={filterCategory}
                onChange={setFilterCategory}
                options={[
                  { value: 'all', label: 'All Categories' },
                  ...sortCategories(categories).map(cat => ({ value: cat.id, label: cat.name }))
                ]}
              />
              
              <CustomSelect
                label="Status"
                value={filterActive}
                onChange={setFilterActive}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ]}
              />
              
              <CustomSelect
                label="Payment"
                value={filterAutoPay}
                onChange={setFilterAutoPay}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'auto', label: 'Auto-pay' },
                  { value: 'manual', label: 'Manual' }
                ]}
              />
            </div>
          </div>
        )}
      </div>

      {!filteredBills.length ? (
        <div className="card">
          <small>
            {bills.length === 0 
              ? 'No bills yet. Add one.' 
              : `No bills match your filters. (${bills.length} total)`}
          </small>
        </div>
      ) : (
        <div className="grid" style={{ gap: 12 }}>
          {filteredBills.map(b => {
            const categoryName = getCategoryName(b.category_id)
            return (
            <div key={b.id} className="card bill-card">
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{b.name}</div>
                  <div style={{ fontSize: 24, fontWeight: 850, color: '#00C6B6', marginBottom: 8 }}>
                    {fmtMoney(b.amount)}
                  </div>
                </div>
                {!b.is_active && (
                  <span className="pill" style={{ marginLeft: 12 }}>Inactive</span>
                )}
              </div>
              
              <div className="row" style={{ gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <span className="pill">
                  Due: Day {b.due_day}
                </span>
                <span className="pill">
                  {formatFrequency(b.frequency)}
                </span>
                {categoryName && (
                  <span className="pill">{categoryName}</span>
                )}
                {b.auto_pay && (
                  <span className="pill good">Auto-pay</span>
                )}
              </div>

              {b.notes && (
                <div style={{ marginBottom: 12, fontSize: 13, color: '#9fb0d0' }}>
                  {b.notes}
                </div>
              )}

              <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
                <button className="btn secondary" onClick={() => setEditing(b)}>Edit</button>
                <button className="btn secondary" onClick={() => remove(b.id)}>Delete</button>
              </div>
            </div>
            )
          })}
        </div>
      )}

      {/* Bill Editor Modal */}
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
              maxHeight: '80vh',
              background: 'var(--bg)',
              border: '1px solid rgba(34,49,84,.8)',
              borderRadius: '18px',
              zIndex: 201,
              boxShadow: '0 10px 40px rgba(0,0,0,.5)',
              display: 'flex',
              flexDirection: 'column',
            }}
            aria-label="Bill editor"
          >
            {/* Fixed Header */}
            <div className="row" style={{ 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '20px',
              borderBottom: '1px solid rgba(34,49,84,.5)',
              flexShrink: 0
            }}>
              <div style={{ fontWeight: 900, fontSize: 20 }}>
                {editing.id && bills.find(b => b.id === editing.id) ? 'Edit bill' : 'Add bill'}
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

            {/* Scrollable Body */}
            <div style={{ 
              padding: '20px', 
              overflowY: 'auto', 
              flex: 1,
              minHeight: 0
            }}>
              <div className="grid" style={{ gap: 14 }}>
                <div>
                  <label>Name</label>
                  <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="e.g., Rent" />
                </div>

                <CustomSelect
                  label="Category"
                  value={editing.category_id || ''}
                  onChange={(value) => setEditing({ ...editing, category_id: value })}
                  options={sortCategories(categories).map(cat => ({ value: cat.id, label: cat.name }))}
                />

                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                  <div>
                    <label>Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      value={editing.amount || ''}
                      onChange={e => {
                        const val = e.target.value
                        setEditing({ ...editing, amount: val === '' ? 0 : parseFloat(val) || 0 })
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
                      value={editing.due_day === 0 ? '' : (editing.due_day || '')}
                      onChange={e => {
                        const val = e.target.value
                        if (val === '') {
                          setEditing({ ...editing, due_day: 0 })
                        } else {
                          const num = Number(val)
                          if (!isNaN(num)) {
                            setEditing({ ...editing, due_day: clampDay(num) })
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
                  <div>
                    <label>Frequency</label>
                    <select value={editing.frequency} onChange={e => setEditing({ ...editing, frequency: e.target.value as any })}>
                      {frequencies.map(f => <option key={f} value={f}>{formatFrequency(f)}</option>)}
                    </select>
                  </div>
                </div>

                <div className="row" style={{ marginTop: 12, gap: 20 }}>
                  <label style={{ margin: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editing.auto_pay}
                      onChange={e => setEditing({ ...editing, auto_pay: e.target.checked })}
                      style={{ width: 18, height: 18, marginRight: 8 }}
                    />
                    Auto-pay
                  </label>
                  <label style={{ margin: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editing.is_active}
                      onChange={e => setEditing({ ...editing, is_active: e.target.checked })}
                      style={{ width: 18, height: 18, marginRight: 8 }}
                    />
                    Active
                  </label>
                </div>

                <div>
                  <label>Notes</label>
                  <textarea rows={3} value={editing.notes ?? ''} onChange={e => setEditing({ ...editing, notes: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div style={{ 
              padding: '20px', 
              borderTop: '1px solid rgba(34,49,84,.5)',
              flexShrink: 0
            }}>
              <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
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
