/**
 * BatchPredictions Component
 * Allows users to upload CSV and predict delays for multiple routes at once
 */

import React, { useState } from 'react'
import { Upload, Download, Trash2 } from 'lucide-react'

export default function BatchPredictions({ onBatchSubmit, isLoading }) {
  const [csvData, setCsvData] = useState([])
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setError('')

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const csv = event.target?.result
        const lines = csv.split('\n').filter((line) => line.trim())
        
        if (lines.length < 2) {
          setError('CSV must have header row and at least one data row')
          return
        }

        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
        const requiredHeaders = ['route', 'tonnes_dispatched', 'material_type', 'weather_condition']
        const hasAllHeaders = requiredHeaders.every((h) => headers.includes(h))

        if (!hasAllHeaders) {
          setError(`CSV must have columns: ${requiredHeaders.join(', ')}`)
          return
        }

        const data = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim())
          return {
            route: values[headers.indexOf('route')],
            tonnes_dispatched: parseFloat(values[headers.indexOf('tonnes_dispatched')]),
            material_type: values[headers.indexOf('material_type')],
            weather_condition: values[headers.indexOf('weather_condition')],
          }
        })

        setCsvData(data)
      } catch (err) {
        setError('Error parsing CSV: ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  const handleSubmit = () => {
    if (csvData.length === 0) {
      setError('Please upload a CSV file first')
      return
    }
    onBatchSubmit(csvData)
  }

  const downloadTemplate = () => {
    const template = `route,tonnes_dispatched,material_type,weather_condition
Bokaro->Kolkata,500,HR_Coils,Clear
Bokaro->Hatia,750,CR_Coils,Rainy
Bokaro->Dhanbad,600,Plates,Cloudy
Bokaro->Patna,450,Wire_Rods,Clear
Bokaro->Ranchi,800,TMT_Bars,Foggy`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'delay_prediction_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const clearData = () => {
    setCsvData([])
    setFileName('')
    setError('')
  }

  return (
    <div className="card space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Batch Predictions</h2>
        <p className="text-slate-600 text-sm mt-1">Upload CSV to predict delays for multiple routes</p>
      </div>

      {/* Download Template */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900 mb-3">
          Need a template? Download the CSV format example:
        </p>
        <button
          onClick={downloadTemplate}
          className="btn btn-outline text-blue-600 flex items-center gap-2"
          aria-label="Download CSV template"
        >
          <Download size={16} />
          Download Template
        </button>
      </div>

      {/* File Upload */}
      <div>
        <label htmlFor="csv-upload" className="block text-sm font-medium text-slate-900 mb-2">
          <Upload className="inline mr-2" size={16} />
          Upload CSV File
        </label>
        <input
          type="file"
          id="csv-upload"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isLoading}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          aria-label="Upload CSV file for batch predictions"
        />
        {fileName && (
          <p className="text-sm text-slate-600 mt-2">
            ✓ Loaded: <strong>{fileName}</strong> ({csvData.length} rows)
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-900">{error}</p>
        </div>
      )}

      {/* Data Preview */}
      {csvData.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3">Preview ({csvData.length} routes)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left text-slate-900">Route</th>
                  <th className="px-4 py-2 text-left text-slate-900">Tonnes</th>
                  <th className="px-4 py-2 text-left text-slate-900">Material</th>
                  <th className="px-4 py-2 text-left text-slate-900">Weather</th>
                </tr>
              </thead>
              <tbody>
                {csvData.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-900">{row.route}</td>
                    <td className="px-4 py-2 text-slate-600">{row.tonnes_dispatched}</td>
                    <td className="px-4 py-2 text-slate-600">{row.material_type}</td>
                    <td className="px-4 py-2 text-slate-600">{row.weather_condition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {csvData.length > 5 && (
              <p className="text-xs text-slate-500 mt-2">
                ... and {csvData.length - 5} more rows
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={isLoading || csvData.length === 0}
          className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Run batch predictions"
        >
          {isLoading ? 'Predicting...' : `Predict Delays (${csvData.length})`}
        </button>
        {csvData.length > 0 && (
          <button
            onClick={clearData}
            disabled={isLoading}
            className="btn btn-outline text-red-600 disabled:opacity-50 flex items-center gap-2"
            aria-label="Clear uploaded data"
          >
            <Trash2 size={16} />
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
