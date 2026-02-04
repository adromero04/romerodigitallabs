import { useState, useEffect } from 'react'
import { NavLink, Route, Routes, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import BillsPage from './pages/BillsPage'
import DebtsPage from './pages/DebtsPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import SettingsPage from './pages/SettingsPage'
import ImportCsvPage from './pages/ImportCsvPage'
import SettingsModal from './components/SettingsModal'
import { DashboardIcon, BillsIcon, DebtsIcon, SubscriptionsIcon, SettingsIcon } from './components/Icons'
import { isAuthenticated, logout } from './lib/auth'
import { supabase } from './lib/supabaseClient'

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [authenticated, setAuthenticated] = useState(() => {
    // Check auth state on initial render
    try {
      return isAuthenticated()
    } catch (e) {
      console.error('Error checking authentication:', e)
      return false
    }
  })

  useEffect(() => {
    // Check auth on mount and when storage changes
    const checkAuth = async () => {
      try {
        const isAuth = isAuthenticated()
        
        // For Supabase accounts, also verify the session actually exists
        if (isAuth && supabase) {
          const auth = localStorage.getItem('moneydash_auth')
          if (auth) {
            try {
              const parsed = JSON.parse(auth)
              if (parsed.mode === 'account') {
                // Check if Supabase session actually exists
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) {
                  // Session doesn't exist, clear our auth state
                  localStorage.removeItem('moneydash_auth')
                  localStorage.removeItem('moneydash_user')
                  localStorage.removeItem('moneydash.mode')
                  setAuthenticated(false)
                  return
                }
              }
            } catch (e) {
              // If parsing fails, user is not authenticated
              setAuthenticated(false)
              return
            }
          }
        }
        
        setAuthenticated(isAuth)
      } catch (e) {
        console.error('Error checking authentication:', e)
        setAuthenticated(false)
      }
    }
    
    // Initial check
    checkAuth()
    
    // Also check after a brief delay to catch cases where localStorage is cleared
    // right after component mounts (like during logout redirect)
    const timeoutId = setTimeout(checkAuth, 50)
    
    // Listen for storage changes (from other tabs)
    window.addEventListener('storage', checkAuth)
    
    // Also listen for custom auth events
    const handleAuthChange = () => {
      // Check immediately - localStorage should be cleared synchronously
      checkAuth()
    }
    window.addEventListener('moneydash_auth_change', handleAuthChange)
    
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('moneydash_auth_change', handleAuthChange)
    }
  }, [])

  // Show landing page if not authenticated
  if (!authenticated) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  return (
    <>
      {/* Desktop Header */}
      <header className="nav desktop-nav">
        <NavLink to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="brand">
            <img 
              src={`${import.meta.env.BASE_URL || '/'}moneydash-logo.png`}
              alt="MoneyDash" 
              style={{ height: '50px', width: 'auto' }}
            />
          </div>
        </NavLink>
        <nav className="links" aria-label="Primary navigation">
          <NavLink className={({isActive}) => `link ${isActive ? 'active':''}`} to="/dashboard">Dashboard</NavLink>
          <NavLink className={({isActive}) => `link ${isActive ? 'active':''}`} to="/bills">Bills</NavLink>
          <NavLink className={({isActive}) => `link ${isActive ? 'active':''}`} to="/subscriptions">Subscriptions</NavLink>
          <NavLink className={({isActive}) => `link ${isActive ? 'active':''}`} to="/debts">Debts</NavLink>
          <NavLink className={({isActive}) => `link ${isActive ? 'active':''}`} to="/settings">Settings</NavLink>
        </nav>
      </header>

      {/* Mobile Header */}
      <header className="nav mobile-nav">
        <NavLink to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="brand">
            <img 
              src={`${import.meta.env.BASE_URL || '/'}moneydash-logo.png`}
              alt="MoneyDash" 
              style={{ height: '50px', width: 'auto' }}
            />
          </div>
        </NavLink>
        <button 
          className="settings-button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Settings"
        >
          <SettingsIcon />
        </button>
      </header>

      <main className="container">
        <Routes>
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/bills" element={<BillsPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/debts" element={<DebtsPage />} />
          <Route path="/import" element={<ImportCsvPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <NavLink className={({isActive}) => `mobile-nav-item ${isActive ? 'active':''}`} to="/dashboard">
          <DashboardIcon />
          <span>Dashboard</span>
        </NavLink>
        <NavLink className={({isActive}) => `mobile-nav-item ${isActive ? 'active':''}`} to="/bills">
          <BillsIcon />
          <span>Bills</span>
        </NavLink>
        <NavLink className={({isActive}) => `mobile-nav-item ${isActive ? 'active':''}`} to="/subscriptions">
          <SubscriptionsIcon />
          <span>Subscriptions</span>
        </NavLink>
        <NavLink className={({isActive}) => `mobile-nav-item ${isActive ? 'active':''}`} to="/debts">
          <DebtsIcon />
          <span>Debts</span>
        </NavLink>
      </nav>

      {/* Mobile Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
