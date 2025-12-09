import React, { useState } from 'react'
import { Database, BookOpen, Route as RouteIcon } from 'lucide-react'
import HistoricalDataPage from './HistoricalDataPage'
import HistoricalDecisionsPage from './HistoricalDecisionsPage'
import HistoricalDispatchPage from './HistoricalDispatchPage'

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState('data')

  const tabs = [
    { id: 'data', label: 'Historical Data', icon: Database },
    { id: 'decisions', label: 'Historical Decisions', icon: BookOpen },
    { id: 'dispatch', label: 'Historical Dispatch', icon: RouteIcon },
  ]

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="px-6 pt-6 pb-0 border-b border-slate-200 bg-slate-50">
        <h1 className="text-3xl font-bold text-slate-900">History</h1>
        <p className="text-slate-600 mt-1">
          View historical shipments, decisions, and dispatches in one place.
        </p>

        <div className="mt-4 flex gap-2 border-b border-slate-200 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {activeTab === 'data' && <HistoricalDataPage />}
      {activeTab === 'decisions' && <HistoricalDecisionsPage />}
      {activeTab === 'dispatch' && <HistoricalDispatchPage />}
    </div>
  )
}
