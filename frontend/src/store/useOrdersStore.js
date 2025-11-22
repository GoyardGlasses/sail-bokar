import { create } from 'zustand'

export const useOrdersStore = create((set) => ({
  orders: [],
  selectedOrders: [],
  loading: false,
  error: null,

  setOrders: (orders) => set({ orders }),
  addOrder: (order) =>
    set((state) => ({
      orders: [...state.orders, { ...order, id: Date.now() }],
    })),
  removeOrder: (id) =>
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    })),
  updateOrder: (id, updates) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    })),

  selectOrder: (id) =>
    set((state) => ({
      selectedOrders: state.selectedOrders.includes(id)
        ? state.selectedOrders.filter((oid) => oid !== id)
        : [...state.selectedOrders, id],
    })),
  selectAllOrders: () =>
    set((state) => ({
      selectedOrders: state.orders.map((o) => o.id),
    })),
  clearSelection: () => set({ selectedOrders: [] }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
