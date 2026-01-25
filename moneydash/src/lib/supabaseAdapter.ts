// Supabase data adapter - handles all Supabase operations
import { supabase } from './supabaseClient'
import type { 
  Bill, BillPayment, Category, Debt, DebtPayment, Subscription, 
  SubscriptionPayment, Transaction, Account, PayoffPlan 
} from '../types'
import { uid } from './utils'

// Helper to get current user ID
function getUserId(): string | null {
  const auth = localStorage.getItem('moneydash_auth')
  if (!auth) return null
  try {
    const parsed = JSON.parse(auth)
    return parsed.userId || null
  } catch {
    return null
  }
}

// ---- Categories ----
export async function listCategories(): Promise<Category[]> {
  const userId = getUserId()
  if (!userId) return []
  
  const { data, error } = await supabase!
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name')
  
  if (error) throw error
  return data || []
}

export async function listCategoriesByType(type: 'expense' | 'income'): Promise<Category[]> {
  const userId = getUserId()
  if (!userId) return []
  
  const { data, error } = await supabase!
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .order('name')
  
  if (error) throw error
  return data || []
}

export async function upsertCategory(category: Omit<Category, 'id'> & { id?: string }): Promise<string> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const id = category.id || uid()
  const { error } = await supabase!
    .from('categories')
    .upsert({ ...category, id, user_id: userId }, { onConflict: 'id' })
  
  if (error) throw error
  return id
}

export async function deleteCategory(id: string): Promise<void> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const { error } = await supabase!
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) throw error
}

// ---- Accounts ----
export async function listAccounts(): Promise<Account[]> {
  const userId = getUserId()
  if (!userId) return []
  
  const { data, error } = await supabase!
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('name')
  
  if (error) throw error
  return data || []
}

export async function upsertAccount(account: Omit<Account, 'id'> & { id?: string }): Promise<string> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const id = account.id || uid()
  const { error } = await supabase!
    .from('accounts')
    .upsert({ ...account, id, user_id: userId }, { onConflict: 'id' })
  
  if (error) throw error
  return id
}

export async function deleteAccount(id: string): Promise<void> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const { error } = await supabase!
    .from('accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) throw error
}

// ---- Bills ----
export async function listBills(): Promise<Bill[]> {
  const userId = getUserId()
  if (!userId) return []
  
  const { data, error } = await supabase!
    .from('bills')
    .select('*')
    .eq('user_id', userId)
    .order('due_day')
  
  if (error) throw error
  return data || []
}

export async function upsertBill(bill: Omit<Bill, 'id'> & { id?: string }): Promise<string> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const id = bill.id || uid()
  const { error } = await supabase!
    .from('bills')
    .upsert({ ...bill, id, user_id: userId }, { onConflict: 'id' })
  
  if (error) throw error
  return id
}

export async function deleteBill(id: string): Promise<void> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const { error } = await supabase!
    .from('bills')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) throw error
}

// ---- Bill Payments ----
export async function markBillPaid(billId: string, amount?: number): Promise<string> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  // Get bill to get amount if not provided
  const { data: bill } = await supabase!
    .from('bills')
    .select('amount')
    .eq('id', billId)
    .eq('user_id', userId)
    .single()
  
  if (!bill) throw new Error('Bill not found')
  
  const today = new Date().toISOString().split('T')[0]
  const month = today.slice(0, 7) + '-01'
  
  const payment: Omit<BillPayment, 'id'> = {
    bill_id: billId,
    amount: amount ?? bill.amount,
    paid_on: today,
    month,
    status: 'paid'
  }
  
  const id = uid()
  const { error } = await supabase!
    .from('bill_payments')
    .upsert({ ...payment, id, user_id: userId }, { onConflict: 'user_id,bill_id,month' })
  
  if (error) throw error
  return id
}

