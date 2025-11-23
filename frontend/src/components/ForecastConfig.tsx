import React, { useState } from 'react'
import { Play } from 'lucide-react'

interface ForecastConfigProps {
  onRun: (config: any) => void
  isLoading: boolean
}

export default function ForecastConfig({ onRun, isLoading }: ForecastConfigProps) {
  const [config, setConfig] = useState({
    training_days: 60,
    horizon_days: 30,
    variables: ['demand', 'rake_availability'],
    material: 'plates',
    destination: 'all',
  })

  const trainingOptions = [
    { value: 30, label: '30 Days' },
    { value: 60, label: '60 Days' },
    { value: 90, label: '90 Days' },
    { value: 180, label: '180 Days' },
  ]

  const horizonOptions = [
    { value: 7, label: '7 Days' },
    { value: 14, label: '14 Days' },
    { value: 30, label: '30 Days' },
    { value: 90, label: '90 Days' },
  ]

  const variableOptions = [
    { value: 'demand', label: 'Demand' },
    { value: 'throughput', label: 'Throughput' },
    { value: 'rake_availability', label: 'Rake Availability' },
    { value: 'congestion', label: 'Congestion' },
  ]

  const handleVariableChange = (variable: string) => {
    setConfig((prev) => ({
      ...prev,
      variables: prev.variables.includes(variable)
        ? prev.variables.filter((v) => v !== variable)
        : [...prev.variables, variable],
    }))
  }

  const handleRun = () => {
    if (config.variables.length === 0) {
      alert('Please select at least one variable to forecast')
      return
    }
    onRun(config)
  }

  return (
    <div className="card space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Forecast Configuration</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Training Window */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Training Window
          </label>
          <select
            value={config.training_days}
            onChange={(e) => setConfig({ ...config, training_days: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {trainingOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">Historical data used for training</p>
        </div>

        {/* Forecast Horizon */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Forecast Horizon
          </label>
          <select
            value={config.horizon_days}
            onChange={(e) => setConfig({ ...config, horizon_days: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {horizonOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">Days to forecast into future</p>
        </div>

        {/* Material */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Material
          </label>
          <select
            value={config.material}
            onChange={(e) => setConfig({ ...config, material: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="plates">Plates</option>
            <option value="coils">Coils</option>
            <option value="sheets">Sheets</option>
            <option value="bars">Bars</option>
          </select>
        </div>

        {/* Destination */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Destination
          </label>
          <select
            value={config.destination}
            onChange={(e) => setConfig({ ...config, destination: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Destinations</option>
            <option value="kolkata">Kolkata</option>
            <option value="hatia">Hatia</option>
            <option value="dhanbad">Dhanbad</option>
            <option value="patna">Patna</option>
            <option value="ranchi">Ranchi</option>
          </select>
        </div>
      </div>

      {/* Variables Checkboxes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Variables to Forecast
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {variableOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.variables.includes(option.value)}
                onChange={() => handleVariableChange(option.value)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Run Button */}
      <button
        onClick={handleRun}
        disabled={isLoading}
        className="w-full btn btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Play size={20} className="inline mr-2" />
        {isLoading ? 'Running Forecast...' : 'Run Forecast'}
      </button>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Tip:</strong> Use longer training windows (90-180 days) for more accurate forecasts. Shorter horizons (7-14 days) are more reliable than longer ones.
        </p>
      </div>
    </div>
  )
}
