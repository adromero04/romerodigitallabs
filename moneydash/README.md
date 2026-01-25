# MoneyDash (starter)

A **local-first** expense tracker + debt payoff planner starter app, designed to be easy to open in **Cursor** and start building.

## What’s included
- React + Vite + TypeScript
- Simple dark UI (no Tailwind required)
- Local database using Dexie (IndexedDB)
- Pages:
  - Home (month overview)
  - Bills (CRUD)
  - Transactions (CRUD)
  - Debts (CRUD + snowball/avalanche projection)
  - Insights (simple rules-based insights)
  - Import CSV (upload/paste CSV + column mapping + import)
  - Settings (toggle local vs Supabase – Supabase adapter placeholder)

## Getting started
1. Unzip
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```

## CSV import notes
Banks format CSVs differently. The Import CSV page supports:
- Upload a `.csv` file or paste CSV
- Map Date / Description / Amount columns

If your bank exports **positive** numbers for expenses, add a “Flip sign” toggle (easy).

## Optional: Supabase (later)
If you want to sync across devices:
- Add env vars to `.env.local`:
  - `VITE_SUPABASE_URL=...`
  - `VITE_SUPABASE_ANON_KEY=...`
- Implement a `supabaseAdapter` in `src/lib/` and switch based on `moneydash.mode`.

## Next build steps
- Add Categories + Accounts UI
- Add Bill Payments screen + “mark as paid” flow
- Add Recurring detection from transactions
- Add AI assistant endpoint (Edge Function / Node API)
