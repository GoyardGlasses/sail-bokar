import React, { useState } from 'react'
import {
  CapacityPlanning,
  OptimizationAlgorithms,
  PerformanceAnalytics,
  ConstraintManagement,
  ScenarioSimulation,
  RealTimeMonitoring,
  RecommendationsEngine,
} from '../components/ThroughputOptimizationFeatures'
import {
  ComparativeAnalysis,
  ResourceOptimization,
  ReportingInsights,
  PredictiveMaintenance,
  IntegrationAutomation,
} from '../components/ThroughputOptimizationFeatures2'
import { Zap, BarChart3, Eye, Bell, Lightbulb, Settings, Gauge, Wrench, TrendingUp, FileText, Brain, AlertCircle } from 'lucide-react'

export default function ThroughputOptimizationPage() {
  const [activeTab, setActiveTab] = useState('capacity')

  const tabs = [
    { id: 'capacity', label: 'Capacity Planning', icon: Gauge },
    { id: 'optimization', label: 'Optimization', icon: Zap },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'constraints', label: 'Constraints', icon: AlertCircle },
    { id: 'scenarios', label: 'Scenarios', icon: Lightbulb },
    { id: 'monitoring', label: 'Monitoring', icon: Bell },
    { id: 'recommendations', label: 'Recommendations', icon: Brain },
    { id: 'comparative', label: 'Comparative', icon: BarChart3 },
    { id: 'resources', label: 'Resources', icon: Settings },
    { id: 'reporting', label: 'Reporting', icon: FileText },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'integration', label: 'Integration', icon: Eye },
  ]

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Zap size={32} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">Throughput Optimization</h1>
        </div>
        <p className="text-slate-600">Advanced analytics and optimization for loading point throughput</p>
      </div>

      {/* Tabs Navigation */}
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
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'capacity' && <CapacityPlanning />}
      {activeTab === 'optimization' && <OptimizationAlgorithms />}
      {activeTab === 'performance' && <PerformanceAnalytics />}
      {activeTab === 'constraints' && <ConstraintManagement />}
      {activeTab === 'scenarios' && <ScenarioSimulation />}
      {activeTab === 'monitoring' && <RealTimeMonitoring />}
      {activeTab === 'recommendations' && <RecommendationsEngine />}
      {activeTab === 'comparative' && <ComparativeAnalysis />}
      {activeTab === 'resources' && <ResourceOptimization />}
      {activeTab === 'reporting' && <ReportingInsights />}
      {activeTab === 'maintenance' && <PredictiveMaintenance />}
      {activeTab === 'integration' && <IntegrationAutomation />}

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-start gap-3">
            <Zap size={20} className="text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-900 text-sm">Optimization</p>
              <p className="text-xs text-slate-600 mt-1">Implement algorithms and best practices to maximize throughput</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-start gap-3">
            <Bell size={20} className="text-green-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-900 text-sm">Monitoring</p>
              <p className="text-xs text-slate-600 mt-1">Real-time alerts and KPI tracking for operational excellence</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-start gap-3">
            <Brain size={20} className="text-purple-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-900 text-sm">Intelligence</p>
              <p className="text-xs text-slate-600 mt-1">AI-powered insights and predictive analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
