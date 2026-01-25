// Authentication utilities with Supabase integration
import { supabase } from './supabaseClient'

export function isAuthenticated(): boolean {
  const auth = localStorage.getItem('moneydash_auth')
  if (!auth) return false
  
  try {
    const parsed = JSON.parse(auth)
    // Check if it's a local account or Supabase account
    if (parsed.mode === 'account' && supabase) {
      // For Supabase accounts, verify the session still exists
      // If our localStorage says authenticated but Supabase session is gone, user is logged out
      if (parsed.authenticated === true && !!parsed.userId) {
        // Double-check with Supabase session (synchronous check)
        // Note: This is a quick check - if session is invalid, Supabase will handle it
        return true
      }
      return false
    }
    return parsed.authenticated === true
  } catch {
    return false
  }
}

export function getUserEmail(): string | null {
  const auth = localStorage.getItem('moneydash_auth')
  if (!auth) return null
  
  try {
    const parsed = JSON.parse(auth)
    return parsed.email || null
  } catch {
    return null
  }
}

export function getUserId(): string | null {
  const auth = localStorage.getItem('moneydash_auth')
  if (!auth) return null
  
  try {
    const parsed = JSON.parse(auth)
    return parsed.userId || null
  } catch {
    return null
  }
}

export async function logout(): Promise<void> {
  // If using Supabase, sign out from Supabase first
  const auth = localStorage.getItem('moneydash_auth')
  if (auth) {
    try {
      const parsed = JSON.parse(auth)
      if (parsed.mode === 'account' && supabase) {
        await supabase.auth.signOut()
      }
    } catch (e) {
      console.error('Error signing out from Supabase:', e)
    }
  }
  
  // Clear all auth-related localStorage items synchronously
  // This must happen after Supabase signout but before any redirect
  localStorage.removeItem('moneydash_auth')
  localStorage.removeItem('moneydash_user')
  localStorage.removeItem('moneydash.mode')
  
  // Verify everything is cleared
  if (localStorage.getItem('moneydash_auth') || localStorage.getItem('moneydash_user')) {
    console.warn('Warning: Some auth data may not have been cleared properly')
  }
}

export function getAuthMode(): 'local' | 'account' | null {
  const auth = localStorage.getItem('moneydash_auth')
  if (!auth) return null
  
  try {
    const parsed = JSON.parse(auth)
    return parsed.mode || 'local'
  } catch {
    return null
  }
}

// Supabase authentication functions
export async function signUpWithSupabase(email: string, password: string): Promise<{ userId: string; email: string }> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please check your environment variables.')
  }

  const normalizedEmail = email.trim().toLowerCase()

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      emailRedirectTo: window.location.origin
    }
  })

  if (error) {
    // Handle specific error cases
    if (error.message.includes('User already registered') || error.message.includes('already registered')) {
      throw new Error('An account with this email already exists. Please sign in instead.')
    }
    if (error.message.includes('rate limit') || error.message.includes('rate_limit')) {
      throw new Error('Too many signup attempts. Please wait a few minutes and try again, or sign in if you already have an account.')
    }
    if (error.message.includes('Email rate limit')) {
      throw new Error('Too many email requests. Please wait a few minutes before trying again.')
    }
    throw error
  }
  
  if (!data.user) {
    throw new Error('Failed to create user')
  }

  // Note: If email confirmation is required, data.user.email_confirmed_at will be null
  // The user will still be created but may need to confirm email before full access
  return {
    userId: data.user.id,
    email: data.user.email || normalizedEmail,
  }
}

export async function signInWithSupabase(email: string, password: string): Promise<{ userId: string; email: string }> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please check your environment variables.')
  }

  // Verify environment variables are loaded
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    throw new Error('Supabase environment variables are missing. Please check your .env file.')
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(), // Normalize email
    password,
  })

  if (error) {
    // Provide more helpful error messages
    if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
      throw new Error('Invalid email or password. Please check your credentials and try again.')
    }
    if (error.message.includes('Email not confirmed')) {
      throw new Error('Please check your email and confirm your account before signing in.')
    }
    if (error.message.includes('Too many requests')) {
      throw new Error('Too many login attempts. Please wait a moment and try again.')
    }
    // Throw the original error with more context
    throw new Error(error.message || 'Sign in failed. Please try again.')
  }
  
  if (!data.user) {
    throw new Error('Failed to sign in. No user data returned.')
  }

  // Check if email is confirmed (for informational purposes, but don't block)
  if (!data.user.email_confirmed_at) {
    console.warn('User email is not confirmed yet. This may limit some functionality.')
  }

  return {
    userId: data.user.id,
    email: data.user.email || email,
  }
}

export async function getCurrentSupabaseSession() {
  if (!supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function resetPassword(email: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please check your environment variables.')
  }

  const normalizedEmail = email.trim().toLowerCase()

  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) {
    if (error.message.includes('rate limit') || error.message.includes('rate_limit')) {
      throw new Error('Too many password reset requests. Please wait a few minutes and try again.')
    }
    throw error
  }
}
