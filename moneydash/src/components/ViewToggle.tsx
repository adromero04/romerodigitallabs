import { TableIcon, CalendarIcon } from './Icons'

interface ViewToggleProps {
  value: 'table' | 'calendar'
  onChange: (value: 'table' | 'calendar') => void
}

export default function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(18,27,46,.6)',
        border: '1px solid rgba(34,49,84,.8)',
        borderRadius: '12px',
        padding: '4px',
        gap: '4px',
        position: 'relative',
      }}
    >
      <button
        type="button"
        onClick={() => onChange('table')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 10px',
          borderRadius: '8px',
          border: 'none',
          background: value === 'table' ? 'rgba(0,198,182,.2)' : 'transparent',
          color: value === 'table' ? '#00C6B6' : '#9fb0d0',
          cursor: 'pointer',
          transition: 'all 0.2s',
          minWidth: '36px',
          minHeight: '36px',
        }}
        title="Table view"
      >
        <TableIcon />
      </button>
      <button
        type="button"
        onClick={() => onChange('calendar')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 10px',
          borderRadius: '8px',
          border: 'none',
          background: value === 'calendar' ? 'rgba(0,198,182,.2)' : 'transparent',
          color: value === 'calendar' ? '#00C6B6' : '#9fb0d0',
          cursor: 'pointer',
          transition: 'all 0.2s',
          minWidth: '36px',
          minHeight: '36px',
        }}
        title="Calendar view"
      >
        <CalendarIcon />
      </button>
    </div>
  )
}
