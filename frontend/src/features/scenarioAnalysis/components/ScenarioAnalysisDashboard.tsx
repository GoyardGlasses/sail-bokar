import React, { useState } from 'react'
import { TrendingUp, Plus, Trash2, Copy, Play, BarChart3, GitBranch } from 'lucide-react'

export default function ScenarioAnalysisDashboard() {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'comparison' | 'results'>('scenarios')

  const mockScenarios = [
    {
      id: 's-001',
      name: 'Base Case',
      description: 'Current operational baseline',
      status: 'active',
      rakeUtilization: 68.5,
      costPerTon: 950,
      onTimeRate: 92.3,
      createdAt: '2025-11-20',
    },
    {
      id: 's-002',
      name: 'Optimized Fleet',
      description: 'With 20% more rakes',
      status: 'completed',
      rakeUtilization: 85.2,
      costPerTon: 890,
      onTimeRate: 96.8,
      createdAt: '2025-11-22',
    },
    {
      id: 's-003',
      name: 'Cost Reduction',
      description: 'Focus on cost optimization',
      status: 'completed',
      rakeUtilization: 72.1,
      costPerTon: 820,
      onTimeRate: 89.5,
      createdAt: '2025-11-23',
    },
  ]

  const mockComparisons = [
    { metric: 'Rake Utilization', base: '68.5%', optimized: '85.2%', improvement: '+16.7%' },
    { metric: 'Cost Per Ton', base: '₹950', optimized: '₹890', improvement: '-6.3%' },
    { metric: 'On-Time Rate', base: '92.3%', optimized: '96.8%', improvement: '+4.5%' },
    { metric: 'Demurrage Savings', base: '₹0', optimized: '₹2.4L/mo', improvement: '+100%' },
  ]

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Scenario Analysis</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Advanced what-if scenario analysis & comparison</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={18} />
          New Scenario
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Scenarios</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-2">3</p>
          <p className="text-xs text-green-600 mt-1">1 active</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Best Utilization</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-2">85.2%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Optimized Fleet</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Lowest Cost</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-2">₹820</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cost Reduction</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Best On-Time</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-2">96.8%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Optimized Fleet</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'scenarios', label: 'Scenarios', icon: GitBranch },
          { id: 'comparison', label: 'Comparison', icon: BarChart3 },
          { id: 'results', label: 'Results', icon: TrendingUp },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`px-4 py-2 font-medium flex items-center gap-2 border-b-2 transition ${
              activeTab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 dark:text-slate-400'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'scenarios' && (
          <div className="space-y-3">
            {mockScenarios.map((scenario) => (
              <div key={scenario.id} className="card border-l-4 border-blue-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-slate-50">{scenario.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{scenario.description}</p>
                    <div className="flex gap-4 mt-3 text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Utilization: <span className="font-bold text-slate-900 dark:text-slate-50">{scenario.rakeUtilization}%</span>
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        Cost: <span className="font-bold text-slate-900 dark:text-slate-50">₹{scenario.costPerTon}</span>
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        On-Time: <span className="font-bold text-slate-900 dark:text-slate-50">{scenario.onTimeRate}%</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                      <Play size={18} className="text-green-600" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                      <Copy size={18} className="text-blue-600" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">Base Case vs Optimized Fleet</h3>
              <div className="space-y-4">
                {mockComparisons.map((item) => (
                  <div key={item.metric}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-50">{item.metric}</span>
                      <span className="text-sm font-bold text-green-600">{item.improvement}</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="flex-1">
                        <p className="text-slate-600 dark:text-slate-400 mb-1">Base: {item.base}</p>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded" />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-600 dark:text-slate-400 mb-1">Optimized: {item.optimized}</p>
                        <div className="h-2 bg-green-500 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">Performance Trends</h3>
              <div className="h-40 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/20 rounded flex items-center justify-center">
                <p className="text-slate-600 dark:text-slate-400">Chart: Scenario performance over time</p>
              </div>
            </div>
            <div className="card">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">Recommendation</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                  <p className="font-medium text-green-900 dark:text-green-100">✓ Optimized Fleet</p>
                  <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                    Best overall performance with 16.7% utilization improvement and 6.3% cost reduction
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
