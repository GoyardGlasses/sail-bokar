/**
 * Constraints Management Store
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import {
  ConstraintsManagementState,
  Constraint,
  ConstraintViolation,
  ConstraintRule,
  ConstraintValidationResult,
} from './types'

interface ConstraintsManagementStore extends ConstraintsManagementState {
  addConstraint: (constraint: Constraint) => void
  updateConstraint: (id: string, constraint: Partial<Constraint>) => void
  removeConstraint: (id: string) => void
  addViolation: (violation: ConstraintViolation) => void
  clearViolations: () => void
  addRule: (rule: ConstraintRule) => void
  validateConstraints: () => ConstraintValidationResult
  setSelectedConstraint: (id: string | undefined) => void
  setValidating: (validating: boolean) => void
  setError: (error: string | null) => void
}

export const useConstraintsManagementStore = create<ConstraintsManagementStore>()(
  devtools(
    persist(
      (set, get) => ({
        constraints: [],
        violations: [],
        rules: [],
        isValidating: false,
        error: null,

        addConstraint: (constraint) =>
          set((state) => ({
            constraints: [...state.constraints, constraint],
          })),

        updateConstraint: (id, updates) =>
          set((state) => ({
            constraints: state.constraints.map((c) => (c.id === id ? { ...c, ...updates } : c)),
          })),

        removeConstraint: (id) =>
          set((state) => ({
            constraints: state.constraints.filter((c) => c.id !== id),
          })),

        addViolation: (violation) =>
          set((state) => ({
            violations: [...state.violations, violation],
          })),

        clearViolations: () => set({ violations: [] }),

        addRule: (rule) =>
          set((state) => ({
            rules: [...state.rules, rule],
          })),

        validateConstraints: () => {
          const state = get()
          return {
            isValid: state.violations.length === 0,
            violations: state.violations.filter((v) => v.violationType === 'breach'),
            warnings: state.violations.filter((v) => v.violationType === 'warning'),
            suggestions: [],
            validationTime: 0,
          }
        },

        setSelectedConstraint: (id) => set({ selectedConstraint: id }),
        setValidating: (validating) => set({ isValidating: validating }),
        setError: (error) => set({ error }),
      }),
      { name: 'constraints-management-store' }
    )
  )
)
