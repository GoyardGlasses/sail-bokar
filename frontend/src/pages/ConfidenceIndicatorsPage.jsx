/**
 * Confidence Indicators Dashboard - Phase 1 Feature 3
 */

import React, { useState, useEffect } from 'react'
import { TrendingUp, AlertCircle, CheckCircle, Zap } from 'lucide-react'
import { useMLPredictions } from '../context/MLPredictionsContext'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'
import InlineDecisionSummary from '../features/decisionSupport/components/InlineDecisionSummary'

export default function ConfidenceIndicatorsPage() {
  const { dataImported, getPrediction } = useMLPredictions()
  const [mlPredictions, setMlPredictions] = useState({})
  const [status, setStatus] = useState(null)
  const [indicators, setIndicators] = useState([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

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
    try {
      const [statusRes, indicatorsRes] = await Promise.all([
        fetch('/api/confidence/status').catch(() => null),
        fetch('/api/confidence/indicators').catch(() => null),
      ])

      const mockIndicators = [
        { id: 'IND-001', prediction_type: 'demand_forecast', confidence: 0.82, value: 5500, range: '5000-6000', factors: ['Historical data', 'Seasonality', 'Market trends'], last_updated: new Date().toISOString() },
        { id: 'IND-002', prediction_type: 'delay_forecast', confidence: 0.75, value: 4.2, range: '2-8 hours', factors: ['Route conditions', 'Traffic patterns', 'Weather'], last_updated: new Date().toISOString() },
        { id: 'IND-003', prediction_type: 'cost_forecast', confidence: 0.88, value: 65000, range: '60000-70000', factors: ['Fuel prices', 'Distance', 'Vehicle type'], last_updated: new Date().toISOString() },
      ]

      setStatus(statusRes ? await statusRes.json() : { status: 'running', average_confidence: 0.817, total_indicators: 3, timestamp: new Date().toISOString() })
      setIndicators(indicatorsRes ? (await indicatorsRes.json()).indicators || mockIndicators : mockIndicators)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const triggerAnalysis = async () => {
    try {
      setAnalyzing(true)
      const res = await fetch('/api/confidence/analyze/trigger', { method: 'POST' })
      const data = await res.json()
      
      if (data.overall_confidence) {
        alert(`✓ Analysis complete!\nOverall Confidence: ${(data.overall_confidence * 100).toFixed(0)}%`)
        await fetchData()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error triggering analysis')
    } finally {
      setAnalyzing(false)
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-600'
    if (confidence >= 0.75) return 'text-blue-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    if (confidence >= 0.4) return 'text-orange-600'
    return 'text-red-600'
  }

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.9) return 'VERY HIGH'
    if (confidence >= 0.75) return 'HIGH'
    if (confidence >= 0.6) return 'MEDIUM'
    if (confidence >= 0.4) return 'LOW'
    return 'VERY LOW'
  }

  const getConfidenceBg = (confidence) => {
    if (confidence >= 0.9) return 'bg-green-100 dark:bg-green-900'
    if (confidence >= 0.75) return 'bg-blue-100 dark:bg-blue-900'
    if (confidence >= 0.6) return 'bg-yellow-100 dark:bg-yellow-900'
    if (confidence >= 0.4) return 'bg-orange-100 dark:bg-orange-900'
    return 'bg-red-100 dark:bg-red-900'
  }

  const costSource = Array.isArray(mlPredictions.cost) ? mlPredictions.cost[0] : mlPredictions.cost
  const delaySource = Array.isArray(mlPredictions.delay) ? mlPredictions.delay[0] : mlPredictions.delay
  const demandSource = Array.isArray(mlPredictions.demand) ? mlPredictions.demand[0] : mlPredictions.demand

  const getNormalizedConfidence = (source) => {
    if (!source || typeof source !== 'object') return null
    const raw =
      typeof source.confidence === 'number'
        ? source.confidence
        : typeof source.confidence_score === 'number'
          ? source.confidence_score
          : typeof source.probability === 'number'
            ? source.probability
            : null
    if (raw == null) return null
    return raw <= 1 ? raw : raw / 100
  }

  const costConfidence = getNormalizedConfidence(costSource)
  const delayConfidence = getNormalizedConfidence(delaySource)
  const demandConfidence = getNormalizedConfidence(demandSource)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Zap className="mx-auto text-blue-600 mb-4 animate-spin" size={48} />
          <p className="text-slate-600 dark:text-slate-400">Loading confidence indicators...</p>
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
            Confidence Indicators
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Confidence scores for all predictions and forecasts
          </p>
        </div>
        <button
          onClick={triggerAnalysis}
          disabled={analyzing}
          className="btn btn-primary flex items-center gap-2"
        >
          <TrendingUp size={18} />
          {analyzing ? 'Analyzing...' : 'Analyze Now'}
        </button>
      </div>
      <InlineDataImport templateId="operations" />
      {(costConfidence != null || delayConfidence != null || demandConfidence != null) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {costConfidence != null && (
            <div className={`card ${getConfidenceBg(costConfidence)}`}>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Cost Model</p>
              <p className={`text-3xl font-bold ${getConfidenceColor(costConfidence)}`}>
                {(costConfidence * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Source: cost_prediction</p>
            </div>
          )}

          {delayConfidence != null && (
            <div className={`card ${getConfidenceBg(delayConfidence)}`}>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Delay Model</p>
              <p className={`text-3xl font-bold ${getConfidenceColor(delayConfidence)}`}>
                {(delayConfidence * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Source: delay_prediction</p>
            </div>
          )}

          {demandConfidence != null && (
            <div className={`card ${getConfidenceBg(demandConfidence)}`}>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Demand Model</p>
              <p className={`text-3xl font-bold ${getConfidenceColor(demandConfidence)}`}>
                {(demandConfidence * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Source: demand_forecasting</p>
            </div>
          )}
        </div>
      )}

      {/* Overall Confidence */}
      {status && (
        <div className={`card ${getConfidenceBg(status.average_confidence)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Overall Confidence
              </p>
              <p className={`text-4xl font-bold ${getConfidenceColor(status.average_confidence)}`}>
                {(status.average_confidence * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Level: {getConfidenceLevel(status.average_confidence)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Indicators</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {status.total_indicators}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {indicators.map((ind) => (
          <div key={ind.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-50">
                  {ind.prediction_type.replace(/_/g, ' ').toUpperCase()}
                </p>
                <p className={`text-xs font-bold mt-1 ${getConfidenceColor(ind.confidence)}`}>
                  {getConfidenceLevel(ind.confidence)}
                </p>
              </div>
              <div className={`text-2xl font-bold ${getConfidenceColor(ind.confidence)}`}>
                {(ind.confidence * 100).toFixed(0)}%
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Current Value</p>
                <p className="font-bold text-slate-900 dark:text-slate-50">
                  {ind.value.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Range</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {ind.range}
                </p>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-3">
              <div
                className={`h-2 rounded-full transition-all ${getConfidenceColor(ind.confidence).replace('text-', 'bg-')}`}
                style={{ width: `${ind.confidence * 100}%` }}
              />
            </div>

            {/* Factors */}
            <div className="text-xs">
              <p className="font-semibold text-slate-600 dark:text-slate-400 mb-1">Factors:</p>
              <ul className="space-y-1">
                {ind.factors.slice(0, 2).map((factor, idx) => (
                  <li key={idx} className="text-slate-600 dark:text-slate-400">
                    • {factor}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {indicators.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
            Recommendations
          </h3>
          <div className="space-y-2">
            {indicators.some(ind => ind.confidence < 0.6) ? (
              <>
                <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900 rounded">
                  <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                      Low Confidence Detected
                    </p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                      Some predictions have low confidence. Consider collecting more data or adjusting parameters.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900 rounded">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    All Predictions Reliable
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                    All predictions have good confidence levels. Plans are reliable for decision-making.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confidence Details */}
      {indicators.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
            Detailed Factors
          </h3>
          <div className="space-y-4">
            {indicators.map((ind) => (
              <div key={ind.id} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-0">
                <p className="font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  {ind.prediction_type.replace(/_/g, ' ')}
                </p>
                <ul className="space-y-1 text-sm">
                  {ind.factors.map((factor, idx) => (
                    <li key={idx} className="text-slate-600 dark:text-slate-400">
                      ✓ {factor}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <InlineDecisionSummary
        context="ml"
        pageTitle="Confidence Indicators"
      />
    </div>
  )
}
