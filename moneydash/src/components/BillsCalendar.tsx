import { useMemo } from 'react'
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

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
        {weekDays.map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
        {calendarData.map((day, idx) => (
          <div
            key={idx}
            className={`calendar-day ${!day.isCurrentMonth ? 'calendar-day-other' : ''} ${day.isToday ? 'calendar-day-today' : ''}`}
          >
            {day.isCurrentMonth && (
              <>
                <div className="calendar-day-number">{day.date}</div>
                {day.items.length > 0 && (
                  <div className="calendar-bills">
                    {day.items.slice(0, 2).map(item => (
                      <div
                        key={item.id}
                        className="calendar-bill-item"
                        title={`${item.name}: ${fmtMoney(item.amount)}`}
                      >
                        <div className="calendar-bill-name">{item.name}</div>
                        <div className="calendar-bill-amount">{fmtMoney(item.amount)}</div>
                      </div>
                    ))}
                    {day.items.length > 2 && (
                      <div className="calendar-bill-more">
                        +{day.items.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
