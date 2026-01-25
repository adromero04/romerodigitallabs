# Supabase Authentication Setup

## Where to Find User Accounts

**Important**: User accounts created via Supabase Auth are stored in the `auth.users` table, NOT in the `accounts` table.

- **`auth.users`** = User authentication accounts (email, password, etc.)
- **`accounts`** = Financial accounts (checking, credit card, etc.) - different thing!

To view user accounts:
1. Go to Supabase dashboard → **Authentication** → **Users**
2. You'll see all registered users there

## Email Confirmation Setup

By default, Supabase requires email confirmation for new signups. For development/testing, you may want to disable this.

### Option 1: Disable Email Confirmation (Recommended for Development)

1. Go to Supabase dashboard → **Authentication** → **Settings**
2. Scroll to **Email Auth** section
3. **Disable** "Enable email confirmations"
4. Save changes

Now users can sign up and immediately use the app without email confirmation.

### Option 2: Keep Email Confirmation Enabled

If you keep it enabled:
- Users will receive a confirmation email
- They must click the link to activate their account
- Until confirmed, they may have limited access

### Option 3: Auto-Confirm in Development

1. Go to **Authentication** → **Settings**
2. Under **Email Auth**, enable "Enable email confirmations"
3. But also enable "Auto Confirm" for development
4. Or manually confirm users in **Authentication** → **Users** → Click on user → "Confirm email"

## Testing Your Setup

1. **Check Authentication Settings**:
   - Go to **Authentication** → **Settings**
   - Verify Email provider is enabled
   - Check email confirmation settings

2. **Create a Test Account**:
   - Use the app to create an account
   - Check **Authentication** → **Users** to see the new user

3. **Verify Data Migration**:
   - After account creation, check **Table Editor**
   - You should see your local data in the various tables (bills, debts, subscriptions, etc.)

## Troubleshooting

**"User not found in accounts table"**
- This is correct! User accounts are in `auth.users`, not `accounts`
- The `accounts` table is for financial accounts (checking, credit card, etc.)

**"User created but can't sign in"**
- Check if email confirmation is required
- Check **Authentication** → **Users** → see if user has "Confirmed" status
- If not confirmed, either disable email confirmation or manually confirm the user

**"RLS policy violation" errors**
- Make sure you ran the SQL schema script
- Verify Row Level Security policies are in place
- Check that the user_id matches `auth.uid()` in the policies
