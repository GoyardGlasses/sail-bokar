import React, { useState } from 'react'
import { TrendingUp, BarChart3 } from 'lucide-react'
import ForecastPage from './ForecastPage'
import DemandPlanningPage from './DemandPlanningPage'
import DemandDecisionSupport from '../features/decisionSupport/components/DemandDecisionSupport'

export default function DemandPage() {
  const [activeTab, setActiveTab] = useState('forecast')

  const tabs = [
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'planning', label: 'Planning', icon: BarChart3 },
  ]

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="px-6 pt-6 pb-0 border-b border-slate-200 bg-slate-50">
        <h1 className="text-3xl font-bold text-slate-900">Demand</h1>
        <p className="text-slate-600 mt-1">
          Combined demand forecasting and planning workspace.
        </p>

        <div className="mt-4 mb-4 max-w-5xl">
          <DemandDecisionSupport />
        </div>

        <div className="mt-2 flex gap-2 border-b border-slate-200 overflow-x-auto pb-2">
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

      {activeTab === 'forecast' && <ForecastPage />}
      {activeTab === 'planning' && <DemandPlanningPage />}
    </div>
  )
}
