import React, { useState, useMemo } from 'react'
import { Brain, BarChart3, AlertCircle, MessageSquare, Activity } from 'lucide-react'
import MLDashboard from '../components/MLDashboard'
import PredictionsDisplay from '../components/PredictionsDisplay'
import FeedbackForm from '../components/FeedbackForm'
import AlertsDisplay from '../components/AlertsDisplay'
import ModelStatusComponent from '../components/ModelStatusComponent'
import { useMLPredictions } from '../context/MLPredictionsContext'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'
import InlineDecisionSummary from '../features/decisionSupport/components/InlineDecisionSummary'

export default function MLPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const {
    predictions: mlPredictions,
    loading: mlLoading,
    hasPredictions,
    getPrediction,
  } = useMLPredictions()

  // Default predictions data
  const defaultPredictions = {
    delay: '2.5 days',
    cost: '₹45,000',
    demand: '850 tonnes',
    quality: '98%',
    fuel: '250 liters',
    route: 'Bokaro-Kolkata',
    cost_opt: '₹40,500',
    time_opt: '18 hours',
    vehicle: 'Truck-003',
    material: 'CR Coils',
    risk: '15%',
    decision: 'Dispatch Now',
    anomaly: 'No Anomalies',
    supplier: '4.8/5',
    scenario: 'Optimistic',
    maintenance: 'No Issues',
    satisfaction: '4.7/5'
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Brain },
    { id: 'predictions', label: 'Predictions', icon: BarChart3 },
    { id: 'status', label: 'Model Status', icon: Activity },
    { id: 'alerts', label: 'Alerts', icon: AlertCircle },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  ]

  const mergedPredictions = useMemo(() => {
    if (!hasPredictions || !mlPredictions) {
      return defaultPredictions
    }

    const extractNumber = (raw) => {
      if (raw == null) return null
      if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null
      if (typeof raw === 'string') {
        const n = Number(raw)
        return Number.isFinite(n) ? n : null
      }
      if (Array.isArray(raw)) {
        for (const item of raw) {
          const n = extractNumber(item)
          if (n != null) return n
        }
        return null
      }
      if (typeof raw === 'object') {
        for (const value of Object.values(raw)) {
          const n = extractNumber(value)
          if (n != null) return n
        }
      }
      return null
    }

    const getModelValue = (name) => {
      const fromGetter = getPrediction ? getPrediction(name) : null
      const raw = fromGetter != null ? fromGetter : mlPredictions[name]
      return extractNumber(raw)
    }

    const delayVal = getModelValue('delay_prediction')
    const costVal = getModelValue('cost_prediction')
    const demandVal = getModelValue('demand_forecasting')
    const qualityVal = getModelValue('quality_prediction')
    const fuelVal = getModelValue('fuel_consumption')
    const routeVal = getModelValue('route_optimization')
    const costOptVal = getModelValue('cost_optimization')
    const timeOptVal = getModelValue('time_optimization')
    const vehicleVal = getModelValue('vehicle_allocation')
    const materialVal = getModelValue('material_recommendation')
    const riskVal = getModelValue('risk_assessment')
    const decisionVal = getModelValue('decision_support')
    const anomalyVal = getModelValue('anomaly_detection')
    const supplierVal = getModelValue('supplier_performance')
    const scenarioVal = getModelValue('scenario_analysis')
    const maintenanceVal = getModelValue('predictive_maintenance')
    const satisfactionVal = getModelValue('customer_satisfaction')

    const dynamic = { ...defaultPredictions }

    if (delayVal != null) {
      dynamic.delay = `${delayVal.toFixed(2)} days`
    }
    if (costVal != null) {
      dynamic.cost = `₹${costVal.toFixed(0)}`
    }
    if (demandVal != null) {
      dynamic.demand = `${demandVal.toFixed(0)} tonnes`
    }
    if (qualityVal != null) {
      const q = qualityVal <= 1 ? qualityVal * 100 : qualityVal
      dynamic.quality = `${q.toFixed(1)}%`
    }
    if (fuelVal != null) {
      dynamic.fuel = `${fuelVal.toFixed(0)} liters`
    }
    if (routeVal != null) {
      dynamic.route = dynamic.route || `Route score: ${routeVal.toFixed(1)}`
    }
    if (costOptVal != null) {
      dynamic.cost_opt = `₹${costOptVal.toFixed(0)}`
    }
    if (timeOptVal != null) {
      dynamic.time_opt = `${timeOptVal.toFixed(1)} hours`
    }
    if (vehicleVal != null) {
      dynamic.vehicle = dynamic.vehicle || `Score: ${vehicleVal.toFixed(1)}`
    }
    if (materialVal != null) {
      dynamic.material = dynamic.material || `Score: ${materialVal.toFixed(1)}`
    }
    if (riskVal != null) {
      const r = riskVal <= 1 ? riskVal * 100 : riskVal
      dynamic.risk = `${r.toFixed(1)}%`
    }
    if (decisionVal != null) {
      dynamic.decision = dynamic.decision || `Score: ${decisionVal.toFixed(1)}`
    }
    if (anomalyVal != null) {
      dynamic.anomaly = dynamic.anomaly || `Score: ${anomalyVal.toFixed(1)}`
    }
    if (supplierVal != null) {
      const s = supplierVal <= 1 ? supplierVal * 5 : supplierVal
      dynamic.supplier = `${s.toFixed(1)}/5`
    }
    if (scenarioVal != null) {
      dynamic.scenario = dynamic.scenario || `Score: ${scenarioVal.toFixed(1)}`
    }
    if (maintenanceVal != null) {
      dynamic.maintenance = dynamic.maintenance || `Score: ${maintenanceVal.toFixed(1)}`
    }
    if (satisfactionVal != null) {
      const v = satisfactionVal <= 1 ? satisfactionVal * 5 : satisfactionVal
      dynamic.satisfaction = `${v.toFixed(1)}/5`
    }

    return dynamic
  }, [hasPredictions, mlPredictions, getPrediction])

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Brain size={32} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">ML Models Center</h1>
        </div>
        <p className="text-slate-600">Manage, monitor, and interact with all 17 ML models</p>
      </div>

      <InlineDataImport templateId="operations" />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'dashboard' && (
          <div>
            <MLDashboard />
          </div>
        )}
        {activeTab === 'predictions' && (
          <div>
            <PredictionsDisplay
              predictions={mergedPredictions}
              loading={mlLoading && !hasPredictions}
            />
          </div>
        )}
        {activeTab === 'status' && (
          <div>
            <ModelStatusComponent />
          </div>
        )}
        {activeTab === 'alerts' && (
          <div>
            <AlertsDisplay />
          </div>
        )}
        {activeTab === 'feedback' && (
          <div>
            <FeedbackForm />
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-3">💡 How to Use ML Models</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <span className="font-semibold">1. Dashboard:</span> View real-time predictions and model performance
          </p>
          <p>
            <span className="font-semibold">2. Predictions:</span> See detailed predictions from all 17 models with confidence scores
          </p>
          <p>
            <span className="font-semibold">3. Model Status:</span> Check health and accuracy of each model
          </p>
          <p>
            <span className="font-semibold">4. Alerts:</span> Monitor system alerts and model warnings
          </p>
          <p>
            <span className="font-semibold">5. Feedback:</span> Provide feedback to help models improve
          </p>
        </div>
      </div>

      <InlineDecisionSummary
        context="ml"
        pageTitle="ML Models Center"
        activeView={tabs.find((t) => t.id === activeTab)?.label}
      />
    </div>
  )
}
