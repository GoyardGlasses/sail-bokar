import React, { useState } from 'react'
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
import AIChatAssistant from '../components/AIChatAssistant'
import SimulationGame from '../components/SimulationGame'
import { predictDelay, batchPredictDelays } from '../api/delayApi'
import { Brain } from 'lucide-react'

export default function DelayPage() {
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

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Delay Prediction</h1>
        <p className="text-slate-600 mt-1">Predict transportation delays for your routes</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        {[
          { id: 'single', label: 'Single Route' },
          { id: 'batch', label: 'Batch' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'route-comparison', label: 'Compare Routes' },
          { id: 'scenario', label: 'What-If' },
          { id: 'material', label: 'Materials' },
          { id: 'alerts', label: 'Alerts' },
          { id: 'recommendations', label: 'Recommendations' },
          { id: 'accuracy', label: 'Accuracy' },
          { id: 'optimization', label: 'Optimize' },
          { id: 'heatmap', label: 'Heatmap' },
          { id: 'maintenance', label: 'Maintenance' },
          { id: 'reports', label: 'Reports' },
          { id: 'anomalies', label: 'Anomalies' },
          { id: 'chat', label: 'AI Chat' },
          { id: 'game', label: 'Game' },
        ].map((tab) => (
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
      {activeTab === 'analytics' && batchResults && (
        <RouteAnalytics predictions={batchResults.predictions} />
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

      {/* AI Chat */}
      {activeTab === 'chat' && <AIChatAssistant />}

      {/* Simulation Game */}
      {activeTab === 'game' && <SimulationGame />}
    </div>
  )
}
