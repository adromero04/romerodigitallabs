// Migration utility: Migrates local IndexedDB data to Supabase
import { db } from './db'
import * as supabaseAdapter from './supabaseAdapter'

export async function migrateLocalDataToSupabase(): Promise<void> {
  if (!supabaseAdapter) {
    throw new Error('Supabase adapter not available')
  }

  console.log('Starting migration to Supabase...')

  try {
    // Migrate Categories
    const categories = await db.categories.toArray()
    console.log(`Migrating ${categories.length} categories...`)
    for (const cat of categories) {
      await supabaseAdapter.upsertCategory(cat)
    }

    // Migrate Accounts
    const accounts = await db.accounts.toArray()
    console.log(`Migrating ${accounts.length} accounts...`)
    for (const acc of accounts) {
      await supabaseAdapter.upsertAccount(acc)
    }

    // Migrate Bills
    const bills = await db.bills.toArray()
    console.log(`Migrating ${bills.length} bills...`)
    for (const bill of bills) {
      await supabaseAdapter.upsertBill(bill)
    }

    // Migrate Bill Payments
    const billPayments = await db.bill_payments.toArray()
    console.log(`Migrating ${billPayments.length} bill payments...`)
    for (const payment of billPayments) {
      await supabaseAdapter.insertBillPayment(payment)
    }

    // Migrate Subscriptions
    const subscriptions = await db.subscriptions.toArray()
    console.log(`Migrating ${subscriptions.length} subscriptions...`)
    for (const sub of subscriptions) {
      await supabaseAdapter.upsertSubscription(sub)
    }

    // Migrate Subscription Payments
    const subscriptionPayments = await db.subscription_payments.toArray()
    console.log(`Migrating ${subscriptionPayments.length} subscription payments...`)
    for (const payment of subscriptionPayments) {
      await supabaseAdapter.insertSubscriptionPayment(payment)
    }

    // Migrate Debts
    const debts = await db.debts.toArray()
    console.log(`Migrating ${debts.length} debts...`)
    for (const debt of debts) {
      await supabaseAdapter.upsertDebt(debt)
    }

    // Migrate Debt Payments
    const debtPayments = await db.debt_payments.toArray()
    console.log(`Migrating ${debtPayments.length} debt payments...`)
    for (const payment of debtPayments) {
      await supabaseAdapter.insertDebtPayment(payment)
    }

    // Migrate Transactions
    const transactions = await db.transactions.toArray()
    console.log(`Migrating ${transactions.length} transactions...`)
    for (const tx of transactions) {
      await supabaseAdapter.addTransaction(tx)
    }

    // Migrate Payoff Plans
    const plans = await db.payoff_plans.toArray()
    console.log(`Migrating ${plans.length} payoff plans...`)
    for (const plan of plans) {
      await supabaseAdapter.upsertPayoffPlan(plan)
    }

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}
