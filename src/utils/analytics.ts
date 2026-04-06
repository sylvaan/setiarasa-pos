import type { Order, Expense } from '../types'

export const getTodayOrders = (orders: Order[]) => {
  const today = new Date().toDateString()
  return orders.filter(o => new Date(o.timestamp).toDateString() === today)
}

export const getTopProducts = (orders: Order[], analyticsRange: 'today' | 'week' | 'month') => {
  let filtered = orders
  const now = new Date()
  
  if (analyticsRange === 'today') {
    const today = now.toDateString()
    filtered = orders.filter(o => new Date(o.timestamp).toDateString() === today)
  } else if (analyticsRange === 'week') {
    const weekAgo = new Date()
    weekAgo.setDate(now.getDate() - 7)
    filtered = orders.filter(o => new Date(o.timestamp).getTime() >= weekAgo.getTime())
  } else if (analyticsRange === 'month') {
    const monthAgo = new Date()
    monthAgo.setMonth(now.getMonth() - 1)
    filtered = orders.filter(o => new Date(o.timestamp).getTime() >= monthAgo.getTime())
  }

  const counts: Record<string, { name: string, count: number, dough?: string }> = {}
  filtered.forEach(order => {
    order.items.forEach(item => {
      const key = `${item.id}-${item.selectedDough?.id || 'none'}`
      if (!counts[key]) {
        counts[key] = { name: item.name, count: 0, dough: item.selectedDough?.label }
      }
      counts[key].count += item.quantity
    })
  })
  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

export const getSalesTrend = (orders: Order[], analyticsRange: 'today' | 'week' | 'month') => {
  let buckets: { label: string, timestamp: number, amount: number, isToday?: boolean }[] = []
  const now = new Date()

  if (analyticsRange === 'today') {
    // Last 8 Hours
    buckets = [...Array(8)].map((_, i) => {
      const d = new Date(now)
      d.setHours(now.getHours() - (7 - i), 0, 0, 0)
      return {
        label: i === 7 ? 'Sekarang' : d.getHours() + ':00',
        timestamp: d.getTime(),
        amount: 0,
        isToday: i === 7
      }
    })
  } else if (analyticsRange === 'week') {
    // Last 7 Days
    buckets = [...Array(7)].map((_, i) => {
      const d = new Date(now)
      d.setDate(now.getDate() - (6 - i))
      d.setHours(0, 0, 0, 0)
      const isToday = d.toDateString() === now.toDateString()
      return {
        label: isToday ? 'Hari Ini' : d.toLocaleDateString('id-ID', { weekday: 'short' }),
        timestamp: d.getTime(),
        amount: 0,
        isToday
      }
    })
  } else if (analyticsRange === 'month') {
    // Last 30 Days
    buckets = [...Array(30)].map((_, i) => {
      const d = new Date(now)
      d.setDate(now.getDate() - (29 - i))
      d.setHours(0, 0, 0, 0)
      const isToday = d.toDateString() === now.toDateString()
      return {
        label: d.getDate().toString(),
        timestamp: d.getTime(),
        amount: 0,
        isToday
      }
    })
  }

  orders.forEach(order => {
    const orderTime = new Date(order.timestamp).getTime()
    const bucket = buckets.find((h, i) => {
      const nextTime = buckets[i + 1]?.timestamp || (h.timestamp + 3600000 * 24)
      return orderTime >= h.timestamp && orderTime < nextTime
    })
    if (bucket) bucket.amount += order.totalAmount
  })

  return buckets
}

export const calculateRevenue = (orders: Order[], analyticsRange: 'today' | 'week' | 'month') => {
  let filtered = orders
  const now = new Date()
  
  if (analyticsRange === 'today') {
    const today = now.toDateString()
    filtered = orders.filter(o => new Date(o.timestamp).toDateString() === today)
  } else if (analyticsRange === 'week') {
    const weekAgo = new Date()
    weekAgo.setDate(now.getDate() - 7)
    filtered = orders.filter(o => new Date(o.timestamp).getTime() >= weekAgo.getTime())
  } else if (analyticsRange === 'month') {
    const monthAgo = new Date()
    monthAgo.setMonth(now.getMonth() - 1)
    filtered = orders.filter(o => new Date(o.timestamp).getTime() >= monthAgo.getTime())
  }

  return filtered.reduce((acc, o) => acc + o.totalAmount, 0)
}

export const calculateExpenses = (expenses: Expense[], analyticsRange: 'today' | 'week' | 'month') => {
  let filtered = expenses
  const now = new Date()
  
  if (analyticsRange === 'today') {
    const today = now.toDateString()
    filtered = expenses.filter(e => new Date(e.timestamp).toDateString() === today)
  } else if (analyticsRange === 'week') {
    const weekAgo = new Date()
    weekAgo.setDate(now.getDate() - 7)
    filtered = expenses.filter(e => new Date(e.timestamp).getTime() >= weekAgo.getTime())
  } else if (analyticsRange === 'month') {
    const monthAgo = new Date()
    monthAgo.setMonth(now.getMonth() - 1)
    filtered = expenses.filter(e => new Date(e.timestamp).getTime() >= monthAgo.getTime())
  }

  return filtered.reduce((acc, e) => acc + e.amount, 0)
}
