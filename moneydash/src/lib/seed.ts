import { db } from './db'
import { uid, todayISO } from './utils'

// Ensure required categories exist
export async function ensureCategories() {
  const requiredCategories = [
    { name: 'Rent', type: 'expense' as const },
    { name: 'Utilities', type: 'expense' as const },
    { name: 'Subscription', type: 'expense' as const },
    { name: 'Auto', type: 'expense' as const },
    { name: 'Other', type: 'expense' as const },
    { name: 'Paycheck', type: 'income' as const },
  ]

  // Remove old categories that are no longer needed
  const oldCategoriesToRemove = ['Gas', 'Groceries']
  for (const oldName of oldCategoriesToRemove) {
    const oldCats = await db.categories.where('name').equals(oldName).toArray()
    for (const oldCat of oldCats) {
      await db.categories.delete(oldCat.id)
    }
  }

  // Ensure required categories exist (only one of each)
  for (const cat of requiredCategories) {
    const existing = await db.categories.where('name').equals(cat.name).toArray()
    if (existing.length === 0) {
      // No category with this name exists, create it
      await db.categories.add({ id: uid(), ...cat })
    } else if (existing.length > 1) {
      // Multiple categories with same name, keep first, delete rest
      for (let i = 1; i < existing.length; i++) {
        await db.categories.delete(existing[i].id)
      }
    }
  }
}

export async function seedIfEmpty() {
  const billsCount = await db.bills.count()
  const txCount = await db.transactions.count()
  const debtsCount = await db.debts.count()
  if (billsCount || txCount || debtsCount) {
    // Even if database has data, ensure categories exist
    await ensureCategories()
    return
  }

  // categories
  const catRent = { id: uid(), name: 'Rent', type: 'expense' as const }
  const catUtilities = { id: uid(), name: 'Utilities', type: 'expense' as const }
  const catSubscription = { id: uid(), name: 'Subscription', type: 'expense' as const }
  const catAuto = { id: uid(), name: 'Auto', type: 'expense' as const }
  const catOther = { id: uid(), name: 'Other', type: 'expense' as const }
  const catPay = { id: uid(), name: 'Paycheck', type: 'income' as const }
  await db.categories.bulkAdd([catRent, catUtilities, catSubscription, catAuto, catOther, catPay])

  // accounts
  const accChecking = { id: uid(), name: 'Checking', type: 'checking' as const }
  const accCard = { id: uid(), name: 'Credit Card', type: 'credit_card' as const }
  await db.accounts.bulkAdd([accChecking, accCard])

  // bills
  await db.bills.bulkAdd([
    { id: uid(), name: 'Rent', amount: 1450, due_day: 1, frequency: 'monthly', auto_pay: true, category_id: catRent.id, account_id: accChecking.id, is_active: true },
    { id: uid(), name: 'Internet', amount: 79.99, due_day: 10, frequency: 'monthly', auto_pay: true, is_active: true },
    { id: uid(), name: 'Phone', amount: 120, due_day: 18, frequency: 'monthly', auto_pay: true, is_active: true },
  ])

  // debts
  await db.debts.bulkAdd([
    { id: uid(), name: 'Card A', current_balance: 1227.60, original_balance: 1450.91, interest_rate_annual: 33.99, minimum_payment: 114.77, due_day: 20, auto_pay: false },
    { id: uid(), name: 'Card B', current_balance: 850.00, interest_rate_annual: 27.99, minimum_payment: 55.00, due_day: 12, auto_pay: false }
  ])

  // payoff plan
  await db.payoff_plans.add({
    id: uid(),
    name: 'Snowball Plan',
    strategy: 'snowball',
    monthly_budget: 250,
    start_date: todayISO()
  })

  // transactions
  const t = todayISO()
  await db.transactions.bulkAdd([
    { id: uid(), type: 'income', amount: 2500, description: 'Paycheck', transaction_date: t, category_id: catPay.id, account_id: accChecking.id },
    { id: uid(), type: 'expense', amount: -152.33, description: 'Groceries', transaction_date: t, category_id: catOther.id, account_id: accChecking.id },
    { id: uid(), type: 'expense', amount: -48.10, description: 'Gas', transaction_date: t, category_id: catAuto.id, account_id: accChecking.id },
  ])
}
