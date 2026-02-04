import { useState, useEffect, useMemo } from 'react'
import type { Debt } from '../types'
import { fmtMoney } from '../lib/utils'

interface PaymentImpactModalProps {
  debt: Debt
  onClose: () => void
}

export default function PaymentImpactModal({ debt, onClose }: PaymentImpactModalProps) {
  const [paymentAmount, setPaymentAmount] = useState(debt.minimum_payment)
  const [isDragging, setIsDragging] = useState(false)

  // Calculate recommended payment (pays off in ~24 months)
  const recommendedPayment = useMemo(() => {
    const monthlyInterestRate = debt.interest_rate_annual / 100 / 12
    const targetMonths = 24
    const recommended = (debt.current_balance * monthlyInterestRate) / 
                       (1 - Math.pow(1 + monthlyInterestRate, -targetMonths))
    return Math.max(debt.minimum_payment, Math.round(recommended * 100) / 100)
  }, [debt])

  // Calculate aggressive payment (pays off in ~12 months)
  const aggressivePayment = useMemo(() => {
    const monthlyInterestRate = debt.interest_rate_annual / 100 / 12
    const targetMonths = 12
    const aggressive = (debt.current_balance * monthlyInterestRate) / 
                      (1 - Math.pow(1 + monthlyInterestRate, -targetMonths))
    return Math.max(recommendedPayment, Math.round(aggressive * 100) / 100)
  }, [debt, recommendedPayment])

  // Calculate payment impact
  const impact = useMemo(() => {
    const balance = debt.current_balance
    const apr = debt.interest_rate_annual
    const monthlyRate = apr / 100 / 12
    
    // Monthly interest on current balance
    const monthlyInterest = balance * monthlyRate
    
    // Calculate months to payoff
    let monthsToPayoff = 0
    let totalInterest = 0
    
    if (paymentAmount <= monthlyInterest) {
      // Payment doesn't cover interest - will never pay off
      monthsToPayoff = 999
      totalInterest = 999999
    } else {
      let remainingBalance = balance
      while (remainingBalance > 0 && monthsToPayoff < 1000) {
        const interest = remainingBalance * monthlyRate
        const principal = paymentAmount - interest
        remainingBalance -= principal
        totalInterest += interest
        monthsToPayoff++
      }
    }
    
    // Calculate minimum payment scenario for comparison
    let minMonthsToPayoff = 0
    let minTotalInterest = 0
    let minRemainingBalance = balance
    
    while (minRemainingBalance > 0 && minMonthsToPayoff < 1000) {
      const interest = minRemainingBalance * monthlyRate
      const principal = debt.minimum_payment - interest
      if (principal <= 0) break
      minRemainingBalance -= principal
      minTotalInterest += interest
      minMonthsToPayoff++
    }
    
    const interestSaved = minTotalInterest - totalInterest
    
    // Calculate payoff date
    const payoffDate = new Date()
    payoffDate.setMonth(payoffDate.getMonth() + monthsToPayoff)
    
    return {
      monthlyInterest,
      monthsToPayoff,
      payoffDate,
      totalInterest,
      interestSaved,
      minTotalInterest
    }
  }, [debt, paymentAmount])

  // Format payoff date
  const formatPayoffDate = (date: Date) => {
    if (impact.monthsToPayoff >= 999) return 'Never'
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  // Calculate percentage for radial display (0-100)
  const maxPayment = Math.max(aggressivePayment * 1.5, debt.current_balance * 0.2)
  const percentage = Math.min((paymentAmount / maxPayment) * 100, 100)
  const minPercentage = (debt.minimum_payment / maxPayment) * 100

  // Helper to get coordinates from mouse or touch event
  const getCoordinates = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }
    }
    return { clientX: (e as MouseEvent).clientX, clientY: (e as MouseEvent).clientY }
  }

  // Calculate payment from coordinates
  const calculatePaymentFromCoords = (clientX: number, clientY: number) => {
    const wheel = document.getElementById('payment-wheel')
    if (!wheel) return
    
    const rect = wheel.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = clientX - centerX
    const dy = clientY - centerY
    const angle = Math.atan2(dy, dx)
    const normalizedAngle = (angle + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI)
    const percent = (normalizedAngle / (2 * Math.PI)) * 100
    const newPayment = Math.max(debt.minimum_payment, (percent / 100) * maxPayment)
    setPaymentAmount(Math.round(newPayment * 100) / 100)
  }

  // Handle dragging on the radial slider
  const handleStart = () => setIsDragging(true)
  
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return
      e.preventDefault()
      
      const coords = getCoordinates(e)
      calculatePaymentFromCoords(coords.clientX, coords.clientY)
    }
    
    const handleEnd = () => setIsDragging(false)
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMove as EventListener)
      document.addEventListener('mouseup', handleEnd)
      document.addEventListener('touchmove', handleMove as EventListener, { passive: false })
      document.addEventListener('touchend', handleEnd)
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMove as EventListener)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleMove as EventListener)
      document.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging, debt.minimum_payment, maxPayment])

  const isSignificantSavings = impact.interestSaved > 50

  return (
    <>
      <div 
        className="bill-modal-overlay" 
        onClick={onClose}
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
        aria-label="Payment Impact"
      >
        {/* Fixed Header */}
        <div style={{ 
          padding: '20px',
          borderBottom: '1px solid rgba(34,49,84,.5)',
          flexShrink: 0
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '12px'
          }}>
            <div style={{ fontWeight: 900, fontSize: 20 }}>
              {debt.name}
            </div>
            <button 
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
          <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
            <div>
              <span style={{ color: 'var(--muted)' }}>Balance: </span>
              <span style={{ fontWeight: 600 }}>{fmtMoney(debt.current_balance)}</span>
            </div>
            <div>
              <span style={{ color: 'var(--muted)' }}>APR: </span>
              <span style={{ fontWeight: 600 }}>{debt.interest_rate_annual}%</span>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div style={{ 
          padding: '30px 20px', 
          overflowY: 'auto', 
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '30px'
        }}>
          {/* Radial Wheel */}
          <div style={{ position: 'relative', width: '240px', height: '240px' }} id="payment-wheel">
            <svg width="240" height="240" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background circle */}
              <circle
                cx="120"
                cy="120"
                r="100"
                fill="none"
                stroke="rgba(34,49,84,.5)"
                strokeWidth="20"
              />
              {/* Minimum payment marker */}
              <circle
                cx="120"
                cy="120"
                r="100"
                fill="none"
                stroke="rgba(159,176,208,.3)"
                strokeWidth="20"
                strokeDasharray={`${minPercentage * 6.28} ${628 - minPercentage * 6.28}`}
              />
              {/* Current payment */}
              <circle
                cx="120"
                cy="120"
                r="100"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="20"
                strokeDasharray={`${percentage * 6.28} ${628 - percentage * 6.28}`}
                style={{ transition: isDragging ? 'none' : 'stroke-dasharray 0.3s ease' }}
              />
            </svg>
            
            {/* Drag handle */}
            <div
              onMouseDown={handleStart}
              onTouchStart={handleStart}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '30px',
                height: '30px',
                background: 'var(--accent)',
                border: '3px solid var(--bg)',
                borderRadius: '50%',
                cursor: 'grab',
                touchAction: 'none',
                transform: `translate(-50%, -50%) rotate(${(percentage / 100) * 360}deg) translateY(-100px)`,
                boxShadow: '0 2px 8px rgba(0,198,182,.5)',
                transition: isDragging ? 'none' : 'transform 0.3s ease',
              }}
            >
              {isDragging && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '40px',
                  height: '40px',
                  background: 'rgba(0,198,182,.2)',
                  borderRadius: '50%',
                  animation: 'pulse 1s infinite'
                }} />
              )}
            </div>

            {/* Center display */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--accent)' }}>
                {fmtMoney(paymentAmount)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                per month
              </div>
            </div>
          </div>

          {/* Impact Stats */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ 
              padding: '12px 16px', 
              background: 'rgba(18,27,46,.5)',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--muted)', fontSize: '14px' }}>Monthly Interest</span>
              <span style={{ fontWeight: 700, fontSize: '16px' }}>{fmtMoney(impact.monthlyInterest)}</span>
            </div>
            
            <div style={{ 
              padding: '12px 16px', 
              background: 'rgba(18,27,46,.5)',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--muted)', fontSize: '14px' }}>Payoff Date</span>
              <span style={{ fontWeight: 700, fontSize: '16px' }}>{formatPayoffDate(impact.payoffDate)}</span>
            </div>
            
            <div style={{ 
              padding: '12px 16px', 
              background: isSignificantSavings ? 'rgba(0,198,182,.1)' : 'rgba(18,27,46,.5)',
              border: isSignificantSavings ? '1px solid rgba(0,198,182,.3)' : 'none',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.3s ease'
            }}>
              <span style={{ color: 'var(--muted)', fontSize: '14px' }}>Interest Saved</span>
              <span style={{ 
                fontWeight: 700, 
                fontSize: '16px',
                color: isSignificantSavings ? 'var(--accent)' : 'inherit'
              }}>
                {impact.interestSaved > 0 ? fmtMoney(impact.interestSaved) : '$0.00'}
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPaymentAmount(debt.minimum_payment)}
              className="btn secondary"
              style={{ flex: 1, fontSize: '12px', padding: '8px' }}
            >
              Minimum<br/>{fmtMoney(debt.minimum_payment)}
            </button>
            <button
              onClick={() => setPaymentAmount(recommendedPayment)}
              className="btn secondary"
              style={{ flex: 1, fontSize: '12px', padding: '8px' }}
            >
              Recommended<br/>{fmtMoney(recommendedPayment)}
            </button>
            <button
              onClick={() => setPaymentAmount(aggressivePayment)}
              className="btn secondary"
              style={{ flex: 1, fontSize: '12px', padding: '8px' }}
            >
              Aggressive<br/>{fmtMoney(aggressivePayment)}
            </button>
          </div>
        </div>

        {/* Fixed Footer */}
        <div style={{ 
          padding: '20px', 
          borderTop: '1px solid rgba(34,49,84,.5)',
          flexShrink: 0
        }}>
          <button
            onClick={onClose}
            className="btn"
            style={{ width: '100%' }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}
