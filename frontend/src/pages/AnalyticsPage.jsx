import React, { useState } from 'react'
import { DashboardBuilder, WidgetLibrary, AnalyticsDashboard, DrillDownAnalytics, ComparativeAnalytics } from '../components/AnalyticsSystem'
import { BarChart3, Grid, Layers, TrendingUp, GitCompare } from 'lucide-react'

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('dashboards')

  const tabs = [
    { id: 'dashboards', label: 'Dashboards', icon: Grid },
    { id: 'widgets', label: 'Widgets', icon: Layers },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'drilldown', label: 'Drill-Down', icon: TrendingUp },
    { id: 'comparison', label: 'Comparison', icon: GitCompare },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Advanced Analytics Dashboard</h1>
        <p className="text-slate-600 mt-1">Create custom dashboards and analyze your data</p>
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
        {activeTab === 'dashboards' && <DashboardBuilder />}
        {activeTab === 'widgets' && <WidgetLibrary />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'drilldown' && <DrillDownAnalytics />}
        {activeTab === 'comparison' && <ComparativeAnalytics />}
      </div>
    </div>
  )
}
