import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useNavigate } from 'react-router-dom'
import { getMode, setMode, type DataMode } from '../lib/dataAdapter'
import { logout, getAuthMode } from '../lib/auth'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [mode, setLocalMode] = useState<DataMode>('local')
  const [authMode, setAuthMode] = useState<'local' | 'account' | null>(null)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => { 
    if (isOpen) {
      getMode().then(setLocalMode)
      setAuthMode(getAuthMode())
    }
  }, [isOpen])

  async function update(m: DataMode) {
    await setMode(m)
    setLocalMode(m)
    alert(`Data mode set to: ${m}. (Supabase adapter not wired yet—local is fully functional.)`)
  }

  async function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
      // Get auth info before clearing
      const auth = localStorage.getItem('moneydash_auth')
      let needsSupabaseSignOut = false
      
      if (auth) {
        try {
          const parsed = JSON.parse(auth)
          if (parsed.mode === 'account') {
            needsSupabaseSignOut = true
          }
        } catch (e) {
          // Ignore errors
        }
      }
      
      // Sign out from Supabase first (if needed)
      if (needsSupabaseSignOut) {
        try {
          const { supabase } = await import('../lib/supabaseClient')
          if (supabase) {
            // Sign out from Supabase - this should clear Supabase's internal storage
            await supabase.auth.signOut()
            
            // Aggressively clear all Supabase-related localStorage keys
            // Supabase stores session with pattern: sb-<project-ref>-auth-token
            // Also check for other possible patterns
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
            if (supabaseUrl) {
              // Extract project ref from URL (e.g., kgtasbsacijaefvatpds from https://kgtasbsacijaefvatpds.supabase.co)
              const projectRefMatch = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)
              if (projectRefMatch) {
                const projectRef = projectRefMatch[1]
                // Clear keys with project ref
                Object.keys(localStorage).forEach(key => {
                  if (key.includes(projectRef) || key.startsWith('sb-') || key.includes('supabase')) {
                    localStorage.removeItem(key)
                  }
                })
              }
            }
            
            // Also clear any keys that might contain 'auth' and 'token'
            Object.keys(localStorage).forEach(key => {
              if (key.toLowerCase().includes('auth') && key.toLowerCase().includes('token')) {
                localStorage.removeItem(key)
              }
            })
          }
        } catch (e) {
          console.error('Supabase signout error:', e)
        }
      }
      
      // Clear all our localStorage items
      localStorage.removeItem('moneydash_auth')
      localStorage.removeItem('moneydash_user')
      localStorage.removeItem('moneydash.mode')
      
      // Verify everything is cleared
      const stillHasAuth = localStorage.getItem('moneydash_auth')
      if (stillHasAuth) {
        console.error('Failed to clear moneydash_auth:', stillHasAuth)
      }
      
      onClose()
      // Force a hard reload with a query parameter to bypass cache
      window.location.href = '/?logout=' + Date.now()
    }
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      const { signUpWithSupabase } = await import('../lib/auth')
      const { migrateLocalDataToSupabase } = await import('../lib/migrateToSupabase')
      
      // Sign up with Supabase
      const userData = await signUpWithSupabase(email, password)
      
      // Migrate local data to Supabase
      try {
        await migrateLocalDataToSupabase()
      } catch (migrationError) {
        console.warn('Migration warning:', migrationError)
        // Continue even if migration has issues
      }

      // Store auth state
      localStorage.setItem('moneydash_auth', JSON.stringify({
        authenticated: true,
        email: userData.email,
        userId: userData.userId,
        mode: 'account'
      }))
      localStorage.setItem('moneydash_user', JSON.stringify({
        email: userData.email,
        userId: userData.userId,
        mode: 'account'
      }))
      
      // Set mode to supabase for data operations
      const { setMode } = await import('../lib/dataAdapter')
      await setMode('supabase')
      
      window.dispatchEvent(new Event('moneydash_auth_change'))
      setAuthMode('account')
      setShowSignupModal(false)
      setEmail('')
      setPassword('')
      alert('Account created! Your data has been synced to the cloud. You can now access it from any device.')
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.')
      console.error('Account creation error:', err)
    }
  }

  if (!isOpen) return null

  const modalContent = showSignupModal ? (
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
        onClick={() => {
          setShowSignupModal(false)
          setError('')
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '400px',
          maxHeight: '90vh',
          background: 'var(--bg)',
          border: '1px solid rgba(34,49,84,.8)',
          borderRadius: '18px',
          padding: '20px',
          zIndex: 201,
          overflowY: 'auto',
          boxShadow: '0 10px 40px rgba(0,0,0,.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 20 }}>
            Create Account
          </div>
          <button 
            className="settings-close" 
            onClick={() => {
              setShowSignupModal(false)
              setError('')
            }}
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

        <form onSubmit={handleCreateAccount}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9fb0d0' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9fb0d0' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <button
              type="submit"
              className="btn"
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '16px',
                fontWeight: 600
              }}
            >
              Create Account
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setShowSignupModal(false)
                setError('')
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9fb0d0',
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  ) : null

  return (
    <>
      <div className={`settings-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <div className={`settings-modal ${isOpen ? 'active' : ''}`}>
        <div className="settings-header">
          <div className="big" style={{ fontSize: 22 }}>Settings</div>
          <button className="settings-close" onClick={onClose}>×</button>
        </div>

        <div className="grid" style={{ gap: 14 }}>
          <NavLink 
            to="/import" 
            className="settings-link"
            onClick={onClose}
          >
            Import CSV
          </NavLink>

          <div className="card">
            <h3>Storage mode</h3>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#e8eefc', marginBottom: '8px' }}>
                Current setup: <span style={{ color: '#00C6B6' }}>{authMode === 'account' ? 'Account (Multi-device sync)' : 'Local'}</span>
              </div>
              {authMode === 'local' && (
                <p style={{ fontSize: '14px', color: '#9fb0d0', marginBottom: '16px', lineHeight: 1.6 }}>
                  Your data is stored locally on this device. To sync across multiple devices, create an account below.
                </p>
              )}
              {authMode === 'account' && (
                <p style={{ fontSize: '14px', color: '#9fb0d0', marginBottom: '16px', lineHeight: 1.6 }}>
                  Your data is synced across devices. Only the information you enter in the app is saved to the cloud.
                </p>
              )}
            </div>

            {authMode === 'local' && (
              <>
                <button 
                  className="btn" 
                  onClick={() => setShowSignupModal(true)}
                  style={{ marginBottom: '16px' }}
                >
                  Create Account for Multi-Device Sync
                </button>
                <div style={{ 
                  padding: '12px', 
                  background: 'rgba(0,198,182,0.1)', 
                  borderRadius: '8px',
                  border: '1px solid rgba(0,198,182,0.2)',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '14px', color: '#9fb0d0', lineHeight: 1.6 }}>
                    <strong style={{ color: '#e8eefc' }}>Privacy assurance:</strong> When you create an account, only the data you manually enter in MoneyDash is saved to the cloud. We do not link to banks or any financial institutions. Your financial data stays private and under your control.
                  </div>
                </div>
              </>
            )}

          </div>

          <div className="card">
            <h3>Account</h3>
            <button className="btn secondary" onClick={handleLogout}>
              Log Out
            </button>
            <small style={{ display: 'block', marginTop: '12px', color: 'var(--muted)' }}>
              Logging out will return you to the landing page. Your data will remain stored locally on this device.
            </small>
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      {modalContent && createPortal(modalContent, document.body)}
    </>
  )
}
