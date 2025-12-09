import React, { useState, useEffect, useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Brain, Calendar } from 'lucide-react'
import axios from 'axios'
import { useImportedData } from '../hooks/useImportedData'
import { useMLPredictions } from '../context/MLPredictionsContext'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'
import InlineDecisionSummary from '../features/decisionSupport/components/InlineDecisionSummary'

const API_BASE = 'http://127.0.0.1:8000'

export default function AIForecastPage() {
  const [selectedMaterial, setSelectedMaterial] = useState('HR_Coils')
  const [forecastData, setForecastData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [periods, setPeriods] = useState(30)
  const [accuracy, setAccuracy] = useState(null)
  const { data: importedData, isLoaded } = useImportedData()
  const { dataImported, getPrediction, hasPredictions } = useMLPredictions()

  const materials = ['HR_Coils', 'CR_Coils', 'Plates', 'Sheets']
  const materialSpecs = {
    'HR_Coils': { thickness: '1.2-12.7mm', width: '600-1500mm', length: 'coil' },
    'CR_Coils': { thickness: '0.5-3.0mm', width: '600-1500mm', length: 'coil' },
    'Plates': { thickness: '3-100mm', width: '1000-2000mm', length: '2000-6000mm' },
    'Sheets': { thickness: '0.4-2.0mm', width: '800-1500mm', length: '2000-4000mm' }
  }

  // Derive a simple ML forecast summary from global demand_forecasting predictions (if available)
  const mlForecastSummary = useMemo(() => {
    if (!dataImported || !hasPredictions || !getPrediction) return null

    const raw = getPrediction('demand_forecasting')
    if (!raw) return null

    const series = Array.isArray(raw)
      ? raw
      : Array.isArray(raw.predictions)
        ? raw.predictions
        : null

    if (!series || series.length === 0) return null

    let total = 0
    let count = 0
    series.forEach((p) => {
      if (!p || typeof p !== 'object') return
      const v = Number(
        p.demand ??
        p.quantity ??
        p.forecast ??
        p.value ??
        0
      )
      if (Number.isFinite(v) && v > 0) {
        total += v
        count += 1
      }
    })

    if (count === 0) return { points: series.length }

    const avg = total / count
    return {
      points: series.length,
      avg,
    }
  }, [dataImported, hasPredictions, getPrediction])

  const hasImportedOrders = useMemo(() => {
    return (
      isLoaded &&
      importedData &&
      Array.isArray(importedData.orders) &&
      importedData.orders.length > 0
    )
  }, [isLoaded, importedData])

  // When imported data is available, auto-select the most frequent material from orders
  useEffect(() => {
    if (!hasImportedOrders) return

    try {
      const counts = {}
      importedData.orders.forEach((o) => {
        const name = (o.product || o.material || o.materialName || '').toString()
        if (!name) return
        counts[name] = (counts[name] || 0) + 1
      })

      const entries = Object.entries(counts)
      if (entries.length === 0) return

      entries.sort((a, b) => b[1] - a[1])
      const topMaterial = entries[0][0]

      if (materials.includes(topMaterial) && topMaterial !== selectedMaterial) {
        setSelectedMaterial(topMaterial)
      }
    } catch (err) {
      console.error('Failed to map imported orders for AI forecast:', err)
    }
  }, [hasImportedOrders, importedData, materials, selectedMaterial])

  useEffect(() => {
    fetchForecast()
  }, [selectedMaterial, periods])

  const fetchForecast = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_BASE}/forecast/demand/predict`, {
        material: selectedMaterial,
        periods: periods
      })
      
      if (response.data.data.forecasts) {
        const chartData = response.data.data.forecasts.map(f => ({
          date: f.date,
          predicted: f.predicted_demand,
          lower: f.lower_bound,
          upper: f.upper_bound
        }))
        setForecastData(chartData)
      }

      // Fetch accuracy metrics
      const accuracyResponse = await axios.get(`${API_BASE}/forecast/demand/${selectedMaterial}/accuracy`)
      setAccuracy(accuracyResponse.data.data)
    } catch (error) {
      console.error('Error fetching forecast:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">AI Demand Forecasting</h1>
        </div>
        <p className="text-gray-600">Powered by Prophet Time Series Analysis</p>
      </div>

      <InlineDataImport templateId="operations" />

      {/* Dataset & ML Summary */}
      {(hasImportedOrders || mlForecastSummary) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hasImportedOrders && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-600">Imported Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {importedData.orders.length.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Material auto-selected from uploaded dataset
              </p>
            </div>
          )}
          {mlForecastSummary && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600">ML Demand Forecast (Pipeline)</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {mlForecastSummary.avg
                  ? `${mlForecastSummary.avg.toFixed(0)} units avg`
                  : `${mlForecastSummary.points} points`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Using global demand_forecasting model
              </p>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {materials.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Forecast Period (days)</label>
            <input
              type="number"
              value={periods}
              onChange={(e) => setPeriods(parseInt(e.target.value))}
              min="7"
              max="365"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchForecast}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Forecast'}
            </button>
          </div>
        </div>
      </div>

      {/* Accuracy Metrics */}
      {accuracy && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">MAE</p>
            <p className="text-2xl font-bold text-gray-900">{accuracy.mae.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Threshold: {accuracy.threshold_mae}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">RMSE</p>
            <p className="text-2xl font-bold text-gray-900">{accuracy.rmse.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Threshold: {accuracy.threshold_rmse}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">MAPE</p>
            <p className="text-2xl font-bold text-gray-900">{accuracy.mape.toFixed(2)}%</p>
            <p className="text-xs text-gray-500">Mean Absolute %</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Status</p>
            <p className="text-lg font-bold text-green-600">{accuracy.status}</p>
            <p className="text-xs text-gray-500">Performance</p>
          </div>
        </div>
      )}

      {/* Forecast Chart */}
      {forecastData && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            {selectedMaterial} - {periods} Day Forecast
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} name="Predicted Demand" />
              <Line type="monotone" dataKey="upper" stroke="#10b981" strokeDasharray="5 5" name="Upper Bound" />
              <Line type="monotone" dataKey="lower" stroke="#ef4444" strokeDasharray="5 5" name="Lower Bound" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Forecasting Methods Comparison */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Forecasting Methods Comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2">Prophet (Current)</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Handles seasonality</li>
              <li>✓ Robust to missing data</li>
              <li>✓ Confidence intervals</li>
              <li>✓ Fast computation</li>
            </ul>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2">LSTM Neural Network</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Captures complex patterns</li>
              <li>✓ Non-linear relationships</li>
              <li>✗ Requires more data</li>
              <li>✗ Slower computation</li>
            </ul>
          </div>
        </div>
      </div>

      <InlineDecisionSummary
        context="operations"
        pageTitle="AI Demand Forecast"
      />
    </div>
  )
}
