import { useMemo, useState } from 'react'
import type { Bill, Subscription, Debt } from '../types'
import { fmtMoney } from '../lib/utils'

interface CalendarItem {
  id: string
  name: string
  amount: number
  due_day: number
  type: 'bill' | 'subscription' | 'debt'
}

interface BillsCalendarProps {
  bills: Bill[]
  subscriptions: Subscription[]
  debts: Debt[]
  currentMonth: Date
  onMonthChange: (date: Date) => void
}

export default function BillsCalendar({ bills, subscriptions, debts, currentMonth, onMonthChange }: BillsCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [showDayModal, setShowDayModal] = useState(false)
  
  const activeBills = bills.filter(b => b.is_active)
  const activeSubscriptions = subscriptions.filter(s => s.is_active)
  
  // Combine all items into a unified list
  const allItems: CalendarItem[] = useMemo(() => {
    const items: CalendarItem[] = []
    activeBills.forEach(b => {
      items.push({
        id: b.id,
        name: b.name,
        amount: b.amount,
        due_day: b.due_day,
        type: 'bill'
      })
    })
    activeSubscriptions.forEach(s => {
      items.push({
        id: s.id,
        name: s.name,
        amount: s.amount,
        due_day: s.due_day,
        type: 'subscription'
      })
    })
    debts.forEach(d => {
      items.push({
        id: d.id,
        name: d.name,
        amount: d.minimum_payment,
        due_day: d.due_day,
        type: 'debt'
      })
    })
    return items
  }, [activeBills, activeSubscriptions, debts])

  const today = useMemo(() => new Date(), [])
  const isCurrentMonth = today.getMonth() === currentMonth.getMonth() && 
                         today.getFullYear() === currentMonth.getFullYear()

  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay() // 0 = Sunday, 6 = Saturday

    // Create calendar grid
    const days: Array<{
      date: number
      items: CalendarItem[]
      isCurrentMonth: boolean
      isToday: boolean
    }> = []

    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: 0, items: [], isCurrentMonth: false, isToday: false })
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      // Find all items due on this day
      const itemsForDay = allItems.filter(item => item.due_day === day)
      const isToday = isCurrentMonth && day === today.getDate()
      days.push({ date: day, items: itemsForDay, isCurrentMonth: true, isToday })
    }

    return days
  }, [currentMonth, allItems, isCurrentMonth, today])

  const monthLabel = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    onMonthChange(newDate)
  }

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  const handleDayClick = (dayDate: number, items: CalendarItem[]) => {
    if (items.length > 0) {
      setSelectedDay(dayDate)
      setShowDayModal(true)
    }
  }

  const selectedDayItems = useMemo(() => {
    if (!selectedDay) return []
    return allItems.filter(item => item.due_day === selectedDay)
  }, [selectedDay, allItems])

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button
          className="btn secondary"
          onClick={() => navigateMonth('prev')}
          style={{ padding: '6px 12px', fontSize: '14px' }}
        >
          ←
        </button>
        <div style={{ fontWeight: 700, fontSize: '16px' }}>{monthLabel}</div>
        <button
          className="btn secondary"
          onClick={() => navigateMonth('next')}
          style={{ padding: '6px 12px', fontSize: '14px' }}
        >
          →
        </button>
      </div>

      <div className="calendar-grid">
        {weekDays.map((day, idx) => (
          <div key={idx} className="calendar-weekday">
            {day}
          </div>
        ))}
        {calendarData.map((day, idx) => (
          <div
            key={idx}
            className={`calendar-day ${!day.isCurrentMonth ? 'calendar-day-other' : ''} ${day.isToday ? 'calendar-day-today' : ''} ${day.items.length > 0 ? 'calendar-day-clickable' : ''}`}
            onClick={() => day.isCurrentMonth && handleDayClick(day.date, day.items)}
            style={{ cursor: day.items.length > 0 ? 'pointer' : 'default' }}
          >
            {day.isCurrentMonth && (
              <>
                <div className="calendar-day-number">{day.date}</div>
                {day.items.length > 0 && (
                  <div className="calendar-dots">
                    {day.items.slice(0, 5).map((item, itemIdx) => (
                      <div
                        key={item.id}
                        className="calendar-dot"
                        title={`${item.name}: ${fmtMoney(item.amount)}`}
                      />
                    ))}
                    {day.items.length > 5 && (
                      <div className="calendar-dot-more">+{day.items.length - 5}</div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Day Details Modal */}
      {showDayModal && selectedDay && (
        <>
          <div 
            className="bill-modal-overlay" 
            onClick={() => setShowDayModal(false)}
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
              maxWidth: '500px',
              maxHeight: '80vh',
              background: 'var(--bg)',
              border: '1px solid rgba(34,49,84,.8)',
              borderRadius: '18px',
              zIndex: 201,
              boxShadow: '0 10px 40px rgba(0,0,0,.5)',
              display: 'flex',
              flexDirection: 'column',
            }}
            aria-label="Day details"
          >
            {/* Fixed Header */}
            <div style={{ 
              padding: '20px',
              borderBottom: '1px solid rgba(34,49,84,.5)',
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontWeight: 900, fontSize: 20 }}>
                {monthLabel.split(' ')[0]} {selectedDay}, {monthLabel.split(' ')[1]}
              </div>
              <button 
                onClick={() => setShowDayModal(false)}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedDayItems.map(item => (
                  <div
                    key={item.id}
                    style={{
                      padding: '12px',
                      background: 'rgba(0,198,182,.1)',
                      border: '1px solid rgba(0,198,182,.3)',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '4px'
                    }}>
                      <div style={{ fontWeight: 600, color: 'var(--accent)' }}>
                        {item.name}
                      </div>
                      <div style={{ 
                        fontSize: '11px', 
                        padding: '2px 8px', 
                        background: 'rgba(0,198,182,.2)',
                        borderRadius: '4px',
                        textTransform: 'capitalize'
                      }}>
                        {item.type}
                      </div>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
                      {fmtMoney(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
