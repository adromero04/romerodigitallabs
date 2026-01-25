import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (url && key)
  ? createClient(url, key)
  : null

// Intentionally null if env vars are missing.
// You can wire a Supabase adapter later without breaking local mode.
