import React, { useState } from 'react'
import { Upload, FileJson, AlertCircle, Check, Copy, Play, Brain } from 'lucide-react'
import { useMLPredictions } from '../../../context/MLPredictionsContext'

const TEMPLATE_CONFIG = {
  delay: {
    title: 'Upload Delay Dataset',
    description: 'Upload routes and orders data to drive delay predictions, analytics and alerts.',
  },
  rake: {
    title: 'Upload Rake Planning Dataset',
    description: 'Upload stockyards, materials, orders, rakes, routes and loading points to run rake optimization.',
  },
  cost: {
    title: 'Upload Cost Analysis Dataset',
    description: 'Upload orders, routes and cost fields so the cost models can analyze your logistics spend.',
  },
  throughput: {
    title: 'Upload Throughput Dataset',
    description: 'Upload loading point and dispatch history to analyze throughput and minimum loading time.',
  },
  operations: {
    title: 'Upload Operations Dataset',
    description: 'Upload a full operational snapshot to power delay, cost, risk and loading-time decisions.',
  },
  default: {
    title: 'Upload Operations Dataset',
    description: 'Upload your logistics dataset to power ML predictions and optimizers on this page.',
  },
}

const DEFAULT_SAMPLE = {
  stockyards: [
    {
      id: 'sy-001',
      name: 'Bokaro Main',
      location: 'Bokaro',
      capacity: 100000,
      currentStock: 75000,
      materials: ['HR Coils', 'CR Coils', 'Plates'],
    },
    {
      id: 'sy-002',
      name: 'Bokaro Yard-2',
      location: 'Bokaro',
      capacity: 60000,
      currentStock: 42000,
      materials: ['Plates', 'Sheets'],
    },
    {
      id: 'sy-003',
      name: 'Haldia Port Stockyard',
      location: 'Haldia',
      capacity: 80000,
      currentStock: 30000,
      materials: ['HR Coils', 'Wire Rods'],
    },
  ],
  materials: [
    {
      id: 'm-001',
      name: 'HR Coils',
      grade: 'IS2062 E250',
      quantity: 28000,
      unit: 'tonnes',
      price: 48500,
      stockyard: 'Bokaro Main',
    },
    {
      id: 'm-002',
      name: 'CR Coils',
      grade: 'IS513 D',
      quantity: 16000,
      unit: 'tonnes',
      price: 52500,
      stockyard: 'Bokaro Main',
    },
    {
      id: 'm-003',
      name: 'Plates',
      grade: 'IS2062 E350',
      quantity: 22000,
      unit: 'tonnes',
      price: 50500,
      stockyard: 'Bokaro Yard-2',
    },
    {
      id: 'm-004',
      name: 'Sheets',
      grade: 'Commercial',
      quantity: 12000,
      unit: 'tonnes',
      price: 49500,
      stockyard: 'Bokaro Yard-2',
    },
    {
      id: 'm-005',
      name: 'Wire Rods',
      grade: 'WR08',
      quantity: 9000,
      unit: 'tonnes',
      price: 51500,
      stockyard: 'Haldia Port Stockyard',
    },
  ],
  orders: [
    {
      id: 'ord-001',
      product: 'HR Coils',
      quantity: 1800,
      destination: 'Tata Steel - Jamshedpur',
      priority: 'high',
      deadline: '2025-11-26',
      customer: 'Tata Steel',
      status: 'open',
      value: 1800 * 48500,
    },
    {
      id: 'ord-002',
      product: 'CR Coils',
      quantity: 1500,
      destination: 'JSW Steel - Dolvi',
      priority: 'medium',
      deadline: '2025-11-29',
      customer: 'JSW Steel',
      status: 'open',
      value: 1500 * 52500,
    },
    {
      id: 'ord-003',
      product: 'Plates',
      quantity: 2200,
      destination: 'SAIL Rourkela',
      priority: 'high',
      deadline: '2025-12-02',
      customer: 'SAIL Rourkela',
      status: 'open',
      value: 2200 * 50500,
    },
    {
      id: 'ord-004',
      product: 'Sheets',
      quantity: 1400,
      destination: 'Bhilai Fabricators Cluster',
      priority: 'low',
      deadline: '2025-12-05',
      customer: 'Fabricators Association',
      status: 'planned',
      value: 1400 * 49500,
    },
    {
      id: 'ord-005',
      product: 'Wire Rods',
      quantity: 900,
      destination: 'TMT Mill - Durgapur',
      priority: 'medium',
      deadline: '2025-11-30',
      customer: 'Durgapur Rolling Mills',
      status: 'open',
      value: 900 * 51500,
    },
    {
      id: 'ord-006',
      product: 'HR Coils',
      quantity: 2600,
      destination: 'Kolkata Auto Ancillary Hub',
      priority: 'high',
      deadline: '2025-12-08',
      customer: 'Kolkata Auto Vendors',
      status: 'open',
      value: 2600 * 48500,
    },
  ],
  rakes: [
    {
      id: 'rk-001',
      name: 'BOKARO-001',
      capacity: 3800,
      status: 'available',
      location: 'Bokaro Siding-1',
      wagons: 58,
      lastMaintenance: '2025-10-15',
    },
    {
      id: 'rk-002',
      name: 'BOKARO-002',
      capacity: 3600,
      status: 'available',
      location: 'Bokaro Siding-2',
      wagons: 56,
      lastMaintenance: '2025-09-28',
    },
    {
      id: 'rk-003',
      name: 'HALDIA-001',
      capacity: 4000,
      status: 'in_use',
      location: 'Haldia Port Yard',
      wagons: 60,
      lastMaintenance: '2025-08-30',
    },
  ],
  routes: [
    {
      id: 'rt-001',
      origin: 'Bokaro',
      destination: 'Tata Steel - Jamshedpur',
      distance: 320,
      railCost: 48000,
      roadCost: 72000,
      railTime: 48,
      roadTime: 24,
    },
    {
      id: 'rt-002',
      origin: 'Bokaro',
      destination: 'JSW Steel - Dolvi',
      distance: 1450,
      railCost: 235000,
      roadCost: 310000,
      railTime: 96,
      roadTime: 72,
    },
    {
      id: 'rt-003',
      origin: 'Bokaro',
      destination: 'Kolkata Auto Ancillary Hub',
      distance: 480,
      railCost: 72000,
      roadCost: 91000,
      railTime: 40,
      roadTime: 26,
    },
    {
      id: 'rt-004',
      origin: 'Haldia',
      destination: 'Durgapur Rolling Mills',
      distance: 260,
      railCost: 42000,
      roadCost: 58000,
      railTime: 30,
      roadTime: 18,
    },
  ],
  loadingPoints: [
    {
      id: 'lp-001',
      name: 'Bokaro Siding-1',
      capacity: 3800,
      material: 'HR Coils',
      throughput: 1150,
    },
    {
      id: 'lp-002',
      name: 'Bokaro Siding-2',
      capacity: 3600,
      material: 'Plates',
      throughput: 980,
    },
    {
      id: 'lp-003',
      name: 'Haldia Rail Yard',
      capacity: 4000,
      material: 'Wire Rods',
      throughput: 1040,
    },
  ],
  constraints: [
    {
      id: 'c-001',
      name: 'Minimum Rake Size',
      rule: 'Min 300 tonnes per rake; avoid dispatching underfilled rakes except for critical emergencies.',
      severity: 'critical',
    },
    {
      id: 'c-002',
      name: 'Priority Protection',
      rule: 'Always allocate at least 70% of capacity to HIGH priority orders before MEDIUM/LOW.',
      severity: 'high',
    },
    {
      id: 'c-003',
      name: 'Port Congestion Window',
      rule: 'Limit departures to Haldia between 18:00-22:00 to 2 rakes to avoid berth congestion.',
      severity: 'medium',
    },
  ],
}

