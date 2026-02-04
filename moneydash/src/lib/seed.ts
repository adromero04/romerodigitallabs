import { db } from './db'
import { uid } from './utils'
import { getMode, listCategories, upsertCategory } from './dataAdapter'

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

  const mode = await getMode()
  
  if (mode === 'supabase') {
    // For Supabase: get all categories and create missing ones
    const existing = await listCategories()
    const existingNames = new Set(existing.map(c => c.name))
    
    for (const cat of requiredCategories) {
      if (!existingNames.has(cat.name)) {
        await upsertCategory({ id: uid(), ...cat })
      }
    }
  } else {
    // For local: original logic with deduplication
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
}

export async function seedIfEmpty() {
  // Only ensure categories exist, no test data
  await ensureCategories()
}
