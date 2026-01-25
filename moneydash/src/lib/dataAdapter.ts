import type { Bill, BillPayment, Category, Debt, DebtPayment, Subscription, SubscriptionPayment, Transaction } from '../types'
import { db } from './db'
import { uid, todayISO, monthKey } from './utils'
import { supabase } from './supabaseClient'
import * as supabaseAdapter from './supabaseAdapter'

export type DataMode = 'local' | 'supabase'

// Get current data mode
export async function getMode(): Promise<DataMode> {
  const m = localStorage.getItem('moneydash.mode')
  return (m === 'supabase' ? 'supabase' : 'local')
}

export async function setMode(mode: DataMode) {
  localStorage.setItem('moneydash.mode', mode)
}

// Helper to check if we should use Supabase
async function shouldUseSupabase(): Promise<boolean> {
  const mode = await getMode()
  return mode === 'supabase' && supabase !== null
}

// ---- Bills ----
export async function listBills(): Promise<Bill[]> {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.listBills()
  }
  return db.bills.orderBy('due_day').toArray()
}

export async function upsertBill(bill: Omit<Bill,'id'> & { id?: string }): Promise<string> {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.upsertBill(bill)
  }
  const id = bill.id ?? uid()
  await db.bills.put({ ...bill, id })
  return id
}

export async function deleteBill(id: string) {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.deleteBill(id)
  }
  await db.bills.delete(id)
}

// ---- Bill Payments ----
export async function markBillPaid(billId: string, amount?: number): Promise<string> {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.markBillPaid(billId, amount)
  }
  
  const bill = await db.bills.get(billId)
  if (!bill) throw new Error('Bill not found')
  
  const today = todayISO()
  const month = monthKey(today)
  
  // Check if already paid this month
  const allPayments = await db.bill_payments.where('bill_id').equals(billId).toArray()
  const existing = allPayments.find(p => p.month === month)
  
  if (existing) {
    // Update existing payment
    await db.bill_payments.update(existing.id, {
      paid_on: today,
      amount: amount ?? bill.amount,
      status: 'paid'
    })
    return existing.id
  } else {
    // Create new payment
    const id = uid()
    await db.bill_payments.add({
      id,
      bill_id: billId,
      amount: amount ?? bill.amount,
      paid_on: today,
      month,
      status: 'paid'
    })
    return id
  }
}

export async function unmarkBillPaid(billId: string): Promise<void> {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.unmarkBillPaid(billId)
  }
  
  const today = todayISO()
  const month = monthKey(today)
  
  const allPayments = await db.bill_payments.where('bill_id').equals(billId).toArray()
  const payment = allPayments.find(p => p.month === month)
  
  if (payment) {
    await db.bill_payments.delete(payment.id)
  }
}

export async function isBillPaidThisMonth(billId: string): Promise<boolean> {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.isBillPaidThisMonth(billId)
  }
  
  const today = todayISO()
  const month = monthKey(today)
  
  const allPayments = await db.bill_payments.where('bill_id').equals(billId).toArray()
  const payment = allPayments.find(p => p.month === month)
  
  return !!payment && payment.status === 'paid'
}

// ---- Transactions ----
export async function listTransactions(monthISO?: string): Promise<Transaction[]> {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.listTransactions(monthISO)
  }
  const all = await db.transactions.orderBy('transaction_date').reverse().toArray()
  if (!monthISO) return all
  const [y,m] = monthISO.split('-')
  return all.filter(t => t.transaction_date.startsWith(`${y}-${m}-`))
}

export async function addTransaction(tx: Omit<Transaction,'id'>): Promise<string> {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.addTransaction(tx)
  }
  const id = uid()
  await db.transactions.add({ ...tx, id })
  return id
}

// ---- Debts ----
export async function listDebts(): Promise<Debt[]> {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.listDebts()
  }
  return db.debts.orderBy('current_balance').toArray()
}

export async function upsertDebt(debt: Omit<Debt,'id'> & { id?: string }): Promise<string> {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.upsertDebt(debt)
  }
  const id = debt.id ?? uid()
  await db.debts.put({ ...debt, id })
  return id
}

export async function deleteDebt(id: string) {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.deleteDebt(id)
  }
  await db.debts.delete(id)
}

// ---- Categories ----
export async function listCategories(): Promise<Category[]> {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.listCategories()
  }
  return db.categories.orderBy('name').toArray()
}

