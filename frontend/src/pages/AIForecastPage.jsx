import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Brain, Calendar } from 'lucide-react'
import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000'

export default function AIForecastPage() {
  const [selectedMaterial, setSelectedMaterial] = useState('HR_Coils')
  const [forecastData, setForecastData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [periods, setPeriods] = useState(30)
  const [accuracy, setAccuracy] = useState(null)

  const materials = ['HR_Coils', 'CR_Coils', 'Plates', 'Wire_Rods', 'TMT_Bars', 'Pig_Iron', 'Billets']

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
    </div>
  )
}
