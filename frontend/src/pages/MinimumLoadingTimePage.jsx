import React, { useEffect, useState } from 'react'
import { Clock, MapPin, AlertCircle, TrendingUp } from 'lucide-react'
import { useMLPredictions } from '../context/MLPredictionsContext'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'

export default function MinimumLoadingTimePage() {
  const { dataImported, getPrediction } = useMLPredictions()
  const [mlMinLoadingTime, setMlMinLoadingTime] = useState(null)

  useEffect(() => {
    if (dataImported) {
      const pred = getPrediction('minimum_loading_time')
      setMlMinLoadingTime(pred)
    } else {
      setMlMinLoadingTime(null)
    }
  }, [dataImported, getPrediction])

  const hasData = mlMinLoadingTime && mlMinLoadingTime.status !== 'no_data'

  const referenceTonnage = mlMinLoadingTime?.reference_rake_tonnage
  const fastestPoint = mlMinLoadingTime?.fastest_loading_point
  const fastestTime = mlMinLoadingTime?.fastest_time_hours
  const loadingPoints = Array.isArray(mlMinLoadingTime?.loading_points)
    ? mlMinLoadingTime.loading_points
    : []

  return (
    <div className="p-8 space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Clock size={32} className="text-emerald-600" />
          <h1 className="text-3xl font-bold text-slate-900">Minimum Loading Time (AI)</h1>
        </div>
        <p className="text-slate-600">
          Identify the fastest loading point and compare minimum loading times across all loading points based on the throughput model.
        </p>
      </div>

      <InlineDataImport templateId="throughput" />

      {!dataImported && (
        <div className="card p-4 bg-amber-50 border-l-4 border-amber-500">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">No imported data detected</p>
              <p className="text-xs text-amber-800 mt-1">
                Use the upload panel above (or the Data Import Center) to upload your latest dataset, then run ML Analysis to generate minimum loading time insights.
              </p>
            </div>
          </div>
        </div>
      )}

      {dataImported && !hasData && (
        <div className="card p-4 bg-red-50 border-l-4 border-red-500">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">Minimum loading time not available</p>
              <p className="text-xs text-red-800 mt-1">
                The minimum loading time model could not run. Check that rake capacities and loading points are present in the imported data, then re-run ML Analysis.
              </p>
            </div>
          </div>
        </div>
      )}

      {hasData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-6">
              <div className="flex items-start gap-3">
                <Clock size={24} className="text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-600">Fastest Loading Time</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {(() => {
                      const v = Number(fastestTime ?? 0)
                      return v > 0 ? `${v.toFixed(1)} h` : '—'
                    })()}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {fastestPoint ? `At ${fastestPoint}` : 'Best loading point identified by the model'}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-start gap-3">
                <MapPin size={24} className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-600">Reference Rake Size</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {(() => {
                      const v = Number(referenceTonnage ?? 0)
                      return v > 0 ? v.toFixed(0) : '—'
                    })()}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Tonnes per rake used for computing minimum loading time
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-start gap-3">
                <TrendingUp size={24} className="text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-600">Number of Loading Points</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {loadingPoints.length}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Evaluated by the throughput model
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Loading Point Comparison</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-4">Loading Point</th>
                    <th className="py-2 pr-4">Predicted Throughput (tph)</th>
                    <th className="py-2 pr-4">Minimum Loading Time (h)</th>
                    <th className="py-2 pr-4">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPoints.map((lp) => {
                    const isBest = lp.loading_point === fastestPoint
                    const confidence = Number(lp.confidence ?? 0)
                    const pct = confidence <= 1 ? confidence * 100 : confidence
                    return (
                      <tr
                        key={lp.loading_point}
                        className={`border-b border-slate-100 ${
                          isBest ? 'bg-emerald-50' : ''
                        }`}
                      >
                        <td className="py-2 pr-4 font-medium text-slate-900">
                          {lp.loading_point}
                          {isBest && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600 text-white">
                              Fastest
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-4 text-slate-700">
                          {Number(lp.predicted_throughput_tph ?? 0).toFixed(1)}
                        </td>
                        <td className="py-2 pr-4 text-slate-700">
                          {Number(lp.min_loading_time_hours ?? 0).toFixed(2)}
                        </td>
                        <td className="py-2 pr-4 text-slate-700">
                          {pct > 0 ? `${pct.toFixed(0)}%` : 'N/A'}
                        </td>
                      </tr>
                    )
                  })}
                  {loadingPoints.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-500">
                        No loading point records were returned by the model.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