export async function listCategoriesByType(type: 'expense' | 'income'): Promise<Category[]> {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.listCategoriesByType(type)
  }
  return db.categories.where('type').equals(type).sortBy('name')
}

// ---- Subscriptions ----
export async function listSubscriptions(): Promise<Subscription[]> {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.listSubscriptions()
  }
  return db.subscriptions.orderBy('due_day').toArray()
}

export async function upsertSubscription(subscription: Omit<Subscription,'id'> & { id?: string }): Promise<string> {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.upsertSubscription(subscription)
  }
  const id = subscription.id ?? uid()
  await db.subscriptions.put({ ...subscription, id })
  return id
}

export async function deleteSubscription(id: string) {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.deleteSubscription(id)
  }
  await db.subscriptions.delete(id)
}

// ---- Subscription Payments ----
export async function markSubscriptionPaid(subscriptionId: string, amount?: number): Promise<string> {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.markSubscriptionPaid(subscriptionId, amount)
  }
  
  const subscription = await db.subscriptions.get(subscriptionId)
  if (!subscription) throw new Error('Subscription not found')
  
  const today = todayISO()
  const month = monthKey(today)
  
  const allPayments = await db.subscription_payments.where('subscription_id').equals(subscriptionId).toArray()
  const existing = allPayments.find(p => p.month === month)
  
  if (existing) {
    await db.subscription_payments.update(existing.id, {
      paid_on: today,
      amount: amount ?? subscription.amount,
      status: 'paid'
    })
    return existing.id
  } else {
    const id = uid()
    await db.subscription_payments.add({
      id,
      subscription_id: subscriptionId,
      amount: amount ?? subscription.amount,
      paid_on: today,
      month,
      status: 'paid'
    })
    return id
  }
}

export async function unmarkSubscriptionPaid(subscriptionId: string): Promise<void> {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.unmarkSubscriptionPaid(subscriptionId)
  }
  
  const today = todayISO()
  const month = monthKey(today)
  
  const allPayments = await db.subscription_payments.where('subscription_id').equals(subscriptionId).toArray()
  const payment = allPayments.find(p => p.month === month)
  
  if (payment) {
    await db.subscription_payments.delete(payment.id)
  }
}

export async function isSubscriptionPaidThisMonth(subscriptionId: string): Promise<boolean> {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.isSubscriptionPaidThisMonth(subscriptionId)
  }
  
  const today = todayISO()
  const month = monthKey(today)
  
  const allPayments = await db.subscription_payments.where('subscription_id').equals(subscriptionId).toArray()
  const payment = allPayments.find(p => p.month === month)
  
  return !!payment && payment.status === 'paid'
}

// ---- Debt Payments ----
export async function markDebtPaid(debtId: string, amount?: number): Promise<string> {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.markDebtPaid(debtId, amount)
  }
  
  const debt = await db.debts.get(debtId)
  if (!debt) throw new Error('Debt not found')
  
  const today = todayISO()
  const month = monthKey(today)
  
  const allPayments = await db.debt_payments.where('debt_id').equals(debtId).toArray()
  const existing = allPayments.find(p => p.month === month)
  
  if (existing) {
    await db.debt_payments.update(existing.id, {
      paid_on: today,
      amount: amount ?? debt.minimum_payment,
      status: 'paid'
    })
    return existing.id
  } else {
    const id = uid()
    await db.debt_payments.add({
      id,
      debt_id: debtId,
      amount: amount ?? debt.minimum_payment,
      paid_on: today,
      month,
      status: 'paid'
    })
    return id
  }
}

export async function unmarkDebtPaid(debtId: string): Promise<void> {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.unmarkDebtPaid(debtId)
  }
  
  const today = todayISO()
  const month = monthKey(today)
  
  const allPayments = await db.debt_payments.where('debt_id').equals(debtId).toArray()
  const payment = allPayments.find(p => p.month === month)
  
  if (payment) {
    await db.debt_payments.delete(payment.id)
  }
}

export async function isDebtPaidThisMonth(debtId: string): Promise<boolean> {
  if (await shouldUseSupabase()) {
    return supabaseAdapter.isDebtPaidThisMonth(debtId)
  }
  
  const today = todayISO()
  const month = monthKey(today)
  
  const allPayments = await db.debt_payments.where('debt_id').equals(debtId).toArray()
  const payment = allPayments.find(p => p.month === month)
  
  return !!payment && payment.status === 'paid'
}
