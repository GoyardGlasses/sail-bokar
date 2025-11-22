import { create } from 'zustand'

/**
 * Global app state store
 * Manages theme, user, health status, and notifications
 */
export const useAppStore = create((set) => ({
  // Theme
  theme: localStorage.getItem('theme') || 'light',
  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    set({ theme })
  },

  // Health
  isHealthy: false,
  setIsHealthy: (isHealthy) => set({ isHealthy }),

  // Notifications
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, { id: Date.now(), ...notification }],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  // User
  user: null,
  setUser: (user) => set({ user }),

  // Loading
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
}))
