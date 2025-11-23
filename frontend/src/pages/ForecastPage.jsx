import React, { useState } from 'react'
import ForecastConfig from '../components/ForecastConfig'
import ForecastCharts from '../components/ForecastCharts'
import { predictForecast } from '../api/forecastApi'

export default function ForecastPage() {
  const [forecastData, setForecastData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

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

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Demand Forecast</h1>
        <p className="text-slate-600 mt-1">Predict future demand, rake availability, and throughput</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-900 font-medium">Error: {error}</p>
        </div>
      )}

      <ForecastConfig onRun={handleRunForecast} isLoading={isLoading} />

      {forecastData && <ForecastCharts data={forecastData} isLoading={isLoading} />}
    </div>
  )
}
