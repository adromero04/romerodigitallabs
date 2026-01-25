import Dexie, { type Table } from 'dexie'
import type { Account, Bill, BillPayment, Category, Debt, DebtPayment, PayoffPlan, Subscription, SubscriptionPayment, Transaction, UUID } from '../types'

export class MoneyDashDB extends Dexie {
  categories!: Table<Category, UUID>
  accounts!: Table<Account, UUID>
  bills!: Table<Bill, UUID>
  bill_payments!: Table<BillPayment, UUID>
  transactions!: Table<Transaction, UUID>
  debts!: Table<Debt, UUID>
  payoff_plans!: Table<PayoffPlan, UUID>
  subscriptions!: Table<Subscription, UUID>
  subscription_payments!: Table<SubscriptionPayment, UUID>
  debt_payments!: Table<DebtPayment, UUID>

  constructor() {
    super('moneydash')
    this.version(1).stores({
      categories: 'id, type, name',
      accounts: 'id, type, name',
      bills: 'id, due_day, is_active, name',
      bill_payments: 'id, bill_id, paid_on, month',
      transactions: 'id, transaction_date, type, amount, description',
      debts: 'id, due_day, interest_rate_annual, current_balance',
      payoff_plans: 'id, strategy, start_date'
    })
    this.version(2).stores({
      subscriptions: 'id, due_day, is_active, name'
    })
    this.version(3).stores({
      subscription_payments: 'id, subscription_id, paid_on, month',
      debt_payments: 'id, debt_id, paid_on, month'
    })
  }
}

export const db = new MoneyDashDB()
