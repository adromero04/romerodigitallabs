import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [validToken, setValidToken] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if we have a valid password reset token
    const checkToken = async () => {
      if (!supabase) {
        setError('Password reset is not available. Please contact support.')
        return
      }

      // Check if there's a recovery token in the URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const type = hashParams.get('type')
      
      if (type === 'recovery') {
        setValidToken(true)
      } else {
        setError('Invalid or expired password reset link. Please request a new one.')
      }
    }

    checkToken()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    // Validation
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!supabase) {
      setError('Password reset service is not available.')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        throw updateError
      }

      setSuccessMessage('Password updated successfully! Redirecting to login...')
      
      // Wait 2 seconds then redirect to landing page
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (err: any) {
      console.error('Password update error:', err)
      setError(err.message || 'Failed to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, var(--bg), #070b14)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        background: 'var(--panel)',
        border: '1px solid rgba(34,49,84,.8)',
        borderRadius: '18px',
        padding: '40px',
        boxShadow: '0 10px 40px rgba(0,0,0,.5)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img 
            src={`${import.meta.env.BASE_URL || '/'}moneydash-logo.png`}
            alt="MoneyDash" 
            style={{ height: '60px', width: 'auto' }}
          />
        </div>

        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 900, 
          marginBottom: '10px',
          textAlign: 'center'
        }}>
          Reset Your Password
        </h1>

        <p style={{ 
          fontSize: '14px', 
          color: 'var(--muted)', 
          marginBottom: '30px',
          textAlign: 'center',
          lineHeight: 1.6
        }}>
          Enter your new password below
        </p>

        {validToken ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                color: 'var(--muted)' 
              }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                required
                minLength={6}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(18,27,46,.6)',
                  border: '1px solid rgba(34,49,84,.8)',
                  borderRadius: '12px',
                  color: 'var(--text)',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                color: 'var(--muted)' 
              }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                minLength={6}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(18,27,46,.6)',
                  border: '1px solid rgba(34,49,84,.8)',
                  borderRadius: '12px',
                  color: 'var(--text)',
                  fontSize: '16px'
                }}
              />
            </div>

            {error && (
              <div style={{
                marginBottom: '20px',
                padding: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            {successMessage && (
              <div style={{
                marginBottom: '20px',
                padding: '12px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                color: '#22c55e',
                fontSize: '14px'
              }}>
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              className="btn"
              disabled={loading}
              style={{
                width: '100%',
                marginBottom: '12px',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>

            <button
              type="button"
              className="btn secondary"
              onClick={() => navigate('/')}
              disabled={loading}
              style={{
                width: '100%'
              }}
            >
              Back to Login
            </button>
          </form>
        ) : (
          <div>
            {error && (
              <div style={{
                marginBottom: '20px',
                padding: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <button
              className="btn"
              onClick={() => navigate('/')}
              style={{
                width: '100%'
              }}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
