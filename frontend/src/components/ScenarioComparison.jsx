/**
 * ScenarioComparison Component
 * Compare original prediction vs modified scenarios (what-if analysis)
 */

import React, { useState, useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingDown, TrendingUp, Copy } from 'lucide-react'

export default function ScenarioComparison({ onCompare, isLoading }) {
  const [baselineData, setBaselineData] = useState({
    route: 'Bokaro->Kolkata',
    tonnes_dispatched: 500,
    material_type: 'HR_Coils',
    weather_condition: 'Clear',
  })

  const [scenarios, setScenarios] = useState([
    {
      id: 1,
      name: 'Scenario 1: Increase Tonnes',
      data: { ...baselineData, tonnes_dispatched: 750 },
    },
    {
      id: 2,
      name: 'Scenario 2: Bad Weather',
      data: { ...baselineData, weather_condition: 'Rainy' },
    },
    {
      id: 3,
      name: 'Scenario 3: Different Material',
      data: { ...baselineData, material_type: 'Plates' },
    },
  ])

  const [comparisonResults, setComparisonResults] = useState(null)

  // Mock prediction generator
  const generatePrediction = (data) => {
    const baseDelay = 5
    const tonnesMultiplier = (data.tonnes_dispatched - 500) * 0.01
    const weatherMultiplier = {
      Clear: 0,
      Rainy: 3,
      Cloudy: 1,
      Foggy: 2,
      Stormy: 5,
    }[data.weather_condition] || 0
    const materialMultiplier = {
      HR_Coils: 0,
      CR_Coils: 1,
      Plates: 2,
      Wire_Rods: 1.5,
      TMT_Bars: 0.5,
    }[data.material_type] || 0

    const delayHours = Math.max(1, baseDelay + tonnesMultiplier + weatherMultiplier + materialMultiplier)
    const probability = Math.min(0.3, 0.08 + tonnesMultiplier * 0.02 + weatherMultiplier * 0.05 + materialMultiplier * 0.03)

    return {
      delayHours: parseFloat(delayHours.toFixed(1)),
      probability: parseFloat(probability.toFixed(2)),
      riskLevel: probability > 0.15 ? 'High' : probability > 0.08 ? 'Medium' : 'Low',
    }
  }

  const handleBaselineChange = (field, value) => {
    const newBaseline = { ...baselineData, [field]: value }
    setBaselineData(newBaseline)
    // Update all scenarios to reflect new baseline
    setScenarios(
      scenarios.map((s) => ({
        ...s,
        data: { ...newBaseline, ...s.data },
      }))
    )
  }

  const handleScenarioChange = (id, field, value) => {
    setScenarios(
      scenarios.map((s) =>
        s.id === id ? { ...s, data: { ...s.data, [field]: value } } : s
      )
    )
  }

  const handleScenarioNameChange = (id, name) => {
    setScenarios(
      scenarios.map((s) => (s.id === id ? { ...s, name } : s))
    )
  }

  const handleCompare = () => {
    const baselinePrediction = generatePrediction(baselineData)
    const scenarioPredictions = scenarios.map((s) => ({
      ...s,
      prediction: generatePrediction(s.data),
    }))

    setComparisonResults({
      baseline: { ...baselineData, ...baselinePrediction },
      scenarios: scenarioPredictions,
    })
  }

  const chartData = useMemo(() => {
    if (!comparisonResults) return []

    return [
      {
        name: 'Baseline',
        delay: comparisonResults.baseline.delayHours,
        risk: comparisonResults.baseline.probability * 100,
      },
      ...comparisonResults.scenarios.map((s) => ({
        name: s.name.split(':')[1]?.trim() || s.name,
        delay: s.prediction.delayHours,
        risk: s.prediction.probability * 100,
      })),
    ]
  }, [comparisonResults])

  const impactData = useMemo(() => {
    if (!comparisonResults) return []

    const baseline = comparisonResults.baseline
    return comparisonResults.scenarios.map((s) => {
      const delayDiff = s.prediction.delayHours - baseline.delayHours
      const riskDiff = (s.prediction.probability - baseline.probability) * 100

      return {
        scenario: s.name.split(':')[1]?.trim() || s.name,
        delayImpact: delayDiff,
        riskImpact: riskDiff,
      }
    })
  }, [comparisonResults])

  return (
    <div className="space-y-6">
      {/* Baseline Configuration */}
      <div className="card space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Baseline Configuration</h2>
        <p className="text-slate-600 text-sm">Set your baseline prediction parameters</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Route</label>
            <input
              type="text"
              value={baselineData.route}
              onChange={(e) => handleBaselineChange('route', e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Tonnes Dispatched</label>
            <input
              type="number"
              value={baselineData.tonnes_dispatched}
              onChange={(e) => handleBaselineChange('tonnes_dispatched', parseFloat(e.target.value))}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Material Type</label>
            <select
              value={baselineData.material_type}
              onChange={(e) => handleBaselineChange('material_type', e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option>HR_Coils</option>
              <option>CR_Coils</option>
              <option>Plates</option>
              <option>Wire_Rods</option>
              <option>TMT_Bars</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Weather Condition</label>
            <select
              value={baselineData.weather_condition}
              onChange={(e) => handleBaselineChange('weather_condition', e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option>Clear</option>
              <option>Rainy</option>
              <option>Cloudy</option>
              <option>Foggy</option>
              <option>Stormy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scenarios */}
      <div className="card space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">What-If Scenarios</h2>
        <p className="text-slate-600 text-sm">Modify parameters to see how predictions change</p>

        <div className="space-y-4">
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
              <input
                type="text"
                value={scenario.name}
                onChange={(e) => handleScenarioNameChange(scenario.id, e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 font-medium"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Route</label>
                  <input
                    type="text"
                    value={scenario.data.route}
                    onChange={(e) => handleScenarioChange(scenario.id, 'route', e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tonnes</label>
                  <input
                    type="number"
                    value={scenario.data.tonnes_dispatched}
                    onChange={(e) => handleScenarioChange(scenario.id, 'tonnes_dispatched', parseFloat(e.target.value))}
                    disabled={isLoading}
                    className="w-full px-3 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Material</label>
                  <select
                    value={scenario.data.material_type}
                    onChange={(e) => handleScenarioChange(scenario.id, 'material_type', e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option>HR_Coils</option>
                    <option>CR_Coils</option>
                    <option>Plates</option>
                    <option>Wire_Rods</option>
                    <option>TMT_Bars</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Weather</label>
                  <select
                    value={scenario.data.weather_condition}
                    onChange={(e) => handleScenarioChange(scenario.id, 'weather_condition', e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option>Clear</option>
                    <option>Rainy</option>
                    <option>Cloudy</option>
                    <option>Foggy</option>
                    <option>Stormy</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleCompare}
          disabled={isLoading}
          className="w-full btn btn-primary disabled:opacity-50"
          aria-label="Compare scenarios"
        >
          {isLoading ? 'Comparing...' : 'Compare Scenarios'}
        </button>
      </div>

      {/* Comparison Results */}
      {comparisonResults && (
        <>
          {/* Baseline Summary */}
          <div className="card bg-blue-50 border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3">Baseline Prediction</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-blue-600">Delay Hours</p>
                <p className="text-2xl font-bold text-blue-900">{comparisonResults.baseline.delayHours}h</p>
              </div>
              <div>
                <p className="text-xs text-blue-600">Risk Probability</p>
                <p className="text-2xl font-bold text-blue-900">{(comparisonResults.baseline.probability * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-blue-600">Risk Level</p>
                <p className="text-2xl font-bold text-blue-900">{comparisonResults.baseline.riskLevel}</p>
              </div>
            </div>
          </div>

          {/* Comparison Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delay & Risk Comparison */}
            <div className="card">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Delay & Risk Across Scenarios</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="delay" fill="#ef4444" name="Delay (hours)" />
                  <Bar yAxisId="right" dataKey="risk" fill="#f97316" name="Risk (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Impact Analysis */}
            <div className="card">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Impact vs Baseline</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={impactData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="scenario" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="delayImpact" fill="#ef4444" name="Delay Change (h)" />
                  <Bar dataKey="riskImpact" fill="#f97316" name="Risk Change (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scenario Results Table */}
          <div className="card">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Scenario Results</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-slate-900">Scenario</th>
                    <th className="px-4 py-2 text-left text-slate-900">Delay (h)</th>
                    <th className="px-4 py-2 text-left text-slate-900">Risk %</th>
                    <th className="px-4 py-2 text-left text-slate-900">vs Baseline</th>
                    <th className="px-4 py-2 text-left text-slate-900">Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonResults.scenarios.map((s, idx) => {
                    const delayDiff = s.prediction.delayHours - comparisonResults.baseline.delayHours
                    const isWorse = delayDiff > 0
                    return (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-2 font-medium text-slate-900">{s.name}</td>
                        <td className="px-4 py-2 text-slate-600">{s.prediction.delayHours}h</td>
                        <td className="px-4 py-2 text-slate-600">{(s.prediction.probability * 100).toFixed(1)}%</td>
                        <td className="px-4 py-2 text-slate-600">
                          {delayDiff > 0 ? '+' : ''}{delayDiff.toFixed(1)}h
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1">
                            {isWorse ? (
                              <>
                                <TrendingUp className="text-red-600" size={16} />
                                <span className="text-red-600 font-medium">Worse</span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="text-green-600" size={16} />
                                <span className="text-green-600 font-medium">Better</span>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
