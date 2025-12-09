/**
 * Monte Carlo Simulation Page
 * Advanced scenario analysis for rake formation optimization
 */

import React, { useState, useEffect, useMemo } from 'react'
import MonteCarloVisualization from '../features/rakeFormation/components/MonteCarloVisualizationFixed'
import { Zap, TrendingUp, BarChart3, AlertCircle } from 'lucide-react'
import { useMLPredictions } from '../context/MLPredictionsContext'
import { useImportedData } from '../hooks/useImportedData'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'

export default function MonteCarloSimulationPage() {
  const { dataImported, getPrediction } = useMLPredictions()
  const [mlScenarioAnalysis, setMlScenarioAnalysis] = useState(null)
  const [activeSection, setActiveSection] = useState('simulation')
  const { data: importedData, isLoaded } = useImportedData()

  useEffect(() => {
    if (dataImported) {
      const scenarioAnalysis = getPrediction('scenario_analysis')
      setMlScenarioAnalysis(scenarioAnalysis)
    }
  }, [dataImported, getPrediction])

  const hasImportedOrders = useMemo(() => {
    return (
      isLoaded &&
      importedData &&
      Array.isArray(importedData.orders) &&
      importedData.orders.length > 0
    )
  }, [isLoaded, importedData])

  const importedSummary = useMemo(() => {
    if (!hasImportedOrders) return null

    let totalTonnage = 0
    try {
      importedData.orders.forEach((o) => {
        const qty = Number(o.totalQuantity ?? o.quantity ?? o.tonnage ?? 0)
        if (Number.isFinite(qty) && qty > 0) {
          totalTonnage += qty
        }
      })
    } catch (err) {
      console.error('Failed to summarize imported orders for Monte Carlo:', err)
    }

    return {
      orders: importedData.orders.length,
      tonnage: totalTonnage,
    }
  }, [hasImportedOrders, importedData])

  const mlScenarioSummary = useMemo(() => {
    if (!mlScenarioAnalysis) return null

    let scenarioCount = null

    if (Array.isArray(mlScenarioAnalysis)) {
      scenarioCount = mlScenarioAnalysis.length
    } else if (Array.isArray(mlScenarioAnalysis.scenario_predictions)) {
      scenarioCount = mlScenarioAnalysis.scenario_predictions.length
    }

    const riskLevel =
      mlScenarioAnalysis.overall_risk_level ||
      mlScenarioAnalysis.risk_level ||
      null

    if (scenarioCount == null && !riskLevel) {
      return { hasData: true }
    }

    return {
      scenarioCount,
      riskLevel,
    }
  }, [mlScenarioAnalysis])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-10 h-10 text-yellow-400" />
          <h1 className="text-4xl font-bold text-white">Monte Carlo Simulation Engine</h1>
        </div>
        <p className="text-gray-400 text-lg">
          Advanced scenario analysis with 10,000+ simulations for rake formation optimization
        </p>
      </div>

      <InlineDataImport templateId="operations" />

      {(importedSummary || mlScenarioSummary) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {importedSummary && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              <p className="text-sm text-slate-300">Imported Orders</p>
              <p className="text-2xl font-bold text-white mt-1">
                {importedSummary.orders.toLocaleString()} orders
              </p>
              {importedSummary.tonnage > 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  Total tonnage ~ {Math.round(importedSummary.tonnage).toLocaleString()}T
                </p>
              )}
            </div>
          )}
          {mlScenarioSummary && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              <p className="text-sm text-slate-300">ML Scenario Analysis</p>
              {mlScenarioSummary.scenarioCount != null ? (
                <p className="text-2xl font-bold text-blue-400 mt-1">
                  {mlScenarioSummary.scenarioCount} scenarios modeled
                </p>
              ) : (
                <p className="text-2xl font-bold text-blue-400 mt-1">Live model output</p>
              )}
              {mlScenarioSummary.riskLevel && (
                <p className="text-xs text-slate-400 mt-1 uppercase">
                  Overall risk: {mlScenarioSummary.riskLevel}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'simulation', label: '🎲 Simulation', icon: Zap },
          { id: 'guide', label: '📚 Guide', icon: BarChart3 },
          { id: 'examples', label: '💡 Examples', icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeSection === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Simulation Section */}
        {activeSection === 'simulation' && (
          <div>
            <MonteCarloVisualization />
          </div>
        )}

        {/* Guide Section */}
        {activeSection === 'guide' && (
          <div className="space-y-6">
            {/* What is Monte Carlo */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-400" />
                What is Monte Carlo Simulation?
              </h2>
              <p className="text-gray-300 mb-4">
                Monte Carlo simulation is a computational technique that uses random sampling to solve complex problems. 
                It runs thousands of scenarios with different random variations to understand the range of possible outcomes 
                and their probabilities.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-700 rounded p-4">
                  <h3 className="font-semibold text-white mb-2">✅ How It Works</h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Generate 10,000 random scenarios</li>
                    <li>• Apply uncertainty to each parameter</li>
                    <li>• Optimize rake plan for each scenario</li>
                    <li>• Calculate statistics from results</li>
                    <li>• Identify risks and opportunities</li>
                  </ul>
                </div>
                <div className="bg-slate-700 rounded p-4">
                  <h3 className="font-semibold text-white mb-2">🎯 Why Use It</h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Understand uncertainty impact</li>
                    <li>• Quantify risks accurately</li>
                    <li>• Make data-driven decisions</li>
                    <li>• Budget with confidence</li>
                    <li>• Compare strategies objectively</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">📊 Key Metrics Explained</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-700 rounded p-4">
                  <h3 className="font-semibold text-blue-400 mb-2">Average Cost</h3>
                  <p className="text-gray-300 text-sm mb-2">
                    The mean cost across all 10,000 scenarios. This is your expected cost.
                  </p>
                  <p className="text-xs text-gray-400">Example: ₹450,000 average</p>
                </div>
                <div className="bg-slate-700 rounded p-4">
                  <h3 className="font-semibold text-blue-400 mb-2">Cost Std Dev</h3>
                  <p className="text-gray-300 text-sm mb-2">
                    Standard deviation shows how much costs vary. Higher = more uncertainty.
                  </p>
                  <p className="text-xs text-gray-400">Example: ₹35,000 std dev (±7.8%)</p>
                </div>
                <div className="bg-slate-700 rounded p-4">
                  <h3 className="font-semibold text-red-400 mb-2">Cost Risk</h3>
                  <p className="text-gray-300 text-sm mb-2">
                    Probability of exceeding your budget. Lower is better.
                  </p>
                  <p className="text-xs text-gray-400">Example: 15% chance of exceeding budget</p>
                </div>
                <div className="bg-slate-700 rounded p-4">
                  <h3 className="font-semibold text-green-400 mb-2">95% Confidence Interval</h3>
                  <p className="text-gray-300 text-sm mb-2">
                    95% of scenarios fall within this range. Use upper bound for budgeting.
                  </p>
                  <p className="text-xs text-gray-400">Example: ₹410k - ₹490k (95% CI)</p>
                </div>
              </div>
            </div>

            {/* Uncertainty Factors */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">⚡ Uncertainty Factors Modeled</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Material Availability', variance: '±15%', impact: 'High' },
                  { name: 'Order Arrivals', variance: '±20%', impact: 'High' },
                  { name: 'Transport Delays', variance: '±4 hours', impact: 'Medium' },
                  { name: 'Cost Variations', variance: '±10%', impact: 'High' },
                  { name: 'Equipment Failures', variance: '5% probability', impact: 'Medium' },
                  { name: 'Demand Variability', variance: '±25%', impact: 'High' },
                ].map((factor, idx) => (
                  <div key={idx} className="bg-slate-700 rounded p-4">
                    <h3 className="font-semibold text-white mb-2">{factor.name}</h3>
                    <p className="text-gray-300 text-sm mb-2">Variance: {factor.variance}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      factor.impact === 'High' ? 'bg-red-900 text-red-200' : 'bg-yellow-900 text-yellow-200'
                    }`}>
                      {factor.impact} Impact
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">🎯 Best Practices</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="text-green-400 font-bold">1.</span>
                  <div>
                    <p className="text-white font-semibold">Use Realistic Uncertainty</p>
                    <p className="text-gray-400 text-sm">Base parameters on historical data, not guesses</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-400 font-bold">2.</span>
                  <div>
                    <p className="text-white font-semibold">Run Sufficient Scenarios</p>
                    <p className="text-gray-400 text-sm">10,000 scenarios for balanced accuracy and speed</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-400 font-bold">3.</span>
                  <div>
                    <p className="text-white font-semibold">Validate Results</p>
                    <p className="text-gray-400 text-sm">Compare with historical outcomes and adjust if needed</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-400 font-bold">4.</span>
                  <div>
                    <p className="text-white font-semibold">Use for Decision Making</p>
                    <p className="text-gray-400 text-sm">Compare scenarios before deciding on strategy</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-400 font-bold">5.</span>
                  <div>
                    <p className="text-white font-semibold">Regular Updates</p>
                    <p className="text-gray-400 text-sm">Re-run monthly with new data to stay accurate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Examples Section */}
        {activeSection === 'examples' && (
          <div className="space-y-6">
            {/* Use Case 1 */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">💡 Use Case 1: Budget Planning</h2>
              <div className="space-y-3">
                <div className="bg-slate-700 rounded p-4">
                  <p className="text-gray-300 mb-2">
                    <strong>Scenario:</strong> You need to set a budget for next month's rake operations
                  </p>
                  <p className="text-gray-300 mb-2">
                    <strong>Solution:</strong> Run Monte Carlo simulation
                  </p>
                  <p className="text-gray-300 mb-2">
                    <strong>Result:</strong> 95% Confidence Interval = ₹410k - ₹490k
                  </p>
                  <p className="text-gray-300">
                    <strong>Action:</strong> Set budget to ₹490k (upper bound). This gives 95% confidence of not exceeding budget.
                  </p>
                </div>
              </div>
            </div>

            {/* Use Case 2 */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">💡 Use Case 2: Risk Assessment</h2>
              <div className="space-y-3">
                <div className="bg-slate-700 rounded p-4">
                  <p className="text-gray-300 mb-2">
                    <strong>Scenario:</strong> You want to know if your plan is risky
                  </p>
                  <p className="text-gray-300 mb-2">
                    <strong>Solution:</strong> Check risk metrics
                  </p>
                  <p className="text-gray-300 mb-2">
                    <strong>Result:</strong> Cost Risk = 15%, Delay Risk = 8%, Capacity Risk = 12%
                  </p>
                  <p className="text-gray-300">
                    <strong>Action:</strong> Overall risk is moderate (11.9%). Implement cost controls and monitor material availability.
                  </p>
                </div>
              </div>
            </div>

            {/* Use Case 3 */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">💡 Use Case 3: Strategy Comparison</h2>
              <div className="space-y-3">
                <div className="bg-slate-700 rounded p-4">
                  <p className="text-gray-300 mb-2">
                    <strong>Scenario:</strong> You have two strategies and need to choose one
                  </p>
                  <p className="text-gray-300 mb-2">
                    <strong>Solution:</strong> Run Monte Carlo on both, compare results
                  </p>
                  <p className="text-gray-300 mb-2">
                    <strong>Result:</strong> Strategy B is ₹25k cheaper with 3.5% better utilization
                  </p>
                  <p className="text-gray-300">
                    <strong>Action:</strong> Choose Strategy B. Quantified benefit: ₹25k savings + 3.5% better utilization.
                  </p>
                </div>
              </div>
            </div>

            {/* Use Case 4 */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">💡 Use Case 4: What-If Analysis</h2>
              <div className="space-y-3">
                <div className="bg-slate-700 rounded p-4">
                  <p className="text-gray-300 mb-2">
                    <strong>Scenario:</strong> "What if material availability drops 20%?"
                  </p>
                  <p className="text-gray-300 mb-2">
                    <strong>Solution:</strong> Sensitivity analysis on material availability
                  </p>
                  <p className="text-gray-300 mb-2">
                    <strong>Result:</strong> Cost increases by 8%, Utilization drops by 5%
                  </p>
                  <p className="text-gray-300">
                    <strong>Action:</strong> Prepare contingency plan. Identify alternative suppliers.
                  </p>
                </div>
              </div>
            </div>

            {/* Use Case 5 */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">💡 Use Case 5: Parameter Optimization</h2>
              <div className="space-y-3">
                <div className="bg-slate-700 rounded p-4">
                  <p className="text-gray-300 mb-2">
                    <strong>Scenario:</strong> You want to know which parameter to optimize first
                  </p>
                  <p className="text-gray-300 mb-2">
                    <strong>Solution:</strong> Run sensitivity analysis on all parameters
                  </p>
                  <p className="text-gray-300 mb-2">
                    <strong>Result:</strong> Material Availability has elasticity 1.8 (highest impact)
                  </p>
                  <p className="text-gray-300">
                    <strong>Action:</strong> Focus optimization on material availability. Expected ROI improvement: 15-25%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex gap-3">
          <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-white mb-2">💡 Pro Tip</h3>
            <p className="text-gray-300">
              Start with 5,000 scenarios for quick analysis (1-2 minutes), then run 10,000 scenarios for detailed results (5-10 minutes). 
              Use the 95% confidence interval upper bound for conservative budgeting.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
