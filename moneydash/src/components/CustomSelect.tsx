import { useState, useRef, useEffect } from 'react'

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
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom')
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const ignoreNextClickRef = useRef(false)

  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (ignoreNextClickRef.current) {
        ignoreNextClickRef.current = false
        return
      }
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      // Check if dropdown would go off screen
      if (containerRef.current && dropdownRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top
        const dropdownHeight = 300 // approximate max height
        
        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
          setPosition('top')
        } else {
          setPosition('bottom')
        }
      }
      
      // Delay adding listener to avoid immediate closure
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('touchstart', handleClickOutside)
      }, 100)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('touchstart', handleClickOutside)
      }
    }
  }, [isOpen])

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <label style={{ fontSize: 12, color: '#9fb0d0', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          ignoreNextClickRef.current = true
          setIsOpen(!isOpen)
        }}
        style={{
          width: '100%',
          padding: '14px 16px',
          borderRadius: '14px',
          border: '1px solid rgba(34,49,84,.9)',
          background: 'rgba(7,11,20,.5)',
          color: '#e8eefc',
          fontSize: '16px',
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '48px',
        }}
      >
        <span>{selectedOption ? selectedOption.label : 'Select'}</span>
        <span style={{ fontSize: '12px', color: '#9fb0d0' }}>▼</span>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: position === 'bottom' ? 'calc(100% + 8px)' : 'auto',
            bottom: position === 'top' ? 'calc(100% + 8px)' : 'auto',
            left: 0,
            right: 0,
            background: 'rgba(18,27,46,.98)',
            border: '1px solid rgba(34,49,84,.9)',
            borderRadius: '14px',
            boxShadow: '0 10px 30px rgba(0,0,0,.5)',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto',
            backdropFilter: 'blur(10px)',
          }}
        >
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onChange(option.value)
                setIsOpen(false)
              }}
              style={{
                width: '100%',
                padding: '16px 18px',
                border: 'none',
                background: value === option.value ? 'rgba(0,198,182,.2)' : 'transparent',
                color: value === option.value ? '#00C6B6' : '#e8eefc',
                fontSize: '16px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: '52px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.background = 'rgba(34,49,84,.5)'
                }
              }}
              onMouseLeave={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <span style={{ fontSize: '18px', color: '#00C6B6' }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
