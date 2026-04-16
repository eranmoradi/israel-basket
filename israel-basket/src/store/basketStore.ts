import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '../types'

interface BasketStore {
  selected: Map<number, Product>
  toggle: (product: Product) => void
  clear: () => void
  total: number
  count: number
}

const sessionStorageAdapter = {
  getItem: (name: string) => {
    const str = sessionStorage.getItem(name)
    if (!str) return null
    const data = JSON.parse(str)
    if (Array.isArray(data?.state?.selected)) {
      data.state.selected = new Map(data.state.selected)
    }
    return data
  },
  setItem: (name: string, value: { state: BasketStore }) => {
    const data = {
      ...value,
      state: {
        ...value.state,
        selected: Array.from((value.state.selected as Map<number, Product>).entries()),
      },
    }
    sessionStorage.setItem(name, JSON.stringify(data))
  },
  removeItem: (name: string) => sessionStorage.removeItem(name),
}

export const useBasketStore = create<BasketStore>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: 'basket-session',
      storage: sessionStorageAdapter,
    }
  )
)
