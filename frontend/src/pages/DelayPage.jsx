import React, { useState } from 'react'
import DelayForm from '../components/DelayForm'
import DelayResults from '../components/DelayResults'
import BatchPredictions from '../components/BatchPredictions'
import RouteAnalytics from '../components/RouteAnalytics'
import RouteComparison from '../components/RouteComparison'
import ScenarioComparison from '../components/ScenarioComparison'
import MaterialComparison from '../components/MaterialComparison'
import { predictDelay, batchPredictDelays } from '../api/delayApi'

export default function DelayPage() {
  const [activeTab, setActiveTab] = useState('single') // 'single', 'batch', 'analytics', 'route-comparison', 'scenario', 'material'
  const [results, setResults] = useState(null)
  const [batchResults, setBatchResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastFormData, setLastFormData] = useState(null)

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
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('single')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'single'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Single Route
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'batch'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Batch Predictions
        </button>
        {batchResults && (
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Analytics
          </button>
        )}
        <button
          onClick={() => setActiveTab('route-comparison')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'route-comparison'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Compare Routes
        </button>
        <button
          onClick={() => setActiveTab('scenario')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'scenario'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          What-If Analysis
        </button>
        <button
          onClick={() => setActiveTab('material')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'material'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Material Comparison
        </button>
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
    </div>
  )
}
