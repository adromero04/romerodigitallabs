export type UUID = string

export type Frequency = 'monthly' | '12mo' | '24mo' | '36mo' | '48mo'

export type Category = {
  id: UUID
  name: string
  type: 'expense' | 'income'
}

export type Account = {
  id: UUID
  name: string
  type: 'checking' | 'credit_card' | 'loan' | 'cash'
}

export type Bill = {
  id: UUID
  name: string
  amount: number
  due_day: number // 1-31
  frequency: Frequency
  auto_pay: boolean
  category_id?: UUID
  account_id?: UUID
  is_active: boolean
  notes?: string
}

export type BillPayment = {
  id: UUID
  bill_id: UUID
  account_id?: UUID
  amount: number
  paid_on: string // yyyy-mm-dd
  month: string // yyyy-mm-01
  status: 'paid' | 'late' | 'partial'
}

export type SubscriptionPayment = {
  id: UUID
  subscription_id: UUID
  account_id?: UUID
  amount: number
  paid_on: string // yyyy-mm-dd
  month: string // yyyy-mm-01
  status: 'paid' | 'late' | 'partial'
}

export type DebtPayment = {
  id: UUID
  debt_id: UUID
  account_id?: UUID
  amount: number
  paid_on: string // yyyy-mm-dd
  month: string // yyyy-mm-01
  status: 'paid' | 'late' | 'partial'
}

export type Transaction = {
  id: UUID
  account_id?: UUID
  category_id?: UUID
  amount: number // negative = expense, positive = income
  type: 'expense' | 'income' | 'transfer'
  description: string
  transaction_date: string // yyyy-mm-dd
  bill_id?: UUID
}

export type Debt = {
  id: UUID
  name: string
  current_balance: number
  original_balance?: number
  interest_rate_annual: number // percent
  minimum_payment: number
  due_day: number
  auto_pay?: boolean
  notes?: string
}

export type PayoffStrategy = 'snowball' | 'avalanche' | 'custom'

export type PayoffPlan = {
  id: UUID
  name: string
  strategy: PayoffStrategy
  monthly_budget: number
  start_date: string // yyyy-mm-dd
}

export type Subscription = {
  id: UUID
  name: string
  amount: number
  due_day: number // 1-31
  frequency: Frequency
  category_id?: UUID
  account_id?: UUID
  is_active: boolean
  auto_pay?: boolean
  notes?: string
  start_date?: string // yyyy-mm-dd
}
