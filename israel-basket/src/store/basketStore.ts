import { create } from 'zustand'
import type { Product } from '../types'

interface BasketStore {
  selected: Map<number, Product>
  toggle: (product: Product) => void
  clear: () => void
  total: number
  count: number
}

export const useBasketStore = create<BasketStore>((set, get) => ({
  selected: new Map(),

  toggle: (product: Product) => {
    const next = new Map(get().selected)
    if (next.has(product.id)) {
      next.delete(product.id)
    } else {
      next.set(product.id, product)
    }
    const total = Array.from(next.values()).reduce(
      (sum, p) => sum + (p.price ?? 0),
      0
    )
    set({ selected: next, total: Math.round(total * 100) / 100, count: next.size })
  },

  clear: () => set({ selected: new Map(), total: 0, count: 0 }),

  total: 0,
  count: 0,
}))
