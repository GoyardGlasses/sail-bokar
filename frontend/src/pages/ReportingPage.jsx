import React, { useState } from 'react'
import { ReportBuilder, ReportManager, ReportDistribution, ReportingStats } from '../components/ReportingEngine'
import { FileText, Settings, Send, BarChart3 } from 'lucide-react'

export default function ReportingPage() {
  const [activeTab, setActiveTab] = useState('builder')

  const tabs = [
    { id: 'builder', label: 'Templates', icon: FileText },
    { id: 'manager', label: 'Reports', icon: BarChart3 },
    { id: 'distribution', label: 'Distribution', icon: Send },
    { id: 'stats', label: 'Statistics', icon: Settings },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Advanced Reporting Engine</h1>
        <p className="text-slate-600 mt-1">Create, manage, and distribute reports</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon size={20} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'builder' && <ReportBuilder />}
        {activeTab === 'manager' && <ReportManager />}
        {activeTab === 'distribution' && <ReportDistribution />}
        {activeTab === 'stats' && <ReportingStats />}
      </div>
    </div>
  )
}
