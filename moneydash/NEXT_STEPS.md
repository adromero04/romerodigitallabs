# Next Steps to Complete Supabase Integration

## ✅ Completed

1. ✅ Database schema created (`supabase_schema.sql`)
2. ✅ Supabase adapter created (`src/lib/supabaseAdapter.ts`)
3. ✅ Migration utility created (`src/lib/migrateToSupabase.ts`)
4. ✅ Auth functions updated (`src/lib/auth.ts`)
5. ✅ Landing page auth updated (`src/pages/LandingPage.tsx`)
6. ✅ Settings page auth updated (`src/pages/SettingsPage.tsx`)
7. ✅ Settings modal auth updated (`src/components/SettingsModal.tsx`)

## ⚠️ Still Needed

### 1. Update Data Adapter Router

The `src/lib/dataAdapter.ts` file currently only uses local Dexie. You need to update it to route to Supabase when in account mode.

**Example pattern:**

```typescript
import * as supabaseAdapter from './supabaseAdapter'

export async function listBills(): Promise<Bill[]> {
  const mode = await getMode()
  if (mode === 'supabase' && supabase) {
    return supabaseAdapter.listBills()
  }
  // Local mode
  return db.bills.orderBy('due_day').toArray()
}
```

Apply this pattern to ALL functions in `dataAdapter.ts`:
- `listBills`, `upsertBill`, `deleteBill`
- `markBillPaid`, `unmarkBillPaid`, `isBillPaidThisMonth`
- `listSubscriptions`, `upsertSubscription`, `deleteSubscription`
- `markSubscriptionPaid`, `unmarkSubscriptionPaid`, `isSubscriptionPaidThisMonth`
- `listDebts`, `upsertDebt`, `deleteDebt`
- `markDebtPaid`, `unmarkDebtPaid`, `isDebtPaidThisMonth`
- `listTransactions`, `addTransaction`
- `listCategories`, `listCategoriesByType`
- `listPayoffPlans`, `upsertPayoffPlan`, `deletePayoffPlan`

### 2. Add Missing Functions to Supabase Adapter

Add these to `supabaseAdapter.ts`:
- `listCategoriesByType(type: 'expense' | 'income')`
- `upsertCategory()` and `deleteCategory()`
- `listAccounts()`, `upsertAccount()`, `deleteAccount()`
- `listPayoffPlans()`, `upsertPayoffPlan()`, `deletePayoffPlan()`

### 3. Fix Migration for Payments

Update `migrateToSupabase.ts` to properly migrate payment records (bill_payments, subscription_payments, debt_payments).

### 4. Add Session Management

Add session refresh logic to handle Supabase token expiration:
- Check session on app load
- Refresh tokens automatically
- Handle session expiry gracefully

### 5. Test the Integration

1. Set up `.env` file with Supabase credentials
2. Run SQL schema in Supabase
3. Test account creation
4. Verify data migration
5. Test login/logout
6. Test data operations (create, read, update, delete)

## Quick Test Checklist

- [ ] Environment variables set
- [ ] SQL schema run in Supabase
- [ ] Can create account
- [ ] Local data migrates to Supabase
- [ ] Can log in with account
- [ ] Can create/edit/delete bills
- [ ] Can create/edit/delete subscriptions
- [ ] Can create/edit/delete debts
- [ ] Data persists across page refreshes
- [ ] Logout works correctly
