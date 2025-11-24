/**
 * Order Management Store
 * Zustand store for complete order management
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import {
  OrderState,
  Order,
  OrderAllocation,
  OrderTracking,
  OrderFeasibility,
  OrderAlert,
  OrderAnalytics,
  OrderMetrics,
  OrderSummary,
  OrdersByPriority,
  OrdersByStatus,
} from './types'

interface OrderStore extends OrderState {
  // Order Actions
  addOrder: (order: Order) => void
  updateOrder: (id: string, order: Partial<Order>) => void
  removeOrder: (id: string) => void
  getOrder: (id: string) => Order | undefined
  getOrdersByStatus: (status: string) => Order[]
  getOrdersByPriority: (priority: string) => Order[]
  getOrdersByCustomer: (customerId: string) => Order[]

  // Allocation Actions
  addAllocation: (allocation: OrderAllocation) => void
  updateAllocation: (id: string, allocation: Partial<OrderAllocation>) => void
  removeAllocation: (id: string) => void
  getAllocationsByOrder: (orderId: string) => OrderAllocation[]

  // Tracking Actions
  addTracking: (tracking: OrderTracking) => void
  updateTracking: (orderId: string, tracking: Partial<OrderTracking>) => void
  getTracking: (orderId: string) => OrderTracking | undefined

  // Feasibility Actions
  addFeasibility: (feasibility: OrderFeasibility) => void
  updateFeasibility: (orderId: string, feasibility: Partial<OrderFeasibility>) => void
  getFeasibility: (orderId: string) => OrderFeasibility | undefined

  // Alert Actions
  addAlert: (alert: OrderAlert) => void
  updateAlert: (id: string, alert: Partial<OrderAlert>) => void
  removeAlert: (id: string) => void
  resolveAlert: (alertId: string) => void
  getAlertsByOrder: (orderId: string) => OrderAlert[]

  // Analytics Actions
  setAnalytics: (analytics: OrderAnalytics) => void
  addMetric: (metric: OrderMetrics) => void
  getMetrics: (days: number) => OrderMetrics[]

  // UI Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSelectedOrder: (orderId: string | undefined) => void
  setFilterStatus: (status: string | undefined) => void
  setFilterPriority: (priority: string | undefined) => void

  // Summary & Analytics
  getOrderSummary: () => OrderSummary
  getOrdersByStatusCount: () => OrdersByStatus
  getOrdersByPriorityCount: () => OrdersByPriority
  getTotalAlerts: () => number
  getCriticalAlerts: () => OrderAlert[]
}

export const useOrderStore = create<OrderStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        orders: [],
        allocations: [],
        tracking: [],
        feasibilities: [],
        alerts: [],
        analytics: null,
        metrics: [],
        isLoading: false,
        error: null,

        // Order Actions
        addOrder: (order) =>
          set((state) => ({
            orders: [...state.orders, order],
          })),

        updateOrder: (id, updates) =>
          set((state) => ({
            orders: state.orders.map((o) => (o.id === id ? { ...o, ...updates } : o)),
          })),

        removeOrder: (id) =>
          set((state) => ({
            orders: state.orders.filter((o) => o.id !== id),
          })),

        getOrder: (id) => {
          const state = get()
          return state.orders.find((o) => o.id === id)
        },

        getOrdersByStatus: (status) => {
          const state = get()
          return state.orders.filter((o) => o.status === status)
        },

        getOrdersByPriority: (priority) => {
          const state = get()
          return state.orders.filter((o) => o.priority === priority)
        },

        getOrdersByCustomer: (customerId) => {
          const state = get()
          return state.orders.filter((o) => o.customerId === customerId)
        },

        // Allocation Actions
        addAllocation: (allocation) =>
          set((state) => ({
            allocations: [...state.allocations, allocation],
          })),

        updateAllocation: (id, updates) =>
          set((state) => ({
            allocations: state.allocations.map((a) =>
              a.id === id ? { ...a, ...updates } : a
            ),
          })),

        removeAllocation: (id) =>
          set((state) => ({
            allocations: state.allocations.filter((a) => a.id !== id),
          })),

        getAllocationsByOrder: (orderId) => {
          const state = get()
          return state.allocations.filter((a) => a.orderId === orderId)
        },

        // Tracking Actions
        addTracking: (tracking) =>
          set((state) => ({
            tracking: [...state.tracking, tracking],
          })),

        updateTracking: (orderId, updates) =>
          set((state) => ({
            tracking: state.tracking.map((t) =>
              t.orderId === orderId ? { ...t, ...updates } : t
            ),
          })),

        getTracking: (orderId) => {
          const state = get()
          return state.tracking.find((t) => t.orderId === orderId)
        },

        // Feasibility Actions
        addFeasibility: (feasibility) =>
          set((state) => ({
            feasibilities: [...state.feasibilities, feasibility],
          })),

        updateFeasibility: (orderId, updates) =>
          set((state) => ({
            feasibilities: state.feasibilities.map((f) =>
              f.orderId === orderId ? { ...f, ...updates } : f
            ),
          })),

        getFeasibility: (orderId) => {
          const state = get()
          return state.feasibilities.find((f) => f.orderId === orderId)
        },

        // Alert Actions
        addAlert: (alert) =>
          set((state) => ({
            alerts: [...state.alerts, alert],
          })),

        updateAlert: (id, updates) =>
          set((state) => ({
            alerts: state.alerts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
          })),

        removeAlert: (id) =>
          set((state) => ({
            alerts: state.alerts.filter((a) => a.id !== id),
          })),

        resolveAlert: (alertId) =>
          set((state) => ({
            alerts: state.alerts.map((a) =>
              a.id === alertId ? { ...a, resolved: true } : a
            ),
          })),

        getAlertsByOrder: (orderId) => {
          const state = get()
          return state.alerts.filter((a) => a.orderId === orderId)
        },

        // Analytics Actions
        setAnalytics: (analytics) => set({ analytics }),

        addMetric: (metric) =>
          set((state) => ({
            metrics: [...state.metrics, metric],
          })),

        getMetrics: (days) => {
          const state = get()
          const cutoffDate = new Date()
          cutoffDate.setDate(cutoffDate.getDate() - days)
          return state.metrics.filter((m) => new Date(m.date) >= cutoffDate)
        },

        // UI Actions
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        setSelectedOrder: (orderId) => set({ selectedOrder: orderId }),
        setFilterStatus: (status) => set({ filterStatus: status as any }),
        setFilterPriority: (priority) => set({ filterPriority: priority as any }),

        // Summary & Analytics
        getOrderSummary: () => {
          const state = get()
          const orders = state.orders
          const delivered = orders.filter((o) => o.status === 'delivered')
          const delayed = orders.filter(
            (o) => o.status === 'delivered' && new Date(o.deliveryDate!) > new Date(o.requiredDeliveryDate)
          )

          return {
            totalOrders: orders.length,
            pendingOrders: orders.filter((o) => o.status === 'pending').length,
            allocatedOrders: orders.filter((o) => o.status === 'allocated').length,
            loadingOrders: orders.filter((o) => o.status === 'loading').length,
            dispatchedOrders: orders.filter((o) => o.status === 'dispatched').length,
            deliveredOrders: delivered.length,
            cancelledOrders: orders.filter((o) => o.status === 'cancelled').length,
            totalQuantity: orders.reduce((sum, o) => sum + o.totalQuantity, 0),
            totalValue: orders.reduce((sum, o) => sum + o.estimatedCost, 0),
            onTimeDeliveryRate:
              delivered.length > 0
                ? Math.round(((delivered.length - delayed.length) / delivered.length) * 100)
                : 0,
            slaComplianceRate: 95, // Mock value
            averageDeliveryTime: 48, // Mock value in hours
            criticalAlerts: state.alerts.filter((a) => a.severity === 'critical' && !a.resolved)
              .length,
          }
        },

        getOrdersByStatusCount: () => {
          const state = get()
          const orders = state.orders
          return {
            pending: orders.filter((o) => o.status === 'pending').length,
            allocated: orders.filter((o) => o.status === 'allocated').length,
            loading: orders.filter((o) => o.status === 'loading').length,
            dispatched: orders.filter((o) => o.status === 'dispatched').length,
            in_transit: orders.filter((o) => o.status === 'in_transit').length,
            delivered: orders.filter((o) => o.status === 'delivered').length,
            cancelled: orders.filter((o) => o.status === 'cancelled').length,
          }
        },

        getOrdersByPriorityCount: () => {
          const state = get()
          const orders = state.orders
          return {
            low: orders.filter((o) => o.priority === 'low').length,
            medium: orders.filter((o) => o.priority === 'medium').length,
            high: orders.filter((o) => o.priority === 'high').length,
            urgent: orders.filter((o) => o.priority === 'urgent').length,
          }
        },

        getTotalAlerts: () => {
          const state = get()
          return state.alerts.filter((a) => !a.resolved).length
        },

        getCriticalAlerts: () => {
          const state = get()
          return state.alerts.filter((a) => a.severity === 'critical' && !a.resolved)
        },
      }),
      {
        name: 'order-store',
      }
    )
  )
)
