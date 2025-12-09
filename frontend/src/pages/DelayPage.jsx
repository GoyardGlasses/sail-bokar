import React, { useState, useEffect } from 'react'
import DelayForm from '../components/DelayForm'
import DelayResults from '../components/DelayResults'
import BatchPredictions from '../components/BatchPredictions'
import RouteAnalytics from '../components/RouteAnalytics'
import RouteComparison from '../components/RouteComparison'
import ScenarioComparison from '../components/ScenarioComparison'
import MaterialComparison from '../components/MaterialComparison'
import RealTimeAlerts from '../components/RealTimeAlerts'
import RecommendationsEngine from '../components/RecommendationsEngine'
import AccuracyDashboard from '../components/AccuracyDashboard'
import RouteOptimization from '../components/RouteOptimizationAdvanced'
import RiskHeatmap from '../components/RiskHeatmapAdvanced'
import MaintenanceAlerts from '../components/MaintenanceAlertsAdvanced'
import ReportGenerator from '../components/ReportGenerator'
import AnomalyDetection from '../components/AnomalyDetection'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'
import InlineDecisionSummary from '../features/decisionSupport/components/InlineDecisionSummary'
import { predictDelay, batchPredictDelays } from '../api/delayApi'
import { Brain, AlertCircle } from 'lucide-react'
import { useMLPredictions } from '../context/MLPredictionsContext'
import { useImportedData } from '../hooks/useImportedData'

