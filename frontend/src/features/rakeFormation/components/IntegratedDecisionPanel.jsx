import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, TrendingUp, Zap } from 'lucide-react'
import {
  generateDecision,
  identifyRisks,
  generateRecommendations,
} from '../decisionSupport'

export default function IntegratedDecisionPanel({
  orders = [],
  stockyards = [],
  loadingPoints = [],
  routes = [],
  constraints = {},
  objectives = {},
}) {
  const [decision, setDecision] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedAlternative, setSelectedAlternative] = useState(0)
  const [expandedRake, setExpandedRake] = useState(null)

  const handleGenerateDecision = async () => {
    setLoading(true)
    setError(null)

    try {
      const context = {
        orders,
        stockyards,
        loadingPoints,
        routes,
        constraints,
        objectives,
      }

      const result = await generateDecision(context)
      setDecision(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate decision')
      console.error('Decision generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!decision) {
    return (
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Integrated Decision Support</h3>
          <Zap className="w-5 h-5 text-blue-500" />
        </div>

        <p className="text-sm text-gray-600">
          Generate an optimized dispatch plan using integrated stock allocation, routing optimization, and decision support.
        </p>

        <button
          onClick={handleGenerateDecision}
          disabled={loading || orders.length === 0}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating Plan...
            </span>
          ) : (
            'Generate Dispatch Plan'
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {orders.length === 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              No orders available. Please add orders first.
            </p>
          </div>
        )}
      </div>
    )
  }

  const currentPlan = decision.alternatives[selectedAlternative]?.rakes || decision.plan.rakes

  return (
    <div className="space-y-4">
      {/* Confidence Score */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Plan Confidence</h4>
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-3xl font-bold text-green-600">
              {decision.confidence.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">System confidence in this plan</p>
          </div>

          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
            <svg className="w-24 h-24" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="2"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2"
                strokeDasharray={`${(decision.confidence / 100) * 282.7} 282.7`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Plan Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Total Rakes</p>
          <p className="text-2xl font-bold">{decision.plan.rakes.length}</p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-600">Total Cost</p>
          <p className="text-2xl font-bold">₹{(decision.plan.totalCost / 100000).toFixed(1)}L</p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-600">Avg Utilization</p>
          <p className="text-2xl font-bold">{decision.plan.totalUtilization.toFixed(1)}%</p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-600">Total Load</p>
          <p className="text-2xl font-bold">{decision.plan.totalLoad}T</p>
        </div>
      </div>

      {/* Explanation */}
      <div className="card">
        <h4 className="font-semibold mb-3">Why This Plan?</h4>
        <pre className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-48">
          {decision.explanation}
        </pre>
      </div>

      {/* Risks */}
      {decision.risks.length > 0 && (
        <div className="card border-yellow-200 bg-yellow-50">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            Identified Risks ({decision.risks.length})
          </h4>

          <div className="space-y-2">
            {decision.risks.map((risk, idx) => (
              <div
                key={idx}
                className={`p-2 rounded border-l-4 ${
                  risk.severity === 'critical'
                    ? 'border-red-500 bg-red-50'
                    : risk.severity === 'high'
                      ? 'border-orange-500 bg-orange-50'
                      : risk.severity === 'medium'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-blue-500 bg-blue-50'
                }`}
              >
                <p className="font-semibold text-sm">{risk.message}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Mitigation: {risk.mitigation}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Probability: {(risk.probability * 100).toFixed(0)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {decision.recommendations.length > 0 && (
        <div className="card bg-blue-50 border border-blue-200">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Recommendations
          </h4>

          <ul className="space-y-2">
            {decision.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Alternatives */}
      {decision.alternatives.length > 0 && (
        <div className="card">
          <h4 className="font-semibold mb-3">Alternative Plans</h4>

          <div className="grid grid-cols-1 gap-2">
            {decision.alternatives.map((alt, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedAlternative(idx)}
                className={`p-3 rounded-lg border-2 text-left transition ${
                  selectedAlternative === idx
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold">{alt.name}</p>
                <p className="text-sm text-gray-600">
                  Cost: ₹{(alt.totalCost / 100000).toFixed(1)}L | Utilization:{' '}
                  {alt.avgUtilization.toFixed(1)}%
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rake Details */}
      <div className="card">
        <h4 className="font-semibold mb-3">Rake Details</h4>

        <div className="space-y-2">
          {currentPlan.map((rake, idx) => (
            <div
              key={idx}
              className="border rounded-lg overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedRake(expandedRake === idx ? null : idx)
                }
                className="w-full p-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
              >
                <div className="text-left">
                  <p className="font-semibold">{rake.rakeId}</p>
                  <p className="text-sm text-gray-600">
                    {rake.sourceStockyard} → {rake.destination}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold">{rake.totalLoad}T</p>
                  <p className="text-sm text-gray-600">
                    {rake.utilization.toFixed(1)}%
                  </p>
                </div>
              </button>

              {expandedRake === idx && (
                <div className="p-3 border-t bg-white space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Cost</p>
                      <p className="font-semibold">₹{rake.cost.toLocaleString()}</p>
                    </div>

                    <div>
                      <p className="text-gray-600">Cost/Tonne</p>
                      <p className="font-semibold">
                        ₹{(rake.cost / rake.totalLoad).toFixed(0)}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600">Est. Delivery</p>
                      <p className="font-semibold">
                        {new Date(rake.estimatedDeliveryTime).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600">Orders</p>
                      <p className="font-semibold">{rake.composition.length}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      Orders:
                    </p>
                    <div className="space-y-1">
                      {rake.composition.map((comp, cidx) => (
                        <div
                          key={cidx}
                          className="text-xs bg-gray-50 p-1 rounded"
                        >
                          <p className="font-semibold">{comp.orderId}</p>
                          <p className="text-gray-600">
                            {comp.materialName} - {comp.quantity}T
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleGenerateDecision}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Regenerate Plan
        </button>

        <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Approve & Execute
        </button>

        <button className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
          Export Plan
        </button>
      </div>
    </div>
  )
}
