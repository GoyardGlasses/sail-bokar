/**
 * Reporting & Analytics Store
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { ReportingState, Report, Analytics } from './types'

interface ReportingStore extends ReportingState {
  addReport: (report: Report) => void
  removeReport: (id: string) => void
  addAnalytics: (analytics: Analytics) => void
  setSelectedReport: (id: string | undefined) => void
  setGenerating: (generating: boolean) => void
  setError: (error: string | null) => void
}

export const useReportingStore = create<ReportingStore>()(
  devtools(
    persist(
      (set) => ({
        reports: [],
        analytics: [],
        isGenerating: false,
        error: null,

        addReport: (report) =>
          set((state) => ({
            reports: [...state.reports, report],
          })),

        removeReport: (id) =>
          set((state) => ({
            reports: state.reports.filter((r) => r.id !== id),
          })),

        addAnalytics: (analytics) =>
          set((state) => ({
            analytics: [...state.analytics, analytics],
          })),

        setSelectedReport: (id) => set({ selectedReport: id }),
        setGenerating: (generating) => set({ isGenerating: generating }),
        setError: (error) => set({ error }),
      }),
      { name: 'reporting-store' }
    )
  )
)
