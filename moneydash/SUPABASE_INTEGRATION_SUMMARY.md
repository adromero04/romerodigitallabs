# Supabase Integration Summary

## Files Created/Updated

### 1. Setup Files
- **`SUPABASE_SETUP.md`** - Step-by-step setup guide
- **`supabase_schema.sql`** - Complete database schema with RLS policies

### 2. Core Integration Files
- **`src/lib/supabaseClient.ts`** - Already exists, configured to use env vars
- **`src/lib/supabaseAdapter.ts`** - NEW: All Supabase data operations
- **`src/lib/migrateToSupabase.ts`** - NEW: Migrates local data to Supabase
- **`src/lib/auth.ts`** - UPDATED: Now includes Supabase auth functions

### 3. Next Steps (To Complete Integration)

#### A. Update Auth Handlers
Update these files to use Supabase authentication:
- `src/pages/LandingPage.tsx` - `handleAccountSubmit` function
- `src/pages/SettingsPage.tsx` - `handleCreateAccount` function  
- `src/components/SettingsModal.tsx` - `handleCreateAccount` function

#### B. Update Data Adapter Router
Update `src/lib/dataAdapter.ts` to route to Supabase when `mode === 'account'`:
- Check `getMode()` 
- If 'supabase', use functions from `supabaseAdapter.ts`
- If 'local', use existing Dexie functions

#### C. Add Migration on Account Creation
When user creates account:
1. Create Supabase account
2. Migrate local data using `migrateLocalDataToSupabase()`
3. Switch mode to 'supabase'

## Quick Start

1. **Set up Supabase project** (see `SUPABASE_SETUP.md`)
2. **Add environment variables** to `.env`:
   ```
   VITE_SUPABASE_URL=your-url
   VITE_SUPABASE_ANON_KEY=your-key
   ```
3. **Run SQL schema** in Supabase SQL Editor
4. **Update auth handlers** to use `signUpWithSupabase()` and `signInWithSupabase()`
5. **Test with your local data** - it will migrate automatically on account creation

## Testing

Your current local data will be used as a "TestUser" profile:
- When you create an account, all local data migrates to Supabase
- You can then test multi-device sync
- Data is isolated per user via Row Level Security (RLS)

## Architecture

```
User Action
    ↓
Auth Check (local vs account)
    ↓
Data Mode Check (local vs supabase)
    ↓
Route to Dexie (local) OR Supabase (account)
    ↓
Return Data
```

## Security

- All tables have Row Level Security (RLS) enabled
- Users can only access their own data (`user_id = auth.uid()`)
- Supabase handles authentication securely
- No sensitive data in client code
