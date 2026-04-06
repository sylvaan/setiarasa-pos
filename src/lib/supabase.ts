import { createClient } from '@supabase/supabase-js'
import { CONFIG, IS_PROD } from './config'
import type { Order, Expense } from '../types'

// Initialize Supabase Client (Only if Supabase config exists)
export const supabase = (CONFIG.supabaseUrl && CONFIG.supabaseKey)
  ? createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey)
  : null

/**
 * Sync Order to Supabase (Only if in PROD mode)
 */
export const syncOrder = async (order: Order) => {
  if (!IS_PROD || !supabase) return { error: null }
  
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      id: order.id,
      timestamp: order.timestamp,
      items: order.items,
      total_amount: order.totalAmount
    }])
    
  return { data, error }
}

/**
 * Sync Expense to Supabase (Only if in PROD mode)
 */
export const syncExpense = async (expense: Expense) => {
  if (!IS_PROD || !supabase) return { error: null }
  
  const { data, error } = await supabase
    .from('expenses')
    .insert([{
      id: expense.id,
      timestamp: expense.timestamp,
      title: expense.title,
      amount: expense.amount,
      category: expense.category
    }])
    
  return { data, error }
}
