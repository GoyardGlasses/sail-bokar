import React from 'react'
import { Brain, TrendingUp, AlertTriangle } from 'lucide-react'
import { useMLPredictions } from '../../../context/MLPredictionsContext'
import { useImportedData } from '../../../hooks/useImportedData'

export default function DemandDecisionSupport() {
  const { data: importedData, isLoaded } = useImportedData()
  const { hasPredictions, getPrediction } = useMLPredictions()

  const orders = isLoaded && importedData && Array.isArray(importedData.orders) ? importedData.orders : []

  let totalImportedDemand = 0
  orders.forEach((o) => {
    const qty = Number(o.totalQuantity ?? o.quantity ?? o.qty ?? o.orderedQuantity ?? 0)
    if (Number.isFinite(qty) && qty > 0) {
      totalImportedDemand += qty
    }
  })

  let mlTotalForecast = null
  let mlPoints = 0

  if (hasPredictions && getPrediction) {
    const raw = getPrediction('demand_forecasting')
    const mlForecastRaw = Array.isArray(raw)
      ? raw
      : raw && Array.isArray(raw.predictions)
        ? raw.predictions
        : raw

    if (Array.isArray(mlForecastRaw)) {
      mlPoints = mlForecastRaw.length
      let sum = 0
      let hasAny = false
      mlForecastRaw.forEach((p) => {
        if (!p || typeof p !== 'object') return
        const val = Number(p.demand ?? p.quantity ?? p.forecast ?? p.value ?? 0)
        if (Number.isFinite(val) && val > 0) {
          sum += val
          hasAny = true
        }
      })
      if (hasAny) {
        mlTotalForecast = sum
      }
    }
  }

  let primaryDecision = ''
  const actions = []
  let whyBest = ''

  if (totalImportedDemand <= 0 && mlTotalForecast == null) {
    primaryDecision = 'Import demand and operations data, then run the demand forecast to see a recommended plan.'
    actions.push('Use the data import panel above to load recent orders and routes.')
    actions.push('Run the demand forecast so the system can compare expected demand vs current orders.')
  } else {
    const imported = totalImportedDemand
    const forecast = mlTotalForecast != null ? mlTotalForecast : imported

    const gap = imported > 0 && forecast != null ? (forecast - imported) / imported : 0

    if (gap > 0.1) {
      primaryDecision =
        'Treat the upcoming period as a demand surge: lock capacity for high-priority destinations and avoid over-committing to low-priority orders.'
      actions.push('Confirm capacity for the top destinations where forecasted demand is highest before accepting new low-priority orders.')
      actions.push('Synchronise with the rake plan so that additional rakes are reserved for surge destinations instead of spreading volume thinly.')
      whyBest =
        'The ML demand forecast is significantly above the demand visible in current orders, so protecting capacity for high-priority flows now reduces the risk of stockouts and SLA breaches when late orders arrive.'
    } else if (gap < -0.1) {
      primaryDecision =
        'Demand is softer than current orders suggest: tighten the plan around high-margin and SLA-critical orders and be conservative on speculative or low-priority demand.'
      actions.push('Recheck low-priority or low-margin orders and push some volume to later windows if capacity or cost is tight.')
      actions.push('Use available slack to clear ageing backlog or to support the most profitable destinations instead of chasing marginal tonnes.')
      whyBest =
        'The ML forecast is materially below the demand implied by the current order book, so focusing on quality of tonnes (margin and SLA) avoids running rakes under-utilised or on low-value movements.'
    } else {
      primaryDecision =
        'Forecast and current orders are broadly aligned: execute a balanced plan and focus on smoothing demand across periods and destinations.'
      actions.push('Use the planning view to spread deliveries so that no single period or destination is overloaded while keeping utilisation high.')
      actions.push('Align the demand plan closely with the daily rake plan so that each rake leaves as close to full as possible without creating backlogs.')
      whyBest =
        'When forecast and planned demand are in the same range, the biggest gains come from smoothing peaks, avoiding sudden spikes at individual destinations, and matching the demand profile to rake and truck capacity.'
    }
  }

  const importedK = totalImportedDemand > 0 ? (totalImportedDemand / 1000).toFixed(1) : null
  const forecastK = mlTotalForecast != null ? (mlTotalForecast / 1000).toFixed(1) : null

  return (
    <div className="card border border-blue-500 bg-slate-900 text-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-blue-400" />
          <h2 className="text-sm font-semibold text-white">AI Demand Decision (Forecast + Planning)</h2>
        </div>
      </div>

      {(importedK || forecastK) && (
        <div className="flex flex-wrap gap-2 mb-3 text-[11px] text-slate-100">
          {importedK && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-slate-200">
              <TrendingUp size={11} className="text-slate-500" />
              Current planned demand: {importedK}K T
            </span>
          )}
          {forecastK && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-slate-200">
              <AlertTriangle size={11} className="text-amber-500" />
              ML forecast: {forecastK}K T
            </span>
          )}
        </div>
      )}

      {primaryDecision && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-white mb-1">Primary decision for demand plan</p>
          <p className="text-xs text-slate-50">{primaryDecision}</p>
        </div>
      )}

      {actions.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-white mb-1">Key actions</p>
          <ul className="list-disc pl-4 text-xs text-slate-50 space-y-1.5">
            {actions.map((a, idx) => (
              <li key={idx}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {whyBest && (
        <div>
          <p className="text-xs font-semibold text-white mb-1">Why this is the best plan now</p>
          <p className="text-xs text-slate-100">{whyBest}</p>
        </div>
      )}
    </div>
  )
}
