# Supabase Setup Guide for MoneyDash

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Click on your project
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 2: Set Environment Variables

1. Create a `.env` file in the `moneydash` directory (if it doesn't exist)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Important**: Add `.env` to `.gitignore` if it's not already there to keep your keys secure

## Step 3: Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the SQL script from `supabase_schema.sql` (this will be created)
4. This creates all necessary tables with Row Level Security (RLS) policies

## Step 4: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Enable **Email** provider
3. Configure email templates if desired
4. Set **Site URL** to your app URL (e.g., `http://localhost:5173` for dev)

## Step 5: Test the Integration

1. Start your dev server: `npm run dev`
2. Create an account through the app
3. Your local data will be migrated to Supabase on first account creation
4. Check Supabase dashboard → **Table Editor** to see your data

## Step 6: Deploy

When deploying to production:
1. Update environment variables in your hosting platform
2. Update Supabase **Site URL** to your production URL
3. Test account creation and data sync

## Troubleshooting

- **"Invalid API key"**: Check your `.env` file has the correct keys
- **"RLS policy violation"**: Make sure you ran the SQL schema script
- **Data not syncing**: Check browser console for errors and verify user is authenticated
