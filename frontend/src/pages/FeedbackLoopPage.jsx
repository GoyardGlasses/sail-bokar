/**
 * Feedback Loop & Model Retraining Dashboard - Phase 2 Feature 3
 */

import React, { useState, useEffect } from 'react'
import { TrendingUp, AlertCircle, CheckCircle, RefreshCw, Zap } from 'lucide-react'
import { useMLPredictions } from '../context/MLPredictionsContext'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'

export default function FeedbackLoopPage() {
  const { dataImported, getPrediction } = useMLPredictions()
  const [mlPredictions, setMlPredictions] = useState({})
  const [status, setStatus] = useState(null)
  const [models, setModels] = useState([])
  const [feedback, setFeedback] = useState([])
  const [retrainingJobs, setRetrainingJobs] = useState([])
  const [drift, setDrift] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState(null)

  // Get ML predictions when data is imported
  useEffect(() => {
    if (dataImported) {
      const predictions = {
        cost: getPrediction('cost_prediction'),
        delay: getPrediction('delay_prediction'),
        demand: getPrediction('demand_forecasting'),
      }
      setMlPredictions(predictions)
    }
  }, [dataImported, getPrediction])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    // Mock data
    const mockModels = [
      { model_name: 'delay_prediction', accuracy: 0.82, precision: 0.85, recall: 0.80, f1_score: 0.82, total_predictions: 1250, correct_predictions: 1025, last_updated: new Date().toISOString() },
      { model_name: 'cost_prediction', accuracy: 0.85, precision: 0.88, recall: 0.83, f1_score: 0.85, total_predictions: 1100, correct_predictions: 935, last_updated: new Date().toISOString() },
    ]

    const mockFeedback = [
      { id: 'FB-001', type: 'prediction_accuracy', reference_id: 'PRED-001', actual_value: 4.5, predicted_value: 4.2, score: 0.85, notes: 'Good prediction', created_at: new Date().toISOString(), processed: true },
      { id: 'FB-002', type: 'plan_quality', reference_id: 'PLAN-001', actual_value: 8.5, predicted_value: 8.2, score: 0.92, notes: 'Excellent plan', created_at: new Date().toISOString(), processed: true },
    ]

    const mockJobs = [
      { id: 'RETRAIN-001', model_name: 'delay_prediction', reason: 'accuracy_drift', status: 'completed', created_at: new Date().toISOString(), started_at: new Date().toISOString(), completed_at: new Date().toISOString(), improvement: 0.05 },
      { id: 'RETRAIN-002', model_name: 'cost_prediction', reason: 'scheduled_retraining', status: 'completed', created_at: new Date().toISOString(), started_at: new Date().toISOString(), completed_at: new Date().toISOString(), improvement: 0.03 },
    ]

    const mockStatus = { status: 'running', total_feedback: 45, total_models: 5, average_accuracy: 0.81, completed_retrainings: 3, timestamp: new Date().toISOString() }

    const mockDrift = {
      total_models: 5,
      drifted_models: 0,
      models: [],
      timestamp: new Date().toISOString()
    }

    try {
      const [statusRes, modelsRes, feedbackRes, jobsRes, driftRes] = await Promise.all([
        fetch('/api/feedback/status').catch(() => null),
        fetch('/api/feedback/models/performance').catch(() => null),
        fetch('/api/feedback/feedback').catch(() => null),
        fetch('/api/feedback/retraining-jobs').catch(() => null),
        fetch('/api/feedback/drift-detection').catch(() => null),
      ])

      try {
        const statusData = statusRes ? await statusRes.json() : mockStatus
        const modelsData = modelsRes ? await modelsRes.json() : { models: mockModels }
        const feedbackData = feedbackRes ? await feedbackRes.json() : { feedback: mockFeedback }
        const jobsData = jobsRes ? await jobsRes.json() : { jobs: mockJobs }
        const driftData = driftRes ? await driftRes.json() : mockDrift

        setStatus(statusData || mockStatus)
        setModels((modelsData?.models) || mockModels)
        setFeedback((feedbackData?.feedback) || mockFeedback)
        setRetrainingJobs((jobsData?.jobs) || mockJobs)
        setDrift(driftData || mockDrift)
      } catch {
        setStatus(mockStatus)
        setModels(mockModels)
        setFeedback(mockFeedback)
        setRetrainingJobs(mockJobs)
        setDrift(mockDrift)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setStatus(mockStatus)
      setModels(mockModels)
      setFeedback(mockFeedback)
      setRetrainingJobs(mockJobs)
      setDrift(mockDrift)
      setLoading(false)
    }
  }

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 0.85) return 'text-green-600'
    if (accuracy >= 0.75) return 'text-blue-600'
    if (accuracy >= 0.65) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAccuracyBg = (accuracy) => {
    if (accuracy >= 0.85) return 'bg-green-100 dark:bg-green-900'
    if (accuracy >= 0.75) return 'bg-blue-100 dark:bg-blue-900'
    if (accuracy >= 0.65) return 'bg-yellow-100 dark:bg-yellow-900'
    return 'bg-red-100 dark:bg-red-900'
  }

  const normalizeNumber = (raw) => {
    if (raw == null) return null
    if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null
    if (typeof raw === 'string') {
      const n = Number(raw)
      return Number.isFinite(n) ? n : null
    }
    if (typeof raw === 'object') {
      if (typeof raw.value === 'number') return raw.value
      if (typeof raw.prediction === 'number') return raw.prediction
    }
    return null
  }

  const costPred = normalizeNumber(mlPredictions.cost)
  const delayPred = normalizeNumber(mlPredictions.delay)
  const demandPred = normalizeNumber(mlPredictions.demand)

  const hasMlSnapshot = costPred != null || delayPred != null || demandPred != null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="mx-auto text-blue-600 mb-4 animate-spin" size={48} />
          <p className="text-slate-600 dark:text-slate-400">Loading feedback loop...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Feedback Loop & Retraining
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Continuous model improvement through feedback and retraining
          </p>
        </div>
      </div>

      <InlineDataImport templateId="operations" />

      {hasMlSnapshot && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {costPred != null && (
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">ML Cost Prediction</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
                ₹{Math.round(costPred).toLocaleString()}
              </p>
            </div>
          )}
          {delayPred != null && (
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">ML Delay Prediction</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
                {delayPred.toFixed(1)} h
              </p>
            </div>
          )}
          {demandPred != null && (
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">ML Demand Forecast</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
                {Math.round(demandPred).toLocaleString()} units
              </p>
            </div>
          )}
        </div>
      )}

      {/* Status Cards */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Feedback</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {status.total_feedback}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Models Tracked</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              {status.total_models}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Avg Accuracy</p>
            <p className={`text-2xl font-bold mt-2 ${getAccuracyColor(status.average_accuracy)}`}>
              {(status.average_accuracy * 100).toFixed(1)}%
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Retrainings</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {status.completed_retrainings}
            </p>
          </div>
        </div>
      )}

      {/* Data Drift Detection */}
      {drift && (
        <div className={`card ${drift.drifted_models > 0 ? 'border-2 border-yellow-500' : ''}`}>
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            Data Drift Detection
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Models</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
                {drift.total_models}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Drifted</p>
              <p className={`text-2xl font-bold mt-1 ${drift.drifted_models > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {drift.drifted_models}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Healthy</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {drift.total_models - drift.drifted_models}
              </p>
            </div>
          </div>

          {drift.models && drift.models.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Drifted Models:</p>
              {drift.models.map((model, idx) => (
                <div key={idx} className="bg-yellow-50 dark:bg-yellow-900 p-2 rounded text-sm">
                  <p className="text-yellow-900 dark:text-yellow-100">
                    {model.model} - Accuracy: {(model.accuracy * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Model Performance */}
      <div className="card">
        <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
          Model Performance
        </h3>
        <div className="space-y-3">
          {models.map((model) => (
            <div
              key={model.model_name}
              className="border border-slate-200 dark:border-slate-700 rounded p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              onClick={() => setSelectedModel(model)}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-slate-900 dark:text-slate-50">
                  {model.model_name.replace(/_/g, ' ')}
                </p>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getAccuracyBg(model.accuracy)}`}>
                  {(model.accuracy * 100).toFixed(1)}%
                </span>
              </div>

              {/* Accuracy Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all ${getAccuracyColor(model.accuracy).replace('text-', 'bg-')}`}
                  style={{ width: `${model.accuracy * 100}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Predictions</p>
                  <p className="font-bold text-slate-900 dark:text-slate-50">{model.total_predictions}</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Correct</p>
                  <p className="font-bold text-green-600">{model.correct_predictions}</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Precision</p>
                  <p className="font-bold text-slate-900 dark:text-slate-50">{(model.precision * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Retraining Jobs */}
      <div className="card">
        <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
          <RefreshCw size={20} />
          Recent Retraining Jobs
        </h3>
        {retrainingJobs.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">No retraining jobs yet</p>
        ) : (
          <div className="space-y-3">
            {retrainingJobs.slice(-5).reverse().map((job) => (
              <div key={job.id} className="border border-slate-200 dark:border-slate-700 rounded p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">
                      {job.model_name.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {job.reason}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    job.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : job.status === 'running'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {job.status}
                  </span>
                </div>

                {job.improvement > 0 && (
                  <p className="text-sm text-green-600 font-semibold">
                    ✓ Improvement: +{(job.improvement * 100).toFixed(1)}%
                  </p>
                )}

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  {job.completed_at ? new Date(job.completed_at).toLocaleString() : 'In progress...'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Feedback */}
      <div className="card">
        <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
          Recent Feedback
        </h3>
        {feedback.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">No feedback yet</p>
        ) : (
          <div className="space-y-2">
            {feedback.slice(-5).reverse().map((fb) => (
              <div key={fb.id} className="text-sm border-l-2 border-blue-600 pl-3 py-1">
                <p className="font-semibold text-slate-900 dark:text-slate-50">
                  {fb.type.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Score: {(fb.score * 100).toFixed(0)}% • {fb.reference_id}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Model Details Modal */}
      {selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                  {selectedModel.model_name.replace(/_/g, ' ')}
                </h3>
                <button
                  onClick={() => setSelectedModel(null)}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Accuracy</p>
                    <p className={`text-2xl font-bold mt-1 ${getAccuracyColor(selectedModel.accuracy)}`}>
                      {(selectedModel.accuracy * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Precision</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
                      {(selectedModel.precision * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Recall</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
                      {(selectedModel.recall * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">F1 Score</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
                      {(selectedModel.f1_score * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    Prediction Statistics
                  </p>
                  <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded">
                    <p className="text-sm text-slate-900 dark:text-slate-50">
                      Total Predictions: {selectedModel.total_predictions}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      Correct: {selectedModel.correct_predictions}
                    </p>
                    <p className="text-sm text-red-600">
                      Incorrect: {selectedModel.total_predictions - selectedModel.correct_predictions}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Last Updated
                  </p>
                  <p className="text-slate-900 dark:text-slate-50 mt-1">
                    {new Date(selectedModel.last_updated).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