export async function unmarkBillPaid(billId: string): Promise<void> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const today = new Date().toISOString().split('T')[0]
  const month = today.slice(0, 7) + '-01'
  
  const { error } = await supabase!
    .from('bill_payments')
    .delete()
    .eq('bill_id', billId)
    .eq('user_id', userId)
    .eq('month', month)
  
  if (error) throw error
}

export async function isBillPaidThisMonth(billId: string): Promise<boolean> {
  const userId = getUserId()
  if (!userId) return false
  
  const today = new Date().toISOString().split('T')[0]
  const month = today.slice(0, 7) + '-01'
  
  const { data, error } = await supabase!
    .from('bill_payments')
    .select('status')
    .eq('bill_id', billId)
    .eq('user_id', userId)
    .eq('month', month)
    .eq('status', 'paid')
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
  return !!data
}

// ---- Subscriptions ----
export async function listSubscriptions(): Promise<Subscription[]> {
  const userId = getUserId()
  if (!userId) return []
  
  const { data, error } = await supabase!
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('due_day')
  
  if (error) throw error
  return data || []
}

export async function upsertSubscription(subscription: Omit<Subscription, 'id'> & { id?: string }): Promise<string> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const id = subscription.id || uid()
  const { error } = await supabase!
    .from('subscriptions')
    .upsert({ ...subscription, id, user_id: userId }, { onConflict: 'id' })
  
  if (error) throw error
  return id
}

export async function deleteSubscription(id: string): Promise<void> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const { error } = await supabase!
    .from('subscriptions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) throw error
}

export async function markSubscriptionPaid(subscriptionId: string, amount?: number): Promise<string> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const { data: subscription } = await supabase!
    .from('subscriptions')
    .select('amount')
    .eq('id', subscriptionId)
    .eq('user_id', userId)
    .single()
  
  if (!subscription) throw new Error('Subscription not found')
  
  const today = new Date().toISOString().split('T')[0]
  const month = today.slice(0, 7) + '-01'
  
  const id = uid()
  const { error } = await supabase!
    .from('subscription_payments')
    .upsert({
      id,
      subscription_id: subscriptionId,
      amount: amount ?? subscription.amount,
      paid_on: today,
      month,
      status: 'paid',
      user_id: userId
    }, { onConflict: 'user_id,subscription_id,month' })
  
  if (error) throw error
  return id
}

export async function unmarkSubscriptionPaid(subscriptionId: string): Promise<void> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const today = new Date().toISOString().split('T')[0]
  const month = today.slice(0, 7) + '-01'
  
  const { error } = await supabase!
    .from('subscription_payments')
    .delete()
    .eq('subscription_id', subscriptionId)
    .eq('user_id', userId)
    .eq('month', month)
  
  if (error) throw error
}

export async function isSubscriptionPaidThisMonth(subscriptionId: string): Promise<boolean> {
  const userId = getUserId()
  if (!userId) return false
  
  const today = new Date().toISOString().split('T')[0]
  const month = today.slice(0, 7) + '-01'
  
  const { data, error } = await supabase!
    .from('subscription_payments')
    .select('status')
    .eq('subscription_id', subscriptionId)
    .eq('user_id', userId)
    .eq('month', month)
    .eq('status', 'paid')
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

// ---- Debts ----
export async function listDebts(): Promise<Debt[]> {
  const userId = getUserId()
  if (!userId) return []
  
  const { data, error } = await supabase!
    .from('debts')
    .select('*')
    .eq('user_id', userId)
    .order('due_day')
  
  if (error) throw error
  return data || []
}

export async function upsertDebt(debt: Omit<Debt, 'id'> & { id?: string }): Promise<string> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const id = debt.id || uid()
  const { error } = await supabase!
    .from('debts')
    .upsert({ ...debt, id, user_id: userId }, { onConflict: 'id' })
  
  if (error) throw error
  return id
}

export async function deleteDebt(id: string): Promise<void> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const { error } = await supabase!
    .from('debts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) throw error
}

