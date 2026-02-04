interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  label: string
}

export default function CustomSelect({ value, onChange, options, label }: CustomSelectProps) {
  const selectedOption = options.find(opt => opt.value === value)
  
  // Debug: confirm new card-based component is loading
  console.log('CustomSelect (card-based) rendering:', { label, optionsCount: options.length })

  return (
    <div style={{ width: '100%' }}>
      <label style={{ fontSize: 12, color: '#9fb0d0', display: 'block', marginBottom: 12 }}>
        {label}
      </label>
      {options.length === 0 ? (
        <div style={{ 
          padding: '16px', 
          textAlign: 'center', 
          color: '#9fb0d0', 
          fontSize: '14px',
          background: 'rgba(7,11,20,.3)',
          borderRadius: '14px',
          border: '1px solid rgba(34,49,84,.5)'
        }}>
          No options available
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '10px',
        }}>
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              style={{
                padding: '14px 16px',
                borderRadius: '14px',
                border: value === option.value 
                  ? '2px solid #00C6B6' 
                  : '1px solid rgba(34,49,84,.9)',
                background: value === option.value
                  ? 'rgba(0,198,182,.15)'
                  : 'rgba(7,11,20,.5)',
                color: value === option.value ? '#00C6B6' : '#e8eefc',
                fontSize: '15px',
                fontWeight: value === option.value ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                position: 'relative',
                minHeight: '52px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.background = 'rgba(34,49,84,.6)'
                  e.currentTarget.style.borderColor = 'rgba(34,49,84,1)'
                }
              }}
              onMouseLeave={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.background = 'rgba(7,11,20,.5)'
                  e.currentTarget.style.borderColor = 'rgba(34,49,84,.9)'
                }
              }}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  right: '8px',
                  fontSize: '14px',
                  color: '#00C6B6',
                }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
