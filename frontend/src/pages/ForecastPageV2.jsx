import React, { useState, useEffect } from 'react'
import {
  EnsembleForecasting,
  ProbabilisticForecasting,
  SensitivityAnalysis,
  ForecastBiasAnalysis,
  MonteCarloSimulation,
  DemandDriversAnalysis,
  ForecastVersionControl,
  ForecastCollaboration,
  ForecastExportShare,
} from '../components/ForecastEnhancementsV2'
import { BarChart3, TrendingUp, AlertCircle, Users, Settings, Download, MessageSquare, Zap, Eye, Award, Bell, Lock, GitBranch, Share2 } from 'lucide-react'

export default function ForecastPageV2() {
  const [activeTab, setActiveTab] = useState('ensemble')
  const [forecastData, setForecastData] = useState([
    { date: '2025-11-01', demand: 450, actual: 420 },
    { date: '2025-11-02', demand: 480, actual: 510 },
    { date: '2025-11-03', demand: 520, actual: 490 },
    { date: '2025-11-04', demand: 550, actual: 580 },
    { date: '2025-11-05', demand: 600, actual: 620 },
    { date: '2025-11-06', demand: 580, actual: 560 },
    { date: '2025-11-07', demand: 620, actual: 640 },
  ])

  const tabs = [
    { id: 'ensemble', label: 'Ensemble Models', icon: BarChart3, component: EnsembleForecasting },
    { id: 'probabilistic', label: 'Probabilistic', icon: TrendingUp, component: ProbabilisticForecasting },
    { id: 'sensitivity', label: 'Sensitivity', icon: AlertCircle, component: SensitivityAnalysis },
    { id: 'bias', label: 'Bias Analysis', icon: Eye, component: ForecastBiasAnalysis },
    { id: 'monte-carlo', label: 'Monte Carlo', icon: Zap, component: MonteCarloSimulation },
    { id: 'drivers', label: 'Demand Drivers', icon: TrendingUp, component: DemandDriversAnalysis },
    { id: 'versions', label: 'Version Control', icon: GitBranch, component: ForecastVersionControl },
    { id: 'collaboration', label: 'Discussion', icon: MessageSquare, component: ForecastCollaboration },
    { id: 'export', label: 'Export & Share', icon: Share2, component: ForecastExportShare },
  ]

  const activeTabConfig = tabs.find(t => t.id === activeTab)
  const ActiveComponent = activeTabConfig?.component

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Advanced Forecast Analysis</h1>
        <p className="text-slate-600 mt-1">Ensemble forecasting, probabilistic analysis, and advanced analytics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Ensemble Accuracy</p>
          <p className="text-3xl font-bold text-green-600">95.2%</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Forecast Bias</p>
          <p className="text-3xl font-bold text-blue-600">+2.3%</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Models Used</p>
          <p className="text-3xl font-bold text-purple-600">4</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Versions</p>
          <p className="text-3xl font-bold text-orange-600">3</p>
        </div>
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
      <div className="space-y-6">
        {ActiveComponent && <ActiveComponent data={forecastData} />}
      </div>

      {/* Quick Actions */}
      <div className="card p-4 bg-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-900">Forecast Ready for Review</p>
            <p className="text-sm text-slate-600">All models trained and validated</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary">Approve Forecast</button>
            <button className="btn btn-secondary">Request Changes</button>
          </div>
        </div>
      </div>
    </div>
  )
}
