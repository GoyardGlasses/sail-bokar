/**
 * Cost Analysis Dashboard
 * Detailed cost breakdown and optimization
 */

import React, { useState } from 'react'
import { DollarSign, TrendingDown, PieChart, AlertCircle, Zap } from 'lucide-react'
import { useCostAnalysisStore } from '../store'
import { DetailedCostBreakdown } from '../types'

export default function CostAnalysisDashboard() {
  const [activeTab, setActiveTab] = useState<'breakdown' | 'analysis' | 'optimization'>('breakdown')

  const { breakdowns, optimizations, getMetrics, getCostByCategory, getTotalSavings } = useCostAnalysisStore()

  // Mock data
  const mockBreakdowns: DetailedCostBreakdown[] = [
    {
      id: 'cb-001',
      orderId: 'ORD-001',
      quantity: 500,
      unit: 'tonnes',
      components: [
        { id: 'c1', name: 'Material Cost', category: 'material', amount: 50000, percentage: 40, description: 'Raw material', variability: 'variable' },
        { id: 'c2', name: 'Labor Cost', category: 'labor', amount: 25000, percentage: 20, description: 'Loading & handling', variability: 'variable' },
        { id: 'c3', name: 'Transport Cost', category: 'transport', amount: 37500, percentage: 30, description: 'Rail transport', variability: 'variable' },
        { id: 'c4', name: 'Overhead', category: 'overhead', amount: 12500, percentage: 10, description: 'Administration', variability: 'fixed' },
      ],
      subtotal: 125000,
      taxes: 0,
      discounts: 0,
      totalCost: 125000,
      costPerUnit: 250,
      margin: 25000,
      marginPercentage: 20,
      timestamp: '2025-11-24',
    },
    {
      id: 'cb-002',
      orderId: 'ORD-002',
      quantity: 300,
      unit: 'tonnes',
      components: [
        { id: 'c5', name: 'Material Cost', category: 'material', amount: 30000, percentage: 40, description: 'Raw material', variability: 'variable' },
        { id: 'c6', name: 'Labor Cost', category: 'labor', amount: 15000, percentage: 20, description: 'Loading & handling', variability: 'variable' },
        { id: 'c7', name: 'Transport Cost', category: 'transport', amount: 22500, percentage: 30, description: 'Road transport', variability: 'variable' },
        { id: 'c8', name: 'Overhead', category: 'overhead', amount: 7500, percentage: 10, description: 'Administration', variability: 'fixed' },
      ],
      subtotal: 75000,
      taxes: 0,
      discounts: 0,
      totalCost: 75000,
      costPerUnit: 250,
      margin: 15000,
      marginPercentage: 20,
      timestamp: '2025-11-24',
    },
  ]

  const metrics = getMetrics()
  const costByCategory = getCostByCategory()
  const totalSavings = getTotalSavings()

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Cost Analysis & Optimization
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Detailed cost breakdown and optimization recommendations
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Cost</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            ₹{metrics.totalCost.toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Average Cost</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            ₹{metrics.averageCost.toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Min Cost</p>
          <p className="text-2xl font-bold text-green-600">
            ₹{metrics.minCost.toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Max Cost</p>
          <p className="text-2xl font-bold text-red-600">
            ₹{metrics.maxCost.toLocaleString()}
          </p>
        </div>
        <div className="card bg-green-50 dark:bg-green-900/20">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Savings</p>
          <p className="text-2xl font-bold text-green-600">
            ₹{totalSavings.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'breakdown', label: 'Cost Breakdown', icon: PieChart },
          { id: 'analysis', label: 'Analysis', icon: DollarSign },
          { id: 'optimization', label: 'Optimization', icon: Zap },
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
      <div className="space-y-6">
        {/* Breakdown Tab */}
        {activeTab === 'breakdown' && (
          <div className="space-y-4">
            {mockBreakdowns.map((breakdown) => (
              <div key={breakdown.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-50">
                      {breakdown.orderId}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {breakdown.quantity} {breakdown.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Cost</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                      ₹{breakdown.totalCost.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {breakdown.components.map((comp) => (
                    <div key={comp.id} className="flex items-center justify-between text-sm">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          {comp.name}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {comp.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          ₹{comp.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {comp.percentage}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between">
                  <span className="font-semibold text-slate-900 dark:text-slate-50">
                    Cost per Unit
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-50">
                    ₹{breakdown.costPerUnit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">
                Cost by Category
              </h3>
              <div className="space-y-3">
                {costByCategory.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-50 capitalize">
                        {cat.category}
                      </p>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${cat.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-slate-900 dark:text-slate-50">
                        ₹{cat.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {cat.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">
                Cost Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Std Deviation</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                    ₹{metrics.standardDeviation.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Cost Efficiency</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                    {metrics.costEfficiency.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Optimization Tab */}
        {activeTab === 'optimization' && (
          <div className="space-y-4">
            {optimizations.length === 0 ? (
              <div className="card text-center py-8">
                <AlertCircle className="mx-auto text-slate-400 mb-3" size={32} />
                <p className="text-slate-600 dark:text-slate-400">
                  No optimizations available yet
                </p>
              </div>
            ) : (
              optimizations.map((opt) => (
                <div key={opt.id} className="card border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-50">
                        {opt.orderId}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Feasibility: {(opt.feasibility * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Savings</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{opt.savings.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {opt.savingsPercentage.toFixed(1)}% reduction
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
