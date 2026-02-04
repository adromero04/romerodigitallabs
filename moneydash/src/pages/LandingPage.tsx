import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  async function handleLocalContinue() {
    // Clear ALL existing data for a fresh start
    const { db } = await import('../lib/db')
    const { ensureCategories } = await import('../lib/seed')
    
    // Clear all tables
    await db.bills.clear()
    await db.transactions.clear()
    await db.debts.clear()
    await db.subscriptions.clear()
    await db.categories.clear()
    await db.accounts.clear()
    await db.bill_payments.clear()
    await db.subscription_payments.clear()
    await db.debt_payments.clear()
    
    // Ensure only the required categories exist (no seed data)
    await ensureCategories()
    
    // Log in as local user
    localStorage.setItem('moneydash_auth', JSON.stringify({
      authenticated: true,
      email: 'local-user',
      mode: 'local'
    }))
    localStorage.setItem('moneydash_user', JSON.stringify({
      email: 'local-user',
      mode: 'local'
    }))
    window.dispatchEvent(new Event('moneydash_auth_change'))
    navigate('/dashboard')
  }

  async function handleAccountSubmit(e: React.FormEvent) {
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
      const { signUpWithSupabase, signInWithSupabase } = await import('../lib/auth')
      const { migrateLocalDataToSupabase } = await import('../lib/migrateToSupabase')
      
      let userData
      if (isSignUp) {
        // Sign up
        userData = await signUpWithSupabase(email, password)
        
        // Migrate local data to Supabase
        try {
          await migrateLocalDataToSupabase()
        } catch (migrationError) {
          console.warn('Migration warning:', migrationError)
          // Continue even if migration has issues
        }
      } else {
        // Sign in
        userData = await signInWithSupabase(email, password)
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
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.')
      console.error('Auth error:', err)
    }
  }

  function openLoginModal() {
    setIsSignUp(false)
    setShowAuthModal(true)
    setShowForgotPassword(false)
    setError('')
    setSuccessMessage('')
    setEmail('')
    setPassword('')
  }

  function openSignupModal() {
    setIsSignUp(true)
    setShowAuthModal(true)
    setShowForgotPassword(false)
    setError('')
    setSuccessMessage('')
    setEmail('')
    setPassword('')
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    try {
      const { resetPassword } = await import('../lib/auth')
      await resetPassword(email)
      setSuccessMessage('Password reset email sent! Please check your inbox and follow the instructions to reset your password.')
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email. Please try again.')
      console.error('Password reset error:', err)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      color: 'var(--text)'
    }}>
      {/* Header/Navbar - Desktop */}
      <header className="nav desktop-nav" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto'
      }}>
        <div className="brand">
          <img 
            src={`${import.meta.env.BASE_URL || '/'}moneydash-logo.png`}
            alt="MoneyDash" 
            style={{ height: '50px', width: 'auto' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={openLoginModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--muted)',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '8px 16px'
            }}
          >
            Login
          </button>
          <button
            onClick={handleLocalContinue}
            className="btn"
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 600
            }}
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Header/Navbar - Mobile */}
      <header className="nav mobile-nav" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        width: '100%'
      }}>
        <div className="brand">
          <img 
            src={`${import.meta.env.BASE_URL || '/'}moneydash-logo.png`}
            alt="MoneyDash" 
            style={{ height: '50px', width: 'auto' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={openLoginModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--muted)',
              fontSize: '14px',
              cursor: 'pointer',
              padding: '6px 12px'
            }}
          >
            Login
          </button>
          <button
            onClick={handleLocalContinue}
            className="btn"
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto'
      }}>
        {/* Banner Row - Headline and Graphic */}
        <div className="landing-banner" style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
          marginBottom: '60px'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 900,
            lineHeight: 1.2,
            color: '#e8eefc',
            margin: 0
          }}>
            Track Your Finances.<br />Your Way.
          </h1>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <img
              src={`${import.meta.env.BASE_URL}banner-graphic.png`}
              alt="MoneyDash Graphic"
              style={{
                width: '100%',
                height: 'auto',
                maxWidth: '380px',
                display: 'block'
              }}
            />
          </div>
        </div>

        {/* Content Below Banner */}
        <div className="landing-content" style={{
          width: '100%'
        }}>
          <p style={{
            fontSize: '20px',
            color: '#9fb0d0',
            marginBottom: '32px',
            lineHeight: 1.6
          }}>
            Take control of your bills, subscriptions, and debts without giving third-party apps access to your bank accounts.<br />
            Use MoneyDash completely on one device or securely sync across devices when you choose.
          </p>

          {/* Feature bullet points */}
          <div className="landing-features" style={{ 
            marginBottom: '40px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#e8eefc', marginBottom: '8px' }}>
                <span style={{ color: '#00C6B6', marginRight: '8px' }}>✓</span> Use It Without an Account
              </div>
              <div style={{ fontSize: '16px', color: '#9fb0d0', lineHeight: 1.6 }}>
                Manually track your bills and payments with no account required.<br />
                Perfect for users who want a simple, private, single-device experience.
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#e8eefc', marginBottom: '8px' }}>
                <span style={{ color: '#00C6B6', marginRight: '8px' }}>✓</span> Local-First by Default
              </div>
              <div style={{ fontSize: '16px', color: '#9fb0d0', lineHeight: 1.6 }}>
                Your data is stored locally on your device for maximum privacy and control.<br />
                No automatic cloud sync unless you turn it on.
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#e8eefc', marginBottom: '8px' }}>
                <span style={{ color: '#00C6B6', marginRight: '8px' }}>✓</span> Optional Secure Sync
              </div>
              <div style={{ fontSize: '16px', color: '#9fb0d0', lineHeight: 1.6 }}>
                Create an account to securely sync your data across devices — laptop, phone, and tablet.
                Your data stays encrypted and tied only to you.
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#e8eefc', marginBottom: '8px' }}>
                <span style={{ color: '#00C6B6', marginRight: '8px' }}>✓</span> Privacy Always Comes First
              </div>
              <div style={{ fontSize: '16px', color: '#9fb0d0', lineHeight: 1.6 }}>
                No bank connections. No ads. No selling your data.
                Whether local or synced, your financial data is never shared with third parties.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
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
              setShowAuthModal(false)
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
                {showForgotPassword ? 'Reset Password' : (isSignUp ? 'Create Account' : 'Login')}
              </div>
              <button 
                className="settings-close" 
                onClick={() => {
                  setShowAuthModal(false)
                  setShowForgotPassword(false)
                  setError('')
                  setSuccessMessage('')
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

              {showForgotPassword ? (
                <form onSubmit={handleForgotPassword}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9fb0d0' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  <p style={{ fontSize: '14px', color: '#9fb0d0', marginBottom: '20px', lineHeight: 1.6 }}>
                    Enter your email address and we'll send you a link to reset your password.
                  </p>

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
                      background: 'rgba(0, 198, 182, 0.1)',
                      border: '1px solid rgba(0, 198, 182, 0.3)',
                      borderRadius: '8px',
                      color: '#00C6B6',
                      fontSize: '14px'
                    }}>
                      {successMessage}
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
                      Send Reset Link
                    </button>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false)
                        setError('')
                        setSuccessMessage('')
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#00C6B6',
                        fontSize: '14px',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAccountSubmit}>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ display: 'block', fontSize: '14px', color: '#9fb0d0' }}>
                        Password
                      </label>
                      {!isSignUp && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotPassword(true)
                            setError('')
                            setSuccessMessage('')
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#00C6B6',
                            fontSize: '12px',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0
                          }}
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
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
                      {isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp)
                        setError('')
                        setSuccessMessage('')
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#00C6B6',
                        fontSize: '14px',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                    </button>
                  </div>
                </form>
              )}
          </div>
        </>
      )}
    </div>
  )
}
