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
          <MLModelsStatus
            models={[
              { name: 'Demand Forecasting', version: '2.1', status: 'active', accuracy: 94.2, type: 'regression' },
              { name: 'Rake Availability', version: '1.9', status: 'active', accuracy: 91.8, type: 'regression' },
              { name: 'Anomaly Detection', version: '1.5', status: 'active', accuracy: 89.3, type: 'classification' },
              { name: 'Route Optimization', version: '2.0', status: 'active', accuracy: 92.1, type: 'optimization' },
              { name: 'Weather Impact', version: '1.8', status: 'active', accuracy: 87.5, type: 'regression' },
              { name: 'Demand Clustering', version: '1.6', status: 'active', accuracy: 90.2, type: 'clustering' },
              { name: 'Inventory Prediction', version: '2.2', status: 'active', accuracy: 93.7, type: 'regression' },
              { name: 'Delay Classifier', version: '1.8', status: 'active', accuracy: 89.5, type: 'classification' },
              { name: 'Delay Regressor', version: '1.8', status: 'active', accuracy: 88.9, type: 'regression' },
              { name: 'Throughput Optimization', version: '2.0', status: 'active', accuracy: 91.3, type: 'regression' },
              { name: 'Cost Estimation', version: '1.9', status: 'active', accuracy: 92.1, type: 'regression' },
              { name: 'Mode Selection', version: '1.5', status: 'active', accuracy: 87.8, type: 'classification' },
              { name: 'Supplier Performance', version: '1.7', status: 'active', accuracy: 88.4, type: 'classification' },
              { name: 'Demand Seasonality', version: '1.9', status: 'active', accuracy: 90.6, type: 'regression' },
              { name: 'Risk Assessment', version: '1.4', status: 'active', accuracy: 86.2, type: 'classification' },
              { name: 'Network Flow', version: '2.1', status: 'active', accuracy: 93.5, type: 'optimization' },
              { name: 'Capacity Planning', version: '1.6', status: 'active', accuracy: 89.8, type: 'regression' },
            ]}
          />

          <ForecastConfig onRun={handleRunForecast} isLoading={isLoading} />
          {forecastData && <ForecastCharts data={forecastData} isLoading={isLoading} />}
        </>
      )}

      {/* Enhancement Tabs */}
      {activeTab === 'accuracy' && (
        forecastData ? (
          <AccuracyMetrics data={forecastData} />
        ) : (
          <div className="bg-white dark:bg-slate-700 rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">Model Accuracy Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-600 dark:to-slate-700 rounded-lg p-6 border border-green-200 dark:border-slate-600">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Overall Accuracy</p>
                <p className="text-3xl font-bold text-green-600">92.1%</p>
                <p className="text-xs text-slate-500 mt-2">↑ 2.3% from last month</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-600 dark:to-slate-700 rounded-lg p-6 border border-blue-200 dark:border-slate-600">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Precision Score</p>
                <p className="text-3xl font-bold text-blue-600">89.8%</p>
                <p className="text-xs text-slate-500 mt-2">Demand Forecasting</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-600 dark:to-slate-700 rounded-lg p-6 border border-purple-200 dark:border-slate-600">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Recall Score</p>
                <p className="text-3xl font-bold text-purple-600">91.5%</p>
                <p className="text-xs text-slate-500 mt-2">Inventory Prediction</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-slate-600 dark:to-slate-700 rounded-lg p-6 border border-orange-200 dark:border-slate-600">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">F1 Score</p>
                <p className="text-3xl font-bold text-orange-600">90.6%</p>
                <p className="text-xs text-slate-500 mt-2">Delay Classification</p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mt-6 text-center">Run a forecast to see detailed accuracy metrics</p>
          </div>
        )
      )}
      {activeTab === 'scenarios' && (
        forecastData ? (
          <ScenarioComparison data={forecastData.predictions} />
        ) : (
          <div className="bg-white dark:bg-slate-700 rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">Scenario Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-600 dark:to-slate-700 rounded-lg p-6 border border-green-200 dark:border-slate-600">
                <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-3">📈 Optimistic</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">High demand growth scenario</p>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Demand:</span> +15% growth</p>
                  <p><span className="font-semibold">Revenue:</span> ₹2.8 Cr</p>
                  <p><span className="font-semibold">Probability:</span> 25%</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-600 dark:to-slate-700 rounded-lg p-6 border border-blue-200 dark:border-slate-600">
                <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-3">📊 Base Case</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Expected demand scenario</p>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Demand:</span> +5% growth</p>
                  <p><span className="font-semibold">Revenue:</span> ₹2.2 Cr</p>
                  <p><span className="font-semibold">Probability:</span> 50%</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-600 dark:to-slate-700 rounded-lg p-6 border border-red-200 dark:border-slate-600">
                <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-3">📉 Pessimistic</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Low demand scenario</p>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Demand:</span> -8% decline</p>
                  <p><span className="font-semibold">Revenue:</span> ₹1.8 Cr</p>
                  <p><span className="font-semibold">Probability:</span> 25%</p>
                </div>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mt-6 text-center">Run a forecast to see detailed scenario analysis</p>
          </div>
        )
      )}
      {activeTab === 'alerts' && <ForecastAlerts />}
      {activeTab === 'seasonal' && (
        forecastData ? (
          <SeasonalDecomposition data={forecastData.predictions} />
        ) : (
          <div className="bg-white dark:bg-slate-700 rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">Seasonal Decomposition</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-600 dark:to-slate-700 rounded-lg p-6 border border-blue-200 dark:border-slate-600">
                <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">Seasonal Patterns</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">Q1 (Jan-Mar)</p>
                    <p className="text-slate-600 dark:text-slate-300">Peak season: +18% above average</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">Q2 (Apr-Jun)</p>
                    <p className="text-slate-600 dark:text-slate-300">Normal season: 0% variance</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">Q3 (Jul-Sep)</p>
                    <p className="text-slate-600 dark:text-slate-300">Low season: -12% below average</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">Q4 (Oct-Dec)</p>
                    <p className="text-slate-600 dark:text-slate-300">Recovery: +8% above average</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-600 dark:to-slate-700 rounded-lg p-6 border border-purple-200 dark:border-slate-600">
                <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">Trend Analysis</h3>
                <div className="space-y-3 text-sm">
                  <p><span className="font-semibold">Overall Trend:</span> Upward</p>
                  <p><span className="font-semibold">Growth Rate:</span> 6.2% YoY</p>
                  <p><span className="font-semibold">Volatility:</span> Medium (σ = 8.5%)</p>
                  <p><span className="font-semibold">Forecast Confidence:</span> 87%</p>
                  <p className="text-slate-600 dark:text-slate-300 mt-4">Seasonal factors account for 34% of variance</p>
                </div>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mt-6 text-center">Run a forecast to see detailed seasonal decomposition</p>
          </div>
        )
      )}
      {activeTab === 'historical' && (
        forecastData ? (
          <HistoricalComparison data={forecastData.predictions} />
        ) : (
          <div className="bg-white dark:bg-slate-700 rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">Historical Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-600 dark:to-slate-700 rounded-lg p-6 border border-green-200 dark:border-slate-600">
                <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">YoY Comparison</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>2023 Actual:</span>
                    <span className="font-semibold">₹18.5 Cr</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2024 Forecast:</span>
                    <span className="font-semibold text-green-600">₹19.6 Cr</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Growth:</span>
                    <span className="font-semibold text-green-600">+5.9%</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-600 dark:to-slate-700 rounded-lg p-6 border border-blue-200 dark:border-slate-600">
                <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">Forecast Accuracy (Past)</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>2023 Forecast:</span>
                    <span className="font-semibold">₹18.2 Cr</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2023 Actual:</span>
                    <span className="font-semibold">₹18.5 Cr</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error:</span>
                    <span className="font-semibold text-green-600">-1.6%</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mt-6 text-center">Run a forecast to see detailed historical comparison</p>
          </div>
        )
      )}
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
