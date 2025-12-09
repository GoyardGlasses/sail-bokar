import React from 'react'
import { Brain, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react'
import { useMLPredictions } from '../../../context/MLPredictionsContext'
import { useImportedData } from '../../../hooks/useImportedData'

function extractNumericValue(raw) {
  if (raw == null) return null
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : null
  }
  if (typeof raw === 'string') {
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  }
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const n = extractNumericValue(item)
      if (n != null) return n
    }
    return null
  }
  if (typeof raw === 'object') {
    for (const value of Object.values(raw)) {
      const n = extractNumericValue(value)
      if (n != null) return n
    }
  }
  return null
}

function toPercent(raw) {
  if (raw == null) return null
  const n = extractNumericValue(raw)
  if (n == null) return null
  return n <= 1 ? n * 100 : n
}

export default function InlineDecisionSummary({ context = 'operations', pageTitle, activeView }) {
  const { hasPredictions, getPrediction } = useMLPredictions()
  const { data: importedData, isLoaded } = useImportedData()

  const safeGetPrediction = hasPredictions && getPrediction ? getPrediction : () => null

  const orders = isLoaded && importedData && Array.isArray(importedData.orders) ? importedData.orders : []
  const routes = isLoaded && importedData && Array.isArray(importedData.routes) ? importedData.routes : []
  const rakes = isLoaded && importedData && Array.isArray(importedData.rakes) ? importedData.rakes : []

  let totalTonnage = 0
  if (routes.length > 0) {
    routes.forEach((r) => {
      const qty = Number(r.tonnage ?? r.quantity ?? r.totalQuantity ?? 0)
      if (Number.isFinite(qty) && qty > 0) {
        totalTonnage += qty
      }
    })
  } else if (orders.length > 0) {
    orders.forEach((o) => {
      const qty = Number(o.totalQuantity ?? o.quantity ?? 0)
      if (Number.isFinite(qty) && qty > 0) {
        totalTonnage += qty
      }
    })
  }

  const delayPred = safeGetPrediction('delay_prediction')
  const costPred = safeGetPrediction('cost_prediction')
  const riskPred = safeGetPrediction('risk_assessment')
  const scenarioPred = safeGetPrediction('scenario_analysis') || safeGetPrediction('decision_support')
  const throughputPred = safeGetPrediction('time_optimization') || safeGetPrediction('throughput_prediction')

  const delayMinutes = extractNumericValue(delayPred)
  const riskPercent = toPercent(riskPred)
  const costValue = extractNumericValue(costPred)
  const throughputScore = extractNumericValue(throughputPred)

  let primaryDecision = ''
  const bullets = []

  if (delayMinutes != null) {
    if (delayMinutes > 240) {
      primaryDecision =
        'Immediately reprioritise and reroute: treat this dataset as a high-delay day and protect SLAs for critical orders.'
      bullets.push(
        'Move highest-priority and export orders to the fastest available rakes/routes, even if cost increases slightly.',
      )
      bullets.push('Defer or consolidate low-priority orders to the next planning window to free up capacity.')
    } else if (delayMinutes > 120) {
      primaryDecision =
        'Treat today as a medium-risk delay day and tighten loading and dispatch discipline on the top routes.'
      bullets.push('Lock a firm loading plan for the next 12–24 hours and avoid ad-hoc changes that increase dwell time.')
    } else {
      primaryDecision = 'Delays are under control; focus primarily on cost and utilisation optimisation today.'
      bullets.push('Keep current rake plan, but monitor congestion and weather for any sudden spikes in risk.')
    }
  }

  if (costValue != null) {
    bullets.push(
      'Review the top 3 highest-cost lanes in this dataset and check if mode mix (rail vs road) and consolidation can be improved.',
    )
  }

  if (throughputScore != null) {
    bullets.push(
      'Use the loading-time and throughput views below to shift volume away from bottleneck loading points into underutilised ones.',
    )
  }

  if (riskPercent != null) {
    if (riskPercent > 70) {
      bullets.push(
        'Overall operational risk is high. Activate contingency plans and communicate early with customers about possible slippages.',
      )
    } else if (riskPercent > 40) {
      bullets.push(
        'Risk is moderate. Protect high-value and time-sensitive orders first, and be ready with backup rakes and routes.',
      )
    } else {
      bullets.push('Risk is low. Safely use spare capacity to clear ageing or low-priority orders from the backlog.')
    }
  }

  if (!primaryDecision) {
    if (context === 'delay') {
      primaryDecision =
        'Prioritise high-priority and time-sensitive orders while using the delay outputs to avoid the riskiest routes and loading points.'
    } else if (context === 'cost') {
      primaryDecision =
        'Minimise cost per tonne by routing volume through the most efficient lanes while respecting service levels and capacity.'
    } else if (context === 'risk') {
      primaryDecision =
        'Reduce overall risk by focusing first on the highest severity risks and ensuring strong mitigation plans are in place.'
    } else if (context === 'rake') {
      primaryDecision =
        'Adopt the rake and wagon plan that delivers today’s tonnage with the highest utilisation and lowest demurrage.'
    } else {
      primaryDecision =
        'Execute the plan that best balances on-time performance, cost, and risk for the current dataset.'
    }
  }

  if (bullets.length === 0) {
    if (context === 'delay') {
      bullets.push('Lock a clear loading and dispatch plan for the next 24 hours and minimise last-minute changes.')
      bullets.push('Protect export and SLA-critical orders first, then fill remaining capacity with lower-priority movements.')
    } else if (context === 'cost') {
      bullets.push('Identify the top 3 highest-cost lanes and review mode mix, consolidation, and backhaul opportunities.')
      bullets.push('Use the optimisation outputs to renegotiate or redesign the most expensive flows.')
    } else if (context === 'risk') {
      bullets.push('Create or update mitigation actions for all critical and high risks, assigning clear owners and deadlines.')
      bullets.push('Monitor medium risks but avoid over-spending effort on low-impact items.')
    } else if (context === 'rake') {
      bullets.push('Use the suggested rake formations as the default plan and avoid underfilled or unnecessary extra rakes.')
      bullets.push('If additional orders arrive, add them only if they maintain utilisation and do not violate constraints.')
    } else {
      bullets.push('Review the updated KPIs and apply this plan as today’s operational baseline, adjusting only if constraints change.')
    }
  }

  const totalOrders = orders.length || routes.length || 0
  const totalRakes = rakes.length

  return (
    <div className="mt-8 card">
      <div className="flex items-center gap-2 mb-2">
        <Brain size={18} className="text-purple-600" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          {pageTitle ? `Overall conclusion – ${pageTitle}` : 'AI decision summary'}
        </h3>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
        Based on the data currently loaded in the UI and the ML outputs for this page
        {activeView ? ` in the "${activeView}" view` : ''}, here is the recommended overall conclusion.
      </p>

      {(totalOrders > 0 || totalRakes > 0 || totalTonnage > 0) && (
        <div className="flex flex-wrap gap-3 mb-3 text-[11px] text-slate-600 dark:text-slate-300">
          {totalOrders > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
              <CheckCircle2 size={12} className="text-emerald-500" />
              {totalOrders.toLocaleString()} orders in scope
            </span>
          )}
          {totalRakes > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
              <TrendingUp size={12} className="text-cyan-500" />
              {totalRakes.toLocaleString()} rakes available
            </span>
          )}
          {totalTonnage > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
              <AlertTriangle size={12} className="text-amber-500" />
              {totalTonnage.toLocaleString()}T to be moved
            </span>
          )}
        </div>
      )}

      {primaryDecision && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1">Primary decision for this plan</p>
          <p className="text-xs text-slate-700 dark:text-slate-200">{primaryDecision}</p>
        </div>
      )}

      {bullets.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1">Key actions</p>
          <ul className="text-xs text-slate-700 dark:text-slate-200 list-disc pl-4 space-y-1.5">
            {bullets.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