export default function DelayPage() {
  const { dataImported, getPrediction } = useMLPredictions()
  const { data: importedData, isLoaded } = useImportedData()
  const [mlPrediction, setMlPrediction] = useState(null)
  const [activeTab, setActiveTab] = useState('single')
  const [results, setResults] = useState(null)
  const [batchResults, setBatchResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastFormData, setLastFormData] = useState(null)
  const [mlModels] = useState({
    delayClassifier: { name: 'Delay Classifier', accuracy: 89.5, status: 'active' },
    delayRegressor: { name: 'Delay Regressor', accuracy: 88.9, status: 'active' },
  })

  // Get ML prediction when data is imported
  useEffect(() => {
    if (dataImported) {
      const prediction = getPrediction('delay_prediction')
      setMlPrediction(prediction)
    }
  }, [dataImported, getPrediction])

  const handlePrediction = async (formData) => {
    setIsLoading(true)
    setError(null)
    setLastFormData(formData)

    try {
      console.log('Calling predictDelay with:', formData)
      const response = await predictDelay(formData)
      console.log('Received response:', response)
      
      // Handle empty response
      if (!response || !response.routes || response.routes.length === 0) {
        setError('No data for selected range. Try expanding date range.')
        setResults(null)
        setIsLoading(false)
        return
      }

      setResults(response)
      setIsLoading(false)
    } catch (err) {
      console.error('Prediction failed:', err)
      const errorMessage = err?.response?.data?.message || err?.message || 'Prediction failed. Please try again.'
      setError(errorMessage)
      setResults(null)
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    if (lastFormData) {
      handlePrediction(lastFormData)
    }
  }

  const handleBatchPrediction = async (csvData) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Submitting batch prediction for', csvData.length, 'routes')
      const response = await batchPredictDelays(csvData)
      console.log('Batch response:', response)
      setBatchResults(response)
      setActiveTab('analytics')
    } catch (err) {
      console.error('Batch prediction failed:', err)
      setError(err?.message || 'Batch prediction failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const hasImportedRoutes =
    isLoaded && importedData && Array.isArray(importedData.routes) && importedData.routes.length > 0

  const hasImportedOrders =
    isLoaded && importedData && Array.isArray(importedData.orders) && importedData.orders.length > 0

  let totalShipments = 0
  let totalTonnage = 0

  if (hasImportedRoutes) {
    importedData.routes.forEach((r) => {
      const qty = Number(r.tonnage ?? r.quantity ?? r.totalQuantity ?? 0)
      if (Number.isFinite(qty) && qty > 0) {
        totalTonnage += qty
      }
    })
    totalShipments = importedData.routes.length
  } else if (hasImportedOrders) {
    importedData.orders.forEach((o) => {
      const qty = Number(o.totalQuantity ?? o.quantity ?? 0)
      if (Number.isFinite(qty) && qty > 0) {
        totalTonnage += qty
      }
    })
    totalShipments = importedData.orders.length
  }

  const mlDelaySource = Array.isArray(mlPrediction) ? mlPrediction[0] : mlPrediction

  const mlAvgDelayMinutes =
    mlDelaySource && typeof mlDelaySource === 'object'
      ? (() => {
          const candidates = [
            mlDelaySource.avg_delay_minutes,
            mlDelaySource.average_delay,
            mlDelaySource.expected_delay,
            mlDelaySource.mean_delay,
            mlDelaySource.delay_minutes,
          ]
          for (const c of candidates) {
            const n = Number(c)
            if (Number.isFinite(n)) return n
          }
          return null
        })()
      : null

  const mlOnTimeProbability =
    mlDelaySource && typeof mlDelaySource === 'object'
      ? (() => {
          const raw =
            typeof mlDelaySource.on_time_probability === 'number'
              ? mlDelaySource.on_time_probability
              : typeof mlDelaySource.on_time_prob === 'number'
                ? mlDelaySource.on_time_prob
                : typeof mlDelaySource.on_time_confidence === 'number'
                  ? mlDelaySource.on_time_confidence
                  : typeof mlDelaySource.confidence === 'number'
                    ? mlDelaySource.confidence
                    : null
          if (raw == null) return null
          return raw <= 1 ? raw * 100 : raw
        })()
      : null

  const delayTabs = [
    { id: 'single', label: 'Single Route' },
    { id: 'batch', label: 'Batch' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'route-comparison', label: 'Compare Routes' },
    { id: 'scenario', label: 'What-If' },
  ]

  const activeTabLabel = delayTabs.find((t) => t.id === activeTab)?.label

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Delay Prediction</h1>
        <p className="text-slate-600 mt-1">Predict transportation delays for your routes</p>
      </div>

      <InlineDataImport templateId="delay" />

      {(totalShipments > 0 || mlAvgDelayMinutes !== null || mlOnTimeProbability !== null) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {totalShipments > 0 && (
            <div className="card">
              <p className="text-sm text-slate-600">Dataset Shipments</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {totalShipments.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {totalTonnage > 0
                  ? `${totalTonnage.toLocaleString()}T total tonnage`
                  : 'No tonnage field detected'}
              </p>
            </div>
          )}

          {mlAvgDelayMinutes !== null && (
            <div className="card">
              <p className="text-sm text-slate-600">ML Avg Delay</p>
              <p className="text-2xl font-bold text-amber-600 mt-2">
                {mlAvgDelayMinutes.toFixed(1)} min
              </p>
              <p className="text-xs text-slate-500 mt-1">From delay_prediction model</p>
            </div>
          )}

          {mlOnTimeProbability !== null && (
            <div className="card">
              <p className="text-sm text-slate-600">On-Time Probability</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {mlOnTimeProbability.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 mt-1">Higher is better, based on ML outputs</p>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        {delayTabs.map((tab) => (
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

      {/* Single Route Prediction */}
      {activeTab === 'single' && (
        <>
          <DelayForm onSubmit={handlePrediction} isLoading={isLoading} />

          {results && (
            <DelayResults 
              data={results} 
              isLoading={isLoading} 
              error={error}
              onRetry={handleRetry}
            />
          )}

          {error && !results && (
            <div className="card bg-red-50 border border-red-200 p-6">
              <p className="text-red-900 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                disabled={isLoading}
                className="btn btn-outline text-red-600 disabled:opacity-50"
              >
                Try Again
              </button>
            </div>
          )}
        </>
      )}

      {/* Batch Predictions */}
      {activeTab === 'batch' && (
        <>
          <BatchPredictions onBatchSubmit={handleBatchPrediction} isLoading={isLoading} />

          {error && (
            <div className="card bg-red-50 border border-red-200 p-6">
              <p className="text-red-900 mb-4">{error}</p>
            </div>
          )}
        </>
      )}

      {/* Analytics */}
      {activeTab === 'analytics' && (
        <RouteAnalytics predictions={batchResults?.predictions} />
      )}

      {/* Route Comparison */}
      {activeTab === 'route-comparison' && (
        <RouteComparison onCompare={() => {}} isLoading={isLoading} />
      )}

      {/* Scenario Comparison */}
      {activeTab === 'scenario' && (
        <ScenarioComparison onCompare={() => {}} isLoading={isLoading} />
      )}

      {/* Material Comparison */}
      {activeTab === 'material' && (
        <MaterialComparison onCompare={() => {}} isLoading={isLoading} />
      )}

      {/* Real-Time Alerts */}
      {activeTab === 'alerts' && <RealTimeAlerts />}

      {/* Recommendations */}
      {activeTab === 'recommendations' && <RecommendationsEngine />}

      {/* Accuracy Dashboard */}
      {activeTab === 'accuracy' && <AccuracyDashboard />}

      {/* Route Optimization */}
      {activeTab === 'optimization' && <RouteOptimization />}

      {/* Risk Heatmap */}
      {activeTab === 'heatmap' && <RiskHeatmap />}

      {/* Maintenance Alerts */}
      {activeTab === 'maintenance' && <MaintenanceAlerts />}

      {/* Report Generator */}
      {activeTab === 'reports' && <ReportGenerator />}

      {/* Anomaly Detection */}
      {activeTab === 'anomalies' && <AnomalyDetection />}

      <InlineDecisionSummary
        context="delay"
        pageTitle="Delay Prediction"
        activeView={activeTabLabel}
      />
    </div>
  )
}
