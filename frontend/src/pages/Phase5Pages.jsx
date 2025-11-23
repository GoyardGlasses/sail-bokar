import React, { useState } from 'react'
import { CostBreakdown, CostOptimizations, ThroughputAnalysis, InventoryDashboard } from '../components/BusinessPages'
import { DollarSign, Zap, Package } from 'lucide-react'

// Cost Prediction Page
export function CostPredictionPage() {
  const [activeTab, setActiveTab] = useState('breakdown')

  const tabs = [
    { id: 'breakdown', label: 'Cost Breakdown', icon: DollarSign },
    { id: 'optimizations', label: 'Optimizations', icon: DollarSign },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Cost Prediction</h1>
        <p className="text-slate-600 mt-1">Analyze and optimize logistics costs</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
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

      <div>
        {activeTab === 'breakdown' && <CostBreakdown />}
        {activeTab === 'optimizations' && <CostOptimizations />}
      </div>
    </div>
  )
}

// Throughput Prediction Page
export function ThroughputPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Throughput Prediction</h1>
        <p className="text-slate-600 mt-1">Monitor capacity utilization and equipment efficiency</p>
      </div>

      <ThroughputAnalysis />
    </div>
  )
}

// Inventory Management Page
export function InventoryPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
        <p className="text-slate-600 mt-1">Optimize stock levels and reduce carrying costs</p>
      </div>

      <InventoryDashboard />
    </div>
  )
}