function getSampleForTemplate(templateId) {
  if (templateId === 'delay') {
    return {
      ...DEFAULT_SAMPLE,
      routes: DEFAULT_SAMPLE.routes,
      orders: DEFAULT_SAMPLE.orders,
    }
  }
  if (templateId === 'rake') {
    return DEFAULT_SAMPLE
  }
  if (templateId === 'cost') {
    return {
      ...DEFAULT_SAMPLE,
      routes: DEFAULT_SAMPLE.routes.map((r) => ({
        ...r,
        railCost: r.railCost,
        roadCost: r.roadCost,
      })),
    }
  }
  if (templateId === 'throughput') {
    return {
      ...DEFAULT_SAMPLE,
      loadingPoints: DEFAULT_SAMPLE.loadingPoints,
    }
  }
  return DEFAULT_SAMPLE
}

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

function buildInlineRecommendations(templateId, getPrediction) {
  if (!getPrediction) return []

  const recs = []

  if (templateId === 'delay' || templateId === 'operations') {
    const delayPred = getPrediction('delay_prediction')
    const delayMinutes = extractNumericValue(delayPred)
    if (delayMinutes != null) {
      if (delayMinutes > 240) {
        recs.push(
          'Delays are very high for this dataset. Prioritise critical orders, reroute via faster corridors and pre-alert customers.',
        )
      } else if (delayMinutes > 120) {
        recs.push(
          'Delays are elevated. Consider re-sequencing rakes, using express options for high-priority customers, and tightening loading SLAs.',
        )
      } else {
        recs.push(
          'Delays are within a manageable range. Maintain current plan but monitor high-risk routes and loading points closely.',
        )
      }
    }
  }

  if (templateId === 'cost' || templateId === 'operations') {
    const costPred = getPrediction('cost_prediction')
    const costValue = extractNumericValue(costPred)
    if (costValue != null) {
      recs.push(
        'Cost models have refreshed for this dataset. Focus on high-cost lanes and evaluate rail-versus-road mix and consolidation opportunities.',
      )
    }
  }

  if (templateId === 'throughput' || templateId === 'operations') {
    const throughputPred = getPrediction('time_optimization') || getPrediction('throughput_prediction')
    const throughputScore = extractNumericValue(throughputPred)
    if (throughputScore != null) {
      recs.push(
        'Throughput analysis is updated. Use the loading-time and bottleneck views below to rebalance work between stockyards and sidings.',
      )
    }
  }

  const riskPred = getPrediction('risk_assessment')
  const riskPercent = toPercent(riskPred)
  if (riskPercent != null) {
    if (riskPercent > 70) {
      recs.push(
        'Overall operational risk is high. Trigger auto-alerts, review contingency routes and temporarily freeze non-critical movements.',
      )
    } else if (riskPercent > 40) {
      recs.push(
        'Operational risk is moderate. Protect high-value and time-sensitive orders first, and watch congestion and weather closely.',
      )
    } else {
      recs.push(
        'Risk levels are low. You can safely focus on cost and utilisation optimisation for this dataset.',
      )
    }
  }

  return recs
}

