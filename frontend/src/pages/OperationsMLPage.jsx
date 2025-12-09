import React from 'react'
import { Link } from 'react-router-dom'
import { Brain, MapPin, AlertTriangle, Clock, DollarSign } from 'lucide-react'
import { useMLPredictions } from '../context/MLPredictionsContext'
import { useImportedData } from '../hooks/useImportedData'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'
import InlineDecisionSummary from '../features/decisionSupport/components/InlineDecisionSummary'

export default function OperationsMLPage() {
  const { dataImported, getPrediction, hasPredictions } = useMLPredictions()
  const { data: importedData, isLoaded } = useImportedData()

  const delayPrediction = dataImported ? getPrediction('delay_prediction') : null
  const costPrediction = dataImported ? getPrediction('cost_prediction') : null
  const riskAssessment = dataImported ? getPrediction('risk_assessment') : null
  const minLoading = dataImported ? getPrediction('minimum_loading_time') : null

  const onTimeProbability =
    delayPrediction &&
    (typeof delayPrediction.on_time_probability === 'number'
      ? delayPrediction.on_time_probability <= 1
        ? delayPrediction.on_time_probability * 100
        : delayPrediction.on_time_probability
      : typeof delayPrediction.on_time_percentage === 'number'
        ? delayPrediction.on_time_percentage
        : null)

  const estimatedCost =
    costPrediction &&
    (typeof costPrediction.estimated_cost === 'number'
      ? costPrediction.estimated_cost
      : typeof costPrediction.average_cost_per_shipment === 'number'
        ? costPrediction.average_cost_per_shipment
        : typeof costPrediction.average_cost_per_ton === 'number'
          ? costPrediction.average_cost_per_ton
          : null)

  const totalRisks =
    riskAssessment &&
    (typeof riskAssessment.total_risks === 'number'
      ? riskAssessment.total_risks
      : typeof riskAssessment.total === 'number'
        ? riskAssessment.total
        : null)

  const criticalRisks =
    riskAssessment &&
    (typeof riskAssessment.critical_risks === 'number'
      ? riskAssessment.critical_risks
      : typeof riskAssessment.critical === 'number'
        ? riskAssessment.critical
        : null)

  const bestLoadingPoint = minLoading?.fastest_loading_point || null
  const bestLoadingTime = minLoading?.fastest_loading_time || null

  const totalRakes = isLoaded && importedData?.rakes ? importedData.rakes.length : null

  const hasRealML = dataImported && hasPredictions

  return (
    <div className="p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Brain className="text-cyan-500" size={28} />
            Operations ML Decisions
          </h1>
          <p className="text-slate-600 mt-2 max-w-2xl">
            Combined view of delay, cost, risk and loading-time models to recommend the best operational moves
            for your network.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/operations-hub"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium"
          >
            <MapPin size={16} />
            Open Operations Hub
          </Link>
          <Link
            to="/data-import"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 text-sm font-medium"
          >
            <MapPin size={16} />
            Import / Refresh Data
          </Link>
        </div>
      </header>

      <InlineDataImport templateId="operations" />

      {!hasRealML && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 flex items-start gap-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5" size={18} />
          <div>
            <p className="font-semibold">Waiting for real ML predictions</p>
            <p className="mt-1">
              Import a dataset using the upload panel above (or in the Data Import Center) and run the analysis pipeline to see live ML-driven decisions here.
            </p>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">On-Time Delivery</p>
          <div className="flex items-end justify-between mt-3">
            <p className="text-2xl font-bold text-green-500">
              {typeof onTimeProbability === 'number' ? `${onTimeProbability.toFixed(1)}%` : '—'}
            </p>
            <span className="text-xs text-slate-500">from delay_prediction</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Estimated Cost / Shipment</p>
          <div className="flex items-end justify-between mt-3">
            <p className="text-2xl font-bold text-cyan-600">
              {typeof estimatedCost === 'number'
                ? `${estimatedCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                : '—'}
            </p>
            <span className="text-xs text-slate-500">from cost_prediction</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Network Risk</p>
          <div className="mt-3">
            <p className="text-lg font-semibold text-rose-500">
              {totalRisks != null ? `${totalRisks} risks` : '—'}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Critical: {criticalRisks != null ? criticalRisks : '—'} (from risk_assessment)
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Fastest Loading Option</p>
          <div className="mt-3 space-y-1">
            <p className="text-lg font-semibold text-slate-900">
              {bestLoadingPoint || '—'}
            </p>
            <p className="text-xs text-slate-600 flex items-center gap-1">
              <Clock size={14} className="text-slate-400" />
              {bestLoadingTime != null ? `${bestLoadingTime} hrs (minimum_loading_time)` : 'No ML result yet'}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Suggested Operational Move</h2>
          <p className="text-sm text-slate-600 mb-4">
            This is a narrative summary that combines multiple ML signals. You can customize the business logic
            later on the backend.
          </p>
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Based on current <span className="font-semibold">delay</span>, <span className="font-semibold">cost</span>{' '}
              and <span className="font-semibold">risk</span> predictions, the recommended strategy is to prioritize
              dispatches that keep on-time probability above <span className="font-semibold">95%</span> while staying
              within your target cost band.
            </p>
            {totalRakes != null && (
              <p>
                There are currently <span className="font-semibold">{totalRakes}</span> rakes in the network based on
                your imported dataset.
              </p>
            )}
            {bestLoadingPoint && (
              <p>
                For urgent orders, loading at <span className="font-semibold">{bestLoadingPoint}</span> offers the
                fastest turnaround according to the <code>minimum_loading_time</code> model.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Next Actions</h3>
          <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside">
            <li>Upload or refresh data using this page's upload panel or the Data Import Center.</li>
            <li>Verify predictions on Delay, Cost, Risk and Minimum Loading Time pages.</li>
            <li>Use Operations Hub to see the geographic impact of these decisions.</li>
          </ul>
        </div>
      </section>

      <InlineDecisionSummary
        context="operations"
        pageTitle="Operations ML Decisions"
      />
    </div>
  )
}
