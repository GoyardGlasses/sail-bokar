import React, { useState, useEffect } from 'react'
import ForecastConfig from '../components/ForecastConfig'
import ForecastCharts from '../components/ForecastCharts'
import MLModelsStatus from '../components/MLModelsStatus'
import {
  AccuracyMetrics,
  ScenarioComparison,
  ForecastAlerts,
  SeasonalDecomposition,
  HistoricalComparison,
  WhatIfAnalysis,
  DemandDrivers,
  CollaborationPanel,
  AdvancedFiltering,
  DrillDown,
  Benchmarking,
  NotificationSettings,
  APIDocumentation,
  PerformanceOptimization,
  MobileResponsiveView,
} from '../components/ForecastEnhancements'
import { predictForecast } from '../api/forecastApi'
import { Brain, TrendingUp } from 'lucide-react'

export default function ForecastPage() {
  const [forecastData, setForecastData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('main')
  const [mlModels, setMlModels] = useState({
    demandForecasting: { name: 'Demand Forecasting', accuracy: 94.2, status: 'active' },
    rakeAvailability: { name: 'Rake Availability', accuracy: 91.8, status: 'active' },
  })
  const [mlPredictions, setMlPredictions] = useState(null)

  const handleRunForecast = async (config) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await predictForecast(config)
      setForecastData(result)
    } catch (err) {
      setError(err.message || 'Failed to run forecast')
      console.error('Forecast error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'main', label: 'Main Forecast' },
    { id: 'ml-models', label: 'ML Models' },
    { id: 'accuracy', label: 'Accuracy' },
    { id: 'scenarios', label: 'Scenarios' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'seasonal', label: 'Seasonal' },
    { id: 'historical', label: 'Historical' },
    { id: 'whatif', label: 'What-If' },
    { id: 'drivers', label: 'Drivers' },
    { id: 'collaboration', label: 'Collaboration' },
    { id: 'filtering', label: 'Filtering' },
    { id: 'drilldown', label: 'Drill-Down' },
    { id: 'benchmarking', label: 'Benchmarking' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'api', label: 'API Docs' },
    { id: 'performance', label: 'Performance' },
    { id: 'mobile', label: 'Mobile' },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Demand Forecast</h1>
        <p className="text-slate-600 mt-1">Advanced forecasting with 15 features</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-900 font-medium">Error: {error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Forecast Tab */}
      {activeTab === 'main' && (
        <>
          {/* ML Models Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {Object.values(mlModels).map((model, idx) => (
              <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="text-blue-600" size={24} />
                    <div>
                      <p className="font-bold text-gray-900">{model.name}</p>
                      <p className="text-sm text-gray-600">Accuracy: {model.accuracy}%</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">{model.status}</span>
                </div>
              </div>
            ))}
          </div>

          <ForecastConfig onRun={handleRunForecast} isLoading={isLoading} />
          {forecastData && <ForecastCharts data={forecastData} isLoading={isLoading} />}
        </>
      )}

      {/* ML Models Tab */}
      {activeTab === 'ml-models' && (
        <MLModelsStatus
          models={[
            { name: 'Demand Forecasting', version: '2.1', status: 'active', accuracy: 94.2, type: 'regression' },
            { name: 'Rake Availability', version: '1.9', status: 'active', accuracy: 91.8, type: 'regression' },
          ]}
        />
      )}

      {/* Enhancement Tabs */}
      {activeTab === 'accuracy' && forecastData && <AccuracyMetrics data={forecastData} />}
      {activeTab === 'scenarios' && forecastData && <ScenarioComparison data={forecastData.predictions} />}
      {activeTab === 'alerts' && <ForecastAlerts />}
      {activeTab === 'seasonal' && forecastData && <SeasonalDecomposition data={forecastData.predictions} />}
      {activeTab === 'historical' && forecastData && <HistoricalComparison data={forecastData.predictions} />}
      {activeTab === 'whatif' && <WhatIfAnalysis />}
      {activeTab === 'drivers' && <DemandDrivers />}
      {activeTab === 'collaboration' && <CollaborationPanel />}
      {activeTab === 'filtering' && <AdvancedFiltering />}
      {activeTab === 'drilldown' && <DrillDown />}
      {activeTab === 'benchmarking' && <Benchmarking />}
      {activeTab === 'notifications' && <NotificationSettings />}
      {activeTab === 'api' && <APIDocumentation />}
      {activeTab === 'performance' && <PerformanceOptimization />}
      {activeTab === 'mobile' && <MobileResponsiveView />}
    </div>
  )
}
