/**
 * Inventory Management Store
 * Zustand store for complete inventory management
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import {
  InventoryState,
  MaterialInventory,
  Rake,
  Wagon,
  LoadingPoint,
  LoadingSchedule,
  Siding,
  MaterialAlert,
  RakeAlert,
  LoadingPointAlert,
  SidingAlert,
  InventorySummary,
} from './types'

interface InventoryStore extends InventoryState {
  // Material Inventory Actions
  addMaterialInventory: (material: MaterialInventory) => void
  updateMaterialInventory: (id: string, material: Partial<MaterialInventory>) => void
  removeMaterialInventory: (id: string) => void
  getMaterialsByStockyard: (stockyardId: string) => MaterialInventory[]
  addMaterialAlert: (alert: MaterialAlert) => void
  resolveMaterialAlert: (alertId: string) => void

  // Rake & Wagon Actions
  addRake: (rake: Rake) => void
  updateRake: (id: string, rake: Partial<Rake>) => void
  removeRake: (id: string) => void
  getAvailableRakes: () => Rake[]
  addWagon: (wagon: Wagon) => void
  updateWagon: (id: string, wagon: Partial<Wagon>) => void
  removeWagon: (id: string) => void
  addRakeAlert: (alert: RakeAlert) => void
  resolveRakeAlert: (alertId: string) => void

  // Loading Point Actions
  addLoadingPoint: (point: LoadingPoint) => void
  updateLoadingPoint: (id: string, point: Partial<LoadingPoint>) => void
  removeLoadingPoint: (id: string) => void
  addLoadingSchedule: (schedule: LoadingSchedule) => void
  updateLoadingSchedule: (id: string, schedule: Partial<LoadingSchedule>) => void
  removeLoadingSchedule: (id: string) => void
  addLoadingPointAlert: (alert: LoadingPointAlert) => void
  resolveLoadingPointAlert: (alertId: string) => void

  // Siding Actions
  addSiding: (siding: Siding) => void
  updateSiding: (id: string, siding: Partial<Siding>) => void
  removeSiding: (id: string) => void
  addSidingAlert: (alert: SidingAlert) => void
  resolveSidingAlert: (alertId: string) => void

  // UI Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSelectedStockyard: (stockyardId: string | undefined) => void
  setSelectedRake: (rakeId: string | undefined) => void
  setSelectedLoadingPoint: (pointId: string | undefined) => void

  // Summary & Analytics
  getInventorySummary: () => InventorySummary
  getTotalAlerts: () => number
  getCriticalAlerts: () => (MaterialAlert | RakeAlert | LoadingPointAlert | SidingAlert)[]
}

export const useInventoryStore = create<InventoryStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        materialInventories: [],
        materialAlerts: [],
        rakes: [],
        wagons: [],
        wagonTypes: [],
        rakeAlerts: [],
        loadingPoints: [],
        loadingSchedules: [],
        loadingPointAlerts: [],
        sidings: [],
        sidingAlerts: [],
        isLoading: false,
        error: null,

        // Material Inventory Actions
        addMaterialInventory: (material) =>
          set((state) => ({
            materialInventories: [...state.materialInventories, material],
          })),

        updateMaterialInventory: (id, updates) =>
          set((state) => ({
            materialInventories: state.materialInventories.map((m) =>
              m.id === id ? { ...m, ...updates } : m
            ),
          })),

        removeMaterialInventory: (id) =>
          set((state) => ({
            materialInventories: state.materialInventories.filter((m) => m.id !== id),
          })),

        getMaterialsByStockyard: (stockyardId) => {
          const state = get()
          return state.materialInventories.filter((m) => m.stockyardId === stockyardId)
        },

        addMaterialAlert: (alert) =>
          set((state) => ({
            materialAlerts: [...state.materialAlerts, alert],
          })),

        resolveMaterialAlert: (alertId) =>
          set((state) => ({
            materialAlerts: state.materialAlerts.map((a) =>
              a.id === alertId ? { ...a, resolved: true } : a
            ),
          })),

        // Rake & Wagon Actions
        addRake: (rake) =>
          set((state) => ({
            rakes: [...state.rakes, rake],
          })),

        updateRake: (id, updates) =>
          set((state) => ({
            rakes: state.rakes.map((r) => (r.id === id ? { ...r, ...updates } : r)),
          })),

        removeRake: (id) =>
          set((state) => ({
            rakes: state.rakes.filter((r) => r.id !== id),
          })),

        getAvailableRakes: () => {
          const state = get()
          return state.rakes.filter((r) => r.status === 'available')
        },

        addWagon: (wagon) =>
          set((state) => ({
            wagons: [...state.wagons, wagon],
          })),

        updateWagon: (id, updates) =>
          set((state) => ({
            wagons: state.wagons.map((w) => (w.id === id ? { ...w, ...updates } : w)),
          })),

        removeWagon: (id) =>
          set((state) => ({
            wagons: state.wagons.filter((w) => w.id !== id),
          })),

        addRakeAlert: (alert) =>
          set((state) => ({
            rakeAlerts: [...state.rakeAlerts, alert],
          })),

        resolveRakeAlert: (alertId) =>
          set((state) => ({
            rakeAlerts: state.rakeAlerts.map((a) =>
              a.id === alertId ? { ...a, resolved: true } : a
            ),
          })),

        // Loading Point Actions
        addLoadingPoint: (point) =>
          set((state) => ({
            loadingPoints: [...state.loadingPoints, point],
          })),

        updateLoadingPoint: (id, updates) =>
          set((state) => ({
            loadingPoints: state.loadingPoints.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            ),
          })),

        removeLoadingPoint: (id) =>
          set((state) => ({
            loadingPoints: state.loadingPoints.filter((p) => p.id !== id),
          })),

        addLoadingSchedule: (schedule) =>
          set((state) => ({
            loadingSchedules: [...state.loadingSchedules, schedule],
          })),

        updateLoadingSchedule: (id, updates) =>
          set((state) => ({
            loadingSchedules: state.loadingSchedules.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
          })),

        removeLoadingSchedule: (id) =>
          set((state) => ({
            loadingSchedules: state.loadingSchedules.filter((s) => s.id !== id),
          })),

        addLoadingPointAlert: (alert) =>
          set((state) => ({
            loadingPointAlerts: [...state.loadingPointAlerts, alert],
          })),

        resolveLoadingPointAlert: (alertId) =>
          set((state) => ({
            loadingPointAlerts: state.loadingPointAlerts.map((a) =>
              a.id === alertId ? { ...a, resolved: true } : a
            ),
          })),

        // Siding Actions
        addSiding: (siding) =>
          set((state) => ({
            sidings: [...state.sidings, siding],
          })),

        updateSiding: (id, updates) =>
          set((state) => ({
            sidings: state.sidings.map((s) => (s.id === id ? { ...s, ...updates } : s)),
          })),

        removeSiding: (id) =>
          set((state) => ({
            sidings: state.sidings.filter((s) => s.id !== id),
          })),

        addSidingAlert: (alert) =>
          set((state) => ({
            sidingAlerts: [...state.sidingAlerts, alert],
          })),

        resolveSidingAlert: (alertId) =>
          set((state) => ({
            sidingAlerts: state.sidingAlerts.map((a) =>
              a.id === alertId ? { ...a, resolved: true } : a
            ),
          })),

        // UI Actions
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        setSelectedStockyard: (stockyardId) => set({ selectedStockyard: stockyardId }),
        setSelectedRake: (rakeId) => set({ selectedRake: rakeId }),
        setSelectedLoadingPoint: (pointId) => set({ selectedLoadingPoint: pointId }),

        // Summary & Analytics
        getInventorySummary: () => {
          const state = get()
          const totalMaterialQuantity = state.materialInventories.reduce(
            (sum, m) => sum + m.quantity,
            0
          )
          const totalRakeCapacity = state.rakes.reduce((sum, r) => sum + r.totalCapacity, 0)
          const totalRakeUtilization =
            totalRakeCapacity > 0
              ? (state.rakes.reduce((sum, r) => sum + r.currentLoad, 0) / totalRakeCapacity) * 100
              : 0

          return {
            totalMaterialQuantity,
            totalRakeCapacity,
            totalRakeUtilization: Math.round(totalRakeUtilization),
            availableRakes: state.rakes.filter((r) => r.status === 'available').length,
            utilizationByMaterial: {},
            utilizationByStockyard: {},
            criticalAlerts: state.materialAlerts.filter((a) => a.severity === 'critical').length +
              state.rakeAlerts.filter((a) => a.severity === 'critical').length +
              state.loadingPointAlerts.filter((a) => a.severity === 'critical').length +
              state.sidingAlerts.filter((a) => a.severity === 'critical').length,
            warningAlerts: state.materialAlerts.filter((a) => a.severity === 'warning').length +
              state.rakeAlerts.filter((a) => a.severity === 'warning').length +
              state.loadingPointAlerts.filter((a) => a.severity === 'warning').length +
              state.sidingAlerts.filter((a) => a.severity === 'warning').length,
          }
        },

        getTotalAlerts: () => {
          const state = get()
          return (
            state.materialAlerts.filter((a) => !a.resolved).length +
            state.rakeAlerts.filter((a) => !a.resolved).length +
            state.loadingPointAlerts.filter((a) => !a.resolved).length +
            state.sidingAlerts.filter((a) => !a.resolved).length
          )
        },

        getCriticalAlerts: () => {
          const state = get()
          return [
            ...state.materialAlerts.filter((a) => a.severity === 'critical' && !a.resolved),
            ...state.rakeAlerts.filter((a) => a.severity === 'critical' && !a.resolved),
            ...state.loadingPointAlerts.filter((a) => a.severity === 'critical' && !a.resolved),
            ...state.sidingAlerts.filter((a) => a.severity === 'critical' && !a.resolved),
          ]
        },
      }),
      {
        name: 'inventory-store',
      }
    )
  )
)
