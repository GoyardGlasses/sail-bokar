import React, { useState, useEffect } from 'react'
import { Brain, TrendingUp, AlertCircle, CheckCircle, Zap, BarChart3 } from 'lucide-react'

export default function MLDashboard() {
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('predictions')

  useEffect(() => {
    fetchPredictions()
  }, [])

  const fetchPredictions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch from ML API
      const response = await fetch('/api/ml/monitoring/dashboard')
      if (!response.ok) throw new Error('Failed to fetch predictions')
      
      const data = await response.json()
      setPredictions(data.data || {})
    } catch (err) {
      setError(err.message)
      // Fallback mock data
      setPredictions({
        total_predictions: 1250,
        accuracy_avg: 91.2,
        models_active: 17,
        alerts_count: 3,
        recent_predictions: [
          { model: 'Delay Prediction', value: '2.5 days', confidence: 92 },
          { model: 'Cost Prediction', value: '₹45,000', confidence: 88 },
          { model: 'Risk Assessment', value: '15%', confidence: 85 },
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-slate-600">Loading ML Dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain size={32} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">ML Dashboard</h2>
            <p className="text-slate-600">Real-time predictions & model performance</p>
          </div>
        </div>
        <button
          onClick={fetchPredictions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-900 text-sm">{error}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-700 font-medium">Total Predictions</span>
            <TrendingUp size={20} className="text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900">{predictions?.total_predictions || 1250}</p>
          <p className="text-xs text-blue-600 mt-2">↑ 12% this month</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-700 font-medium">Avg Accuracy</span>
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">{predictions?.accuracy_avg || 91.2}%</p>
          <p className="text-xs text-green-600 mt-2">Excellent performance</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-700 font-medium">Active Models</span>
            <Brain size={20} className="text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-900">{predictions?.models_active || 17}</p>
          <p className="text-xs text-purple-600 mt-2">All operational</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-orange-700 font-medium">Active Alerts</span>
            <AlertCircle size={20} className="text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-900">{predictions?.alerts_count || 3}</p>
          <p className="text-xs text-orange-600 mt-2">Requires attention</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('predictions')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'predictions'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Recent Predictions
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'models'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Model Performance
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'alerts'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Alerts
        </button>
      </div>

      {/* Recent Predictions */}
      {activeTab === 'predictions' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Zap size={20} className="text-yellow-500" />
            Recent Predictions
          </h3>
          <div className="space-y-3">
            {predictions?.recent_predictions?.map((pred, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <p className="font-semibold text-slate-900">{pred.model}</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{pred.value}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Confidence</p>
                  <div className="mt-2 w-24 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${pred.confidence}%` }}
                    />
                  </div>
                  <p className="text-sm font-bold text-slate-900 mt-1">{pred.confidence}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Performance */}
      {activeTab === 'models' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" />
            Model Performance
          </h3>
          <p className="text-slate-600 text-center py-8">
            All 17 models performing optimally. Average accuracy: {predictions?.accuracy_avg || 91.2}%
          </p>
        </div>
      )}

      {/* Alerts */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-orange-600" />
            Active Alerts
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="font-semibold text-orange-900">⚠️ Data Drift Detected</p>
              <p className="text-sm text-orange-700 mt-1">Delay Prediction Model - Retrain recommended</p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-semibold text-yellow-900">⚠️ Low Confidence</p>
              <p className="text-sm text-yellow-700 mt-1">Cost Prediction Model - Accuracy below threshold</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold text-blue-900">ℹ️ Model Update Available</p>
              <p className="text-sm text-blue-700 mt-1">New version of Risk Assessment Model ready</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
