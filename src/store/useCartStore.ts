import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, DoughOption, CartItem, Order } from '../types'

interface CartStore {
  items: CartItem[]
  orders: Order[]
  addItem: (product: Product, selectedDough?: DoughOption) => void
  removeItem: (itemId: string) => void // itemId is productId + doughId
  clearCart: () => void
  getTotal: () => number
  checkout: () => void
}

const calculateItemPrice = (product: Product, selectedDough?: DoughOption) => {
  const basePrice = product.basePrice
  const extraPrice = selectedDough?.extraPrice || 0
  
  if (product.isSpecialExtra && extraPrice > 0) {
    // Kalau Keju Susu dan bukan Original (extraPrice > 0), cuma tambah 1000
    return basePrice + 1000
  }
  return basePrice + extraPrice
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      orders: [],
      addItem: (product, selectedDough) => set((state) => {
        const doughId = selectedDough?.id || 'none'
        const itemId = `${product.id}-${doughId}`
        
        const existing = state.items.find((i) => `${i.id}-${i.selectedDough?.id || 'none'}` === itemId)
        const price = calculateItemPrice(product, selectedDough)

        if (existing) {
          return {
            items: state.items.map((i) => 
              `${i.id}-${i.selectedDough?.id || 'none'}` === itemId 
                ? { ...i, quantity: i.quantity + 1, totalItemPrice: price } 
                : i
            )
          }
        }
        
        const newItem: CartItem = {
          ...product,
          selectedDough,
          quantity: 1,
          totalItemPrice: price
        }
        return { items: [...state.items, newItem] }
      }),
      removeItem: (itemId) => set((state) => {
        const existing = state.items.find((i) => `${i.id}-${i.selectedDough?.id || 'none'}` === itemId)
        if (existing && existing.quantity > 1) {
          return {
            items: state.items.map((i) => 
              `${i.id}-${i.selectedDough?.id || 'none'}` === itemId 
                ? { ...i, quantity: i.quantity - 1 } 
                : i
            )
          }
        }
        return { items: state.items.filter((i) => `${i.id}-${i.selectedDough?.id || 'none'}` !== itemId) }
      }),
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((acc, item) => acc + (item.totalItemPrice * item.quantity), 0),
      checkout: () => {
        const { items, getTotal } = get()
        if (items.length === 0) return

        const newOrder: Order = {
          id: `OR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toISOString(),
          items: [...items],
          totalAmount: getTotal()
        }

        set((state) => ({
          orders: [newOrder, ...state.orders],
          items: []
        }))
      }
    }),
    { name: 'setiarasa-cart-v2' } // Bump version due to structural change
  )
)