function parseCSV(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) {
    return {}
  }
  const headers = lines[0].split(',').map((h) => h.trim())
  const rows = lines
    .slice(1)
    .map((line) => {
      const values = line.split(',')
      const row = {}
      headers.forEach((h, i) => {
        row[h] = values[i] != null ? values[i].trim() : ''
      })
      return row
    })
  return { stockyards: rows }
}

export default function InlineDataImport({ templateId = 'default', title, description }) {
  const { fetchPredictions, hasPredictions, getPrediction } = useMLPredictions()
  const [uploadedFileName, setUploadedFileName] = useState(null)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [analysisStatus, setAnalysisStatus] = useState(null)
  const [copied, setCopied] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const config = TEMPLATE_CONFIG[templateId] || TEMPLATE_CONFIG.default
  const headerTitle = title || config.title
  const headerDescription = description || config.description
  const sampleDataTemplate = getSampleForTemplate(templateId)

  let inlineRecommendations = []
  try {
    if (hasPredictions && getPrediction) {
      inlineRecommendations = buildInlineRecommendations(templateId, getPrediction)
    }
  } catch (e) {
  }

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(sampleDataTemplate, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0]
    if (!file) {
      return
    }

    setUploadedFileName(file.name)
    setUploadStatus({ type: 'loading', message: 'Processing file...' })
    setAnalysisStatus(null)

    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const text = e.target.result
        const ext = file.name.split('.').pop().toLowerCase()
        let raw

        if (ext === 'json') {
          raw = JSON.parse(text)
        } else if (ext === 'csv' || ext === 'txt' || ext === 'xlsx' || ext === 'xls') {
          raw = parseCSV(text)
        } else {
          setUploadStatus({ type: 'error', message: 'Unsupported file format. Use JSON or CSV.' })
          return
        }

        const normalizedData = {
          stockyards: Array.isArray(raw.stockyards) ? raw.stockyards : [],
          materials: Array.isArray(raw.materials) ? raw.materials : [],
          orders: Array.isArray(raw.orders) ? raw.orders : [],
          rakes: Array.isArray(raw.rakes) ? raw.rakes : [],
          routes: Array.isArray(raw.routes) ? raw.routes : [],
          loadingPoints: Array.isArray(raw.loadingPoints) ? raw.loadingPoints : [],
          constraints: Array.isArray(raw.constraints) ? raw.constraints : [],
        }

        try {
          localStorage.setItem('imported_data', JSON.stringify(normalizedData))
        } catch (err) {
        }

        try {
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            const event = new CustomEvent('imported-data-updated', { detail: normalizedData })
            window.dispatchEvent(event)
          }
        } catch (err) {
        }

        try {
          const importResponse = await fetch('/api/data-import/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(normalizedData),
          })

          if (!importResponse.ok) {
            const errorText = await importResponse.text()
            throw new Error(errorText || 'Failed to import data into ML pipeline')
          }

          setUploadStatus({
            type: 'success',
            message: 'Data imported successfully. Running ML analysis for this dataset...',
          })
        } catch (err) {
          setUploadStatus({
            type: 'error',
            message: err.message || 'Backend import failed',
          })
          return
        }

        setAnalyzing(true)
        setAnalysisStatus({ type: 'loading', message: 'Running ML analysis on backend...' })

        try {
          const analysisResponse = await fetch('/api/data-import/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })

          if (!analysisResponse.ok) {
            const errorText = await analysisResponse.text()
            throw new Error(errorText || 'Failed to run ML analysis')
          }

          setAnalysisStatus({
            type: 'success',
            message: 'ML analysis complete. Updating predictions for this page...',
          })

          try {
            await fetchPredictions()
          } catch (err) {
          }
        } catch (err) {
          setAnalysisStatus({
            type: 'error',
            message: err.message || 'ML analysis failed',
          })
        } finally {
          setAnalyzing(false)
        }
      } catch (err) {
        setUploadStatus({ type: 'error', message: err.message || 'Failed to process file' })
      }
    }

    reader.onerror = () => {
      setUploadStatus({ type: 'error', message: 'Error reading file' })
    }

    reader.readAsText(file)
  }

  return (
    <div className="card mb-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-cyan-500" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{headerTitle}</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{headerDescription}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            id={`inline-import-input-${templateId}`}
            type="file"
            accept=".json,.csv,.txt,.xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor={`inline-import-input-${templateId}`}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-cyan-600 text-white hover:bg-cyan-500 cursor-pointer"
          >
            <Upload size={14} />
            <span>Choose File</span>
          </label>
          <button
            type="button"
            onClick={handleCopyTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Template JSON'}</span>
          </button>
        </div>
      </div>

      {uploadedFileName && (
        <p className="mt-2 text-xs text-slate-500">Selected file: {uploadedFileName}</p>
      )}

      <div className="mt-3 space-y-2">
        {uploadStatus && (
          <div
            className={`flex items-start gap-2 rounded-md px-3 py-2 text-xs ${
              uploadStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : uploadStatus.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            {uploadStatus.type === 'error' ? (
              <AlertCircle size={14} className="mt-0.5" />
            ) : uploadStatus.type === 'success' ? (
              <Check size={14} className="mt-0.5" />
            ) : (
              <Play size={14} className="mt-0.5" />
            )}
            <span className="whitespace-pre-line">{uploadStatus.message}</span>
          </div>
        )}

        {analysisStatus && (
          <div
            className={`flex items-start gap-2 rounded-md px-3 py-2 text-xs ${
              analysisStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : analysisStatus.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            {analysisStatus.type === 'error' ? (
              <AlertCircle size={14} className="mt-0.5" />
            ) : analysisStatus.type === 'success' ? (
              <Check size={14} className="mt-0.5" />
            ) : (
              <Play size={14} className={analyzing ? 'mt-0.5 animate-spin' : 'mt-0.5'} />
            )}
            <span className="whitespace-pre-line">{analysisStatus.message}</span>
          </div>
        )}
      </div>

      {hasPredictions && (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 dark:bg-slate-900 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Brain size={14} className="text-purple-500" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              Recommended next actions
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            Based on the current ML outputs for this dataset:
          </p>
          <ul className="mt-1 text-[11px] text-slate-700 dark:text-slate-200 list-disc pl-4 space-y-1.5">
            {inlineRecommendations && inlineRecommendations.length > 0 ? (
              inlineRecommendations.map((rec, idx) => <li key={idx}>{rec}</li>)
            ) : (
              <li>
                Scroll down to review the updated KPIs and dashboards on this page, then act on the
                highest-risk routes, customers and bottlenecks.
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="mt-3 bg-slate-50 dark:bg-slate-900 rounded-md p-3">
        <div className="flex items-center gap-2 mb-2">
          <FileJson size={14} className="text-slate-500" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Sample data shape</span>
        </div>
        <pre className="max-h-40 overflow-auto text-[10px] leading-tight text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-950 rounded p-2">
          {JSON.stringify(sampleDataTemplate, null, 2)}
        </pre>
      </div>
    </div>
  )
}
