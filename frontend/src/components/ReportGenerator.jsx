import React, { useState } from 'react'
import { Download, FileText } from 'lucide-react'

export default function ReportGenerator() {
  const [reportType, setReportType] = useState('executive')
  const [format, setFormat] = useState('pdf')

  const types = [
    { id: 'executive', label: 'Executive Summary', desc: 'Key metrics & insights' },
    { id: 'detailed', label: 'Detailed Analysis', desc: 'Full predictions & charts' },
    { id: 'scheduled', label: 'Scheduled Reports', desc: 'Auto email delivery' },
  ]

  const formats = [
    { id: 'pdf', label: 'PDF', icon: '📄' },
    { id: 'excel', label: 'Excel', icon: '📊' },
    { id: 'csv', label: 'CSV', icon: '📋' },
    { id: 'ppt', label: 'PowerPoint', icon: '🎯' },
  ]

  const handleGenerate = () => {
    alert(`Generating ${reportType} report in ${format.toUpperCase()} format...`)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Report Generation</h2>

      <div className="card space-y-4">
        <h3 className="font-bold text-slate-900">Report Type</h3>
        <div className="space-y-2">
          {types.map((t) => (
            <label key={t.id} className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-slate-50" style={{ borderColor: reportType === t.id ? '#3b82f6' : '#e2e8f0' }}>
              <input type="radio" name="type" value={t.id} checked={reportType === t.id} onChange={(e) => setReportType(e.target.value)} className="mr-3" />
              <div><p className="font-medium text-slate-900">{t.label}</p><p className="text-xs text-slate-500">{t.desc}</p></div>
            </label>
          ))}
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="font-bold text-slate-900">Export Format</h3>
        <div className="grid grid-cols-4 gap-3">
          {formats.map((f) => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={`p-4 rounded-lg border-2 transition-all text-center ${format === f.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
            >
              <span className="text-2xl">{f.icon}</span>
              <p className="text-sm font-medium text-slate-900 mt-2">{f.label}</p>
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleGenerate} className="w-full btn btn-primary">
        <Download size={18} className="inline mr-2" />
        Generate & Download Report
      </button>

      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="font-bold text-blue-900 mb-2">Report Preview</h3>
        <p className="text-sm text-blue-800">Your report will include:</p>
        <ul className="text-sm text-blue-800 mt-2 ml-4 list-disc">
          <li>Key performance metrics</li>
          <li>Prediction accuracy analysis</li>
          <li>Route optimization insights</li>
          <li>Risk assessment & recommendations</li>
          <li>Cost savings opportunities</li>
        </ul>
      </div>
    </div>
  )
}