export async function markDebtPaid(debtId: string, amount?: number): Promise<string> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const { data: debt } = await supabase!
    .from('debts')
    .select('minimum_payment')
    .eq('id', debtId)
    .eq('user_id', userId)
    .single()
  
  if (!debt) throw new Error('Debt not found')
  
  const today = new Date().toISOString().split('T')[0]
  const month = today.slice(0, 7) + '-01'
  
  const id = uid()
  const { error } = await supabase!
    .from('debt_payments')
    .upsert({
      id,
      debt_id: debtId,
      amount: amount ?? debt.minimum_payment,
      paid_on: today,
      month,
      status: 'paid',
      user_id: userId
    }, { onConflict: 'user_id,debt_id,month' })
  
  if (error) throw error
  return id
}

export async function unmarkDebtPaid(debtId: string): Promise<void> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const today = new Date().toISOString().split('T')[0]
  const month = today.slice(0, 7) + '-01'
  
  const { error } = await supabase!
    .from('debt_payments')
    .delete()
    .eq('debt_id', debtId)
    .eq('user_id', userId)
    .eq('month', month)
  
  if (error) throw error
}

export async function isDebtPaidThisMonth(debtId: string): Promise<boolean> {
  const userId = getUserId()
  if (!userId) return false
  
  const today = new Date().toISOString().split('T')[0]
  const month = today.slice(0, 7) + '-01'
  
  const { data, error } = await supabase!
    .from('debt_payments')
    .select('status')
    .eq('debt_id', debtId)
    .eq('user_id', userId)
    .eq('month', month)
    .eq('status', 'paid')
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

// ---- Transactions ----
export async function listTransactions(monthISO?: string): Promise<Transaction[]> {
  const userId = getUserId()
  if (!userId) return []
  
  let query = supabase!
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false })
  
  if (monthISO) {
    query = query.gte('transaction_date', `${monthISO}-01`)
      .lt('transaction_date', `${monthISO}-32`)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data || []
}

export async function addTransaction(transaction: Omit<Transaction, 'id'>): Promise<string> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const id = uid()
  const { error } = await supabase!
    .from('transactions')
    .insert({ ...transaction, id, user_id: userId })
  
  if (error) throw error
  return id
}

export async function deleteTransaction(id: string): Promise<void> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const { error } = await supabase!
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) throw error
}

// ---- Payoff Plans ----
export async function listPayoffPlans(): Promise<PayoffPlan[]> {
  const userId = getUserId()
  if (!userId) return []
  
  const { data, error } = await supabase!
    .from('payoff_plans')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function upsertPayoffPlan(plan: Omit<PayoffPlan, 'id'> & { id?: string }): Promise<string> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const id = plan.id || uid()
  const { error } = await supabase!
    .from('payoff_plans')
    .upsert({ ...plan, id, user_id: userId }, { onConflict: 'id' })
  
  if (error) throw error
  return id
}

export async function deletePayoffPlan(id: string): Promise<void> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const { error } = await supabase!
    .from('payoff_plans')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  
  if (error) throw error
}

// ---- Migration Helpers (Direct Payment Inserts) ----
export async function insertBillPayment(payment: BillPayment): Promise<void> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const { error } = await supabase!
    .from('bill_payments')
    .upsert({ ...payment, user_id: userId }, { onConflict: 'user_id,bill_id,month' })
  
  if (error) throw error
}

export async function insertSubscriptionPayment(payment: SubscriptionPayment): Promise<void> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const { error } = await supabase!
    .from('subscription_payments')
    .upsert({ ...payment, user_id: userId }, { onConflict: 'user_id,subscription_id,month' })
  
  if (error) throw error
}

export async function insertDebtPayment(payment: DebtPayment): Promise<void> {
  const userId = getUserId()
  if (!userId) throw new Error('Not authenticated')
  
  const { error } = await supabase!
    .from('debt_payments')
    .upsert({ ...payment, user_id: userId }, { onConflict: 'user_id,debt_id,month' })
  
  if (error) throw error
}
