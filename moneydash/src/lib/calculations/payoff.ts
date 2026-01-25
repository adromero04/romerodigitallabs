import type { Debt, PayoffStrategy } from '../../types'

export function monthlyInterest(balance: number, aprPercent: number): number {
  const monthlyRate = aprPercent / 100 / 12
  return balance * monthlyRate
}

export type PayoffMonthRow = {
  monthIndex: number
  monthLabel: string
  totals: { startingBalance: number; interest: number; payment: number; endingBalance: number }
  perDebt: Array<{
    id: string
    name: string
    startingBalance: number
    interest: number
    payment: number
    endingBalance: number
  }>
}

function orderDebts(debts: Debt[], strategy: PayoffStrategy): Debt[] {
  if (strategy === 'avalanche') return [...debts].sort((a,b) => b.interest_rate_annual - a.interest_rate_annual)
  if (strategy === 'snowball') return [...debts].sort((a,b) => a.current_balance - b.current_balance)
  return [...debts]
}

export function projectPayoff(
  debtsIn: Debt[],
  monthlyBudget: number,
  strategy: PayoffStrategy,
  maxMonths = 240
): PayoffMonthRow[] {
  const debts = debtsIn.map(d => ({ ...d })) // clone
  const rows: PayoffMonthRow[] = []
  let month = new Date()
  month.setDate(1)

  for (let i=0; i<maxMonths; i++){
    const ordered = orderDebts(debts, strategy).filter(d => d.current_balance > 0.005)
    if (!ordered.length) break

    const startingBalance = ordered.reduce((s,d) => s + d.current_balance, 0)
    const minTotal = ordered.reduce((s,d) => s + d.minimum_payment, 0)
    let extra = Math.max(0, monthlyBudget - minTotal)

    const perDebt = ordered.map((d, idx) => {
      const interest = monthlyInterest(d.current_balance, d.interest_rate_annual)
      const totalOwed = d.current_balance + interest
      // Payment must be at least minimum_payment (if totalOwed allows), but cannot exceed totalOwed
      // If totalOwed >= minimum_payment, start with minimum_payment (can add extra later)
      // If totalOwed < minimum_payment, can only pay what's owed
      let payment = totalOwed >= d.minimum_payment ? d.minimum_payment : totalOwed
      // Apply extra budget to the first debt (highest priority based on strategy)
      if (idx === 0 && extra > 0) {
        payment = Math.min(totalOwed, payment + extra)
        extra = 0
      }
      const ending = Math.max(0, totalOwed - payment)
      // write back
      const target = debts.find(x => x.id === d.id)!
      target.current_balance = ending
      return { id: d.id, name: d.name, startingBalance: d.current_balance, interest, payment, endingBalance: ending }
    })

    const interestTotal = perDebt.reduce((s,p) => s + p.interest, 0)
    const paymentTotal = perDebt.reduce((s,p) => s + p.payment, 0)
    const endingBalance = perDebt.reduce((s,p) => s + p.endingBalance, 0)

    const label = month.toLocaleString(undefined, { month: 'short', year: 'numeric' })
    rows.push({
      monthIndex: i,
      monthLabel: label,
      totals: { startingBalance, interest: interestTotal, payment: paymentTotal, endingBalance },
      perDebt
    })

    month.setMonth(month.getMonth() + 1)
  }

  return rows
}
