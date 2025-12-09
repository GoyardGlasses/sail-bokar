import React, { useState } from 'react'
import { Train, Settings as OptimizerIcon, Truck } from 'lucide-react'
import RakeFormationDashboard from '../features/rakeFormation/components/RakeFormationDashboard'
import RakePlanner from './RakePlanner'
import RakeDispatchOptimization from '../features/rakeDispatch/components/RakeDispatchOptimization'

export default function RakesPage() {
  const [activeTab, setActiveTab] = useState('formation')

  const tabs = [
    { id: 'formation', label: 'Rake Formation', icon: Train },
    { id: 'optimizer', label: 'Rake Optimizer', icon: OptimizerIcon },
    { id: 'dispatch', label: 'Rake Dispatch', icon: Truck },
  ]

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="px-6 pt-6 pb-0 border-b border-slate-200 bg-slate-50">
        <h1 className="text-3xl font-bold text-slate-900">Rakes</h1>
        <p className="text-slate-600 mt-1">
          Combined workspace for rake formation, optimization, and dispatch.
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

      {activeTab === 'formation' && <RakeFormationDashboard />}
      {activeTab === 'optimizer' && <RakePlanner />}
      {activeTab === 'dispatch' && <RakeDispatchOptimization />}
    </div>
  )
}
