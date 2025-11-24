/**
 * Product vs Wagon Matrix Store
 * Zustand store for compatibility matrix management
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import {
  ProductWagonMatrixState,
  CompatibilityMatrix,
  Compatibility,
  Product,
  WagonType,
  ProductConstraint,
  WagonConstraint,
  CompatibilityRule,
  CombinationRule,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  MatrixAnalysis,
  ProductAnalysis,
  WagonAnalysis,
} from './types'

interface ProductWagonMatrixStore extends ProductWagonMatrixState {
  // Matrix Actions
  setMatrix: (matrix: CompatibilityMatrix) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  removeProduct: (id: string) => void
  addWagonType: (wagon: WagonType) => void
  updateWagonType: (id: string, wagon: Partial<WagonType>) => void
  removeWagonType: (id: string) => void

  // Compatibility Actions
  addCompatibility: (compat: Compatibility) => void
  updateCompatibility: (productId: string, wagonTypeId: string, compat: Partial<Compatibility>) => void
  removeCompatibility: (productId: string, wagonTypeId: string) => void
  getCompatibility: (productId: string, wagonTypeId: string) => Compatibility | undefined

  // Constraint Actions
  addConstraint: (constraint: ProductConstraint | WagonConstraint) => void
  removeConstraint: (id: string) => void
  getConstraintsByProduct: (productId: string) => ProductConstraint[]
  getConstraintsByWagon: (wagonTypeId: string) => WagonConstraint[]

  // Rule Actions
  addRule: (rule: CompatibilityRule | CombinationRule) => void
  removeRule: (id: string) => void
  updateRule: (id: string, rule: Partial<CompatibilityRule | CombinationRule>) => void

  // Validation & Analysis
  validateCombination: (productId: string, wagonTypeId: string) => ValidationResult
  analyzeMatrix: () => MatrixAnalysis
  analyzeProduct: (productId: string) => ProductAnalysis
  analyzeWagon: (wagonTypeId: string) => WagonAnalysis

  // UI Actions
  setSelectedProduct: (productId: string | undefined) => void
  setSelectedWagon: (wagonTypeId: string | undefined) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useProductWagonMatrixStore = create<ProductWagonMatrixStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        matrix: null,
        products: [],
        wagonTypes: [],
        compatibilities: [],
        constraints: [],
        rules: [],
        isLoading: false,
        error: null,

        // Matrix Actions
        setMatrix: (matrix) => set({ matrix }),

        addProduct: (product) =>
          set((state) => ({
            products: [...state.products, product],
          })),

        updateProduct: (id, updates) =>
          set((state) => ({
            products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
          })),

        removeProduct: (id) =>
          set((state) => ({
            products: state.products.filter((p) => p.id !== id),
          })),

        addWagonType: (wagon) =>
          set((state) => ({
            wagonTypes: [...state.wagonTypes, wagon],
          })),

        updateWagonType: (id, updates) =>
          set((state) => ({
            wagonTypes: state.wagonTypes.map((w) => (w.id === id ? { ...w, ...updates } : w)),
          })),

        removeWagonType: (id) =>
          set((state) => ({
            wagonTypes: state.wagonTypes.filter((w) => w.id !== id),
          })),

        // Compatibility Actions
        addCompatibility: (compat) =>
          set((state) => ({
            compatibilities: [...state.compatibilities, compat],
          })),

        updateCompatibility: (productId, wagonTypeId, updates) =>
          set((state) => ({
            compatibilities: state.compatibilities.map((c) =>
              c.productId === productId && c.wagonTypeId === wagonTypeId
                ? { ...c, ...updates }
                : c
            ),
          })),

        removeCompatibility: (productId, wagonTypeId) =>
          set((state) => ({
            compatibilities: state.compatibilities.filter(
              (c) => !(c.productId === productId && c.wagonTypeId === wagonTypeId)
            ),
          })),

        getCompatibility: (productId, wagonTypeId) => {
          const state = get()
          return state.compatibilities.find(
            (c) => c.productId === productId && c.wagonTypeId === wagonTypeId
          )
        },

        // Constraint Actions
        addConstraint: (constraint) =>
          set((state) => ({
            constraints: [...state.constraints, constraint],
          })),

        removeConstraint: (id) =>
          set((state) => ({
            constraints: state.constraints.filter((c) => c.id !== id),
          })),

        getConstraintsByProduct: (productId) => {
          const state = get()
          return state.constraints.filter(
            (c) => 'productId' in c && c.productId === productId
          ) as ProductConstraint[]
        },

        getConstraintsByWagon: (wagonTypeId) => {
          const state = get()
          return state.constraints.filter(
            (c) => 'wagonTypeId' in c && c.wagonTypeId === wagonTypeId
          ) as WagonConstraint[]
        },

        // Rule Actions
        addRule: (rule) =>
          set((state) => ({
            rules: [...state.rules, rule],
          })),

        removeRule: (id) =>
          set((state) => ({
            rules: state.rules.filter((r) => r.id !== id),
          })),

        updateRule: (id, updates) =>
          set((state) => ({
            rules: state.rules.map((r) => (r.id === id ? { ...r, ...updates } as any : r)),
          })),

        // Validation & Analysis
        validateCombination: (productId, wagonTypeId): ValidationResult => {
          const state = get()
          const compat = state.compatibilities.find(
            (c) => c.productId === productId && c.wagonTypeId === wagonTypeId
          )

          if (!compat) {
            return {
              isValid: false,
              errors: [{ type: 'not_found', message: 'Compatibility not found', severity: 'error', affectedItems: [] }],
              warnings: [],
              suggestions: [],
            } as ValidationResult
          }

          const errors: ValidationError[] = compat.constraints.length > 0 ? [] : []
          const warnings: ValidationWarning[] = compat.efficiency < 60 ? [{ type: 'low_efficiency', message: 'Low efficiency rating', severity: 'warning', affectedItems: [] }] : []

          return {
            isValid: compat.isCompatible,
            errors,
            warnings,
            suggestions: compat.recommendations,
          } as ValidationResult
        },

        analyzeMatrix: () => {
          const state = get()
          const total = state.products.length * state.wagonTypes.length
          const compatible = state.compatibilities.filter((c) => c.isCompatible).length
          const avgEfficiency = state.compatibilities.reduce((sum, c) => sum + c.efficiency, 0) / Math.max(1, state.compatibilities.length)
          const avgSafety = state.compatibilities.reduce((sum, c) => sum + c.safetyRating, 0) / Math.max(1, state.compatibilities.length)
          const avgUtilization = state.compatibilities.reduce((sum, c) => sum + c.utilizationRating, 0) / Math.max(1, state.compatibilities.length)
          const criticalConstraints = state.constraints.filter((c) => c.severity === 'critical').length
          const warningConstraints = state.constraints.filter((c) => c.severity === 'warning').length

          return {
            totalProducts: state.products.length,
            totalWagons: state.wagonTypes.length,
            compatiblePairs: compatible,
            incompatiblePairs: total - compatible,
            compatibilityPercentage: (compatible / Math.max(1, total)) * 100,
            averageEfficiency: avgEfficiency,
            averageSafety: avgSafety,
            averageUtilization: avgUtilization,
            criticalConstraints,
            warningConstraints,
          }
        },

        analyzeProduct: (productId) => {
          const state = get()
          const product = state.products.find((p) => p.id === productId)
          if (!product) {
            return {
              productId,
              compatibleWagons: [],
              incompatibleWagons: [],
              bestWagon: null,
              worstWagon: null,
              averageEfficiency: 0,
              constraints: [],
            }
          }

          const compatibilities = state.compatibilities.filter((c) => c.productId === productId)
          const compatibleWagons = compatibilities
            .filter((c) => c.isCompatible)
            .map((c) => state.wagonTypes.find((w) => w.id === c.wagonTypeId))
            .filter((w) => w !== undefined) as WagonType[]

          const bestWagon = compatibleWagons.reduce((best, current) => {
            const bestCompat = compatibilities.find((c) => c.wagonTypeId === best.id)
            const currentCompat = compatibilities.find((c) => c.wagonTypeId === current.id)
            return (currentCompat?.efficiency || 0) > (bestCompat?.efficiency || 0) ? current : best
          }, compatibleWagons[0] || null)

          const avgEfficiency = compatibilities.reduce((sum, c) => sum + c.efficiency, 0) / Math.max(1, compatibilities.length)

          return {
            productId,
            compatibleWagons,
            incompatibleWagons: state.wagonTypes.filter((w) => !compatibleWagons.find((cw) => cw.id === w.id)),
            bestWagon,
            worstWagon: compatibleWagons[compatibleWagons.length - 1] || null,
            averageEfficiency: avgEfficiency,
            constraints: state.constraints.filter((c) => 'productId' in c && c.productId === productId) as ProductConstraint[],
          }
        },

        analyzeWagon: (wagonTypeId) => {
          const state = get()
          const wagon = state.wagonTypes.find((w) => w.id === wagonTypeId)
          if (!wagon) {
            return {
              wagonTypeId,
              compatibleProducts: [],
              incompatibleProducts: [],
              bestProduct: null,
              worstProduct: null,
              averageEfficiency: 0,
              constraints: [],
            }
          }

          const compatibilities = state.compatibilities.filter((c) => c.wagonTypeId === wagonTypeId)
          const compatibleProducts = compatibilities
            .filter((c) => c.isCompatible)
            .map((c) => state.products.find((p) => p.id === c.productId))
            .filter((p) => p !== undefined) as Product[]

          const avgEfficiency = compatibilities.reduce((sum, c) => sum + c.efficiency, 0) / Math.max(1, compatibilities.length)

          return {
            wagonTypeId,
            compatibleProducts,
            incompatibleProducts: state.products.filter((p) => !compatibleProducts.find((cp) => cp.id === p.id)),
            bestProduct: compatibleProducts[0] || null,
            worstProduct: compatibleProducts[compatibleProducts.length - 1] || null,
            averageEfficiency: avgEfficiency,
            constraints: state.constraints.filter((c) => 'wagonTypeId' in c && c.wagonTypeId === wagonTypeId) as WagonConstraint[],
          }
        },

        // UI Actions
        setSelectedProduct: (productId) => set({ selectedProduct: productId }),
        setSelectedWagon: (wagonTypeId) => set({ selectedWagon: wagonTypeId }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
      }),
      {
        name: 'product-wagon-matrix-store',
      }
    )
  )
)
