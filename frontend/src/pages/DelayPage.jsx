import React, { useState } from 'react'
import DelayForm from '../components/DelayForm'
import DelayResults from '../components/DelayResults'
import { predictDelay } from '../api/delayApi'

export default function DelayPage() {
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastFormData, setLastFormData] = useState(null)

  const handlePrediction = async (formData) => {
    setIsLoading(true)
    setError(null)
    setLastFormData(formData)

    try {
      const response = await predictDelay(formData)
      
      // Handle empty response
      if (!response || !response.routes || response.routes.length === 0) {
        setError('No data for selected range. Try expanding date range.')
        setResults(null)
        return
      }

      setResults(response)
    } catch (err) {
      console.error('Prediction failed:', err)
      setError(err.response?.data?.message || 'Prediction failed. Please try again.')
      setResults(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    if (lastFormData) {
      handlePrediction(lastFormData)
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Delay Prediction</h1>
        <p className="text-slate-600 mt-1">Predict transportation delays for your routes</p>
      </div>

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
    </div>
  )
}
