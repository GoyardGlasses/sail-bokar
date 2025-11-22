import { create } from 'zustand'

export const useInventoryStore = create((set) => ({
  inventory: {},
  loading: false,
  error: null,

  setInventory: (inventory) => set({ inventory }),
  updateStock: (material, quantity) =>
    set((state) => ({
      inventory: {
        ...state.inventory,
        [material]: quantity,
      },
    })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
