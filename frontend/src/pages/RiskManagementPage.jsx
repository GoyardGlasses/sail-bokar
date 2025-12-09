import React, { useState, useMemo, useEffect } from 'react'
import { Search, Filter, BarChart3, LineChart as LineChartIcon, TrendingUp, AlertCircle } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'
import { useMLPredictions } from '../context/MLPredictionsContext'
import { useImportedData } from '../hooks/useImportedData'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'
import InlineDecisionSummary from '../features/decisionSupport/components/InlineDecisionSummary'

const generateRiskData = () => {
  const riskTypes = ['Supply Risk', 'Demand Risk', 'Quality Risk', 'Operational Risk', 'Market Risk']
  const data = []
  for (let i = 0; i < 50; i++) {
    data.push({
      id: `RISK-${String(i + 1000).slice(-4)}`,
      type: riskTypes[Math.floor(Math.random() * riskTypes.length)],
      probability: Math.floor(Math.random() * 100),
      impact: Math.floor(Math.random() * 100),
      status: ['Identified', 'Mitigating', 'Mitigated', 'Escalated'][Math.floor(Math.random() * 4)],
      mitigation: Math.floor(Math.random() * 100),
      dateIdentified: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
  }
  return data
}

export default function RiskManagementPage() {
  const { dataImported, getPrediction } = useMLPredictions()
  const { data: importedData, isLoaded } = useImportedData()
  const [mlRiskAssessment, setMlRiskAssessment] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [baseRiskData] = useState(generateRiskData())
  const [activeTab, setActiveTab] = useState('table')

  const hasImportedRisks =
    isLoaded &&
    importedData &&
    ((Array.isArray(importedData.risks) && importedData.risks.length > 0) ||
      (Array.isArray(importedData.riskEvents) && importedData.riskEvents.length > 0))

  const riskData = useMemo(() => {
    if (!hasImportedRisks) {
      return baseRiskData
    }

    const sourceArray = Array.isArray(importedData.risks)
      ? importedData.risks
      : importedData.riskEvents

    const mapped = sourceArray
      .map((r, index) => {
        if (!r) return null

        const id = r.id || r.riskId || r.code || `RISK-${String(index + 1000).slice(-4)}`
        const type =
          r.type ||
          r.category ||
          r.riskType ||
          r.domain ||
          'Operational Risk'

        const probability = Number(
          r.probability ??
            r.probability_percent ??
            r.likelihood ??
            r.likelihood_percent ??
            0
        )
        const impact = Number(
          r.impact ??
            r.impact_percent ??
            r.severity ??
            r.severity_percent ??
            0
        )

        const status =
          r.status ||
          r.state ||
          r.stage ||
          (r.mitigated ? 'Mitigated' : 'Identified')

        const mitigation = Number(
          r.mitigation ??
            r.mitigation_percent ??
            r.control_effectiveness ??
            r.reduction_percent ??
            0
        )

        const rawDate = r.dateIdentified || r.date || r.createdAt || r.timestamp
        let dateIdentified = new Date()
        if (rawDate && typeof rawDate === 'string') {
          const parsed = new Date(rawDate)
          if (!Number.isNaN(parsed.getTime())) {
            dateIdentified = parsed
          }
        }

        return {
          id,
          type,
          probability: Number.isFinite(probability) ? Math.max(0, Math.min(100, probability)) : 50,
          impact: Number.isFinite(impact) ? Math.max(0, Math.min(100, impact)) : 50,
          status,
          mitigation: Number.isFinite(mitigation) ? Math.max(0, Math.min(100, mitigation)) : 40,
          dateIdentified: dateIdentified.toISOString().split('T')[0],
        }
      })
      .filter(Boolean)

    return mapped.length ? mapped : baseRiskData
  }, [hasImportedRisks, importedData, baseRiskData])

  // Get ML prediction when data is imported
  useEffect(() => {
    if (dataImported) {
      const riskPred = getPrediction('risk_assessment')
      setMlRiskAssessment(riskPred)
    }
  }, [dataImported, getPrediction])

  const mlRiskRaw = Array.isArray(mlRiskAssessment)
    ? mlRiskAssessment
    : mlRiskAssessment && Array.isArray(mlRiskAssessment.predictions)
      ? mlRiskAssessment.predictions
      : mlRiskAssessment

  let mlTotalRisks = 0
  let mlCriticalRisks = 0
  let mlMitigatedRisks = 0
  let mlAvgMitigation = null

  if (Array.isArray(mlRiskRaw)) {
    mlTotalRisks = mlRiskRaw.length
    let sumMitigation = 0
    let countMitigation = 0

    mlRiskRaw.forEach((r) => {
      if (!r || typeof r !== 'object') return

      const score = Number(
        r.risk_score ??
          r.score ??
          r.value ??
          (r.probability && r.impact ? (r.probability * r.impact) / 100 : 0)
      )
      const severity = (r.severity || r.level || '').toString().toLowerCase()
      const status = (r.status || '').toString().toLowerCase()

      if (
        score > 60 ||
        severity === 'critical' ||
        severity === 'high'
      ) {
        mlCriticalRisks += 1
      }

      if (status === 'mitigated' || status === 'closed') {
        mlMitigatedRisks += 1
      }

      const mitigation = Number(
        r.mitigation ??
          r.mitigation_percent ??
          r.control_effectiveness ??
          r.reduction_percent ??
          0
      )
      if (Number.isFinite(mitigation) && mitigation > 0) {
        sumMitigation += mitigation
        countMitigation += 1
      }
    })

    if (countMitigation > 0) {
      mlAvgMitigation = sumMitigation / countMitigation
    }
  }

  const filteredData = useMemo(() => {
    return riskData.filter(item =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [riskData, searchTerm])

  const riskHeatmap = useMemo(() => {
    return riskData.map(r => ({
      ...r,
      riskScore: (r.probability * r.impact / 100).toFixed(0),
      severity: r.probability * r.impact > 5000 ? 'Critical' : r.probability * r.impact > 2500 ? 'High' : 'Medium'
    }))
  }, [riskData])

  const mitigationTracking = useMemo(() => {
    const grouped = {}
    riskData.forEach(r => {
      if (!grouped[r.status]) {
        grouped[r.status] = { status: r.status, count: 0, avgMitigation: 0 }
      }
      grouped[r.status].count++
      grouped[r.status].avgMitigation += r.mitigation
    })
    return Object.values(grouped).map(g => ({
      ...g,
      avgMitigation: (g.avgMitigation / g.count).toFixed(1)
    }))
  }, [riskData])

  const impactAnalysis = useMemo(() => {
    const types = {}
    riskData.forEach(r => {
      if (!types[r.type]) {
        types[r.type] = { type: r.type, count: 0, avgProbability: 0, avgImpact: 0 }
      }
      types[r.type].count++
      types[r.type].avgProbability += r.probability
      types[r.type].avgImpact += r.impact
    })
    return Object.values(types).map(t => ({
      ...t,
      avgProbability: (t.avgProbability / t.count).toFixed(1),
      avgImpact: (t.avgImpact / t.count).toFixed(1)
    }))
  }, [riskData])

  const stats = useMemo(() => {
    const totalBase = riskData.length

    if (!totalBase && !mlTotalRisks) {
      return { total: 0, critical: 0, mitigated: 0, avgMitigation: '0.0' }
    }

    const total = Math.max(totalBase, mlTotalRisks || 0)

    const criticalBase = riskData.filter((r) => r.probability * r.impact > 5000).length
    const mitigatedBase = riskData.filter((r) => r.status === 'Mitigated').length
    const avgMitigationBase =
      totalBase > 0
        ? riskData.reduce((sum, r) => sum + (Number(r.mitigation) || 0), 0) / totalBase
        : 0

    const critical = mlTotalRisks
      ? Math.max(criticalBase, mlCriticalRisks)
      : criticalBase

    const mitigated = mlTotalRisks
      ? Math.max(mitigatedBase, mlMitigatedRisks)
      : mitigatedBase

    const avgMitigationValue = mlAvgMitigation != null ? mlAvgMitigation : avgMitigationBase

    return {
      total,
      critical,
      mitigated,
      avgMitigation: avgMitigationValue.toFixed(1),
    }
  }, [riskData, mlTotalRisks, mlCriticalRisks, mlMitigatedRisks, mlAvgMitigation])

  const tabConfig = [
    { id: 'table', label: 'Risk Records', icon: BarChart3 },
    { id: 'heatmap', label: 'Risk Heatmap', icon: LineChartIcon },
    { id: 'mitigation', label: 'Mitigation Tracking', icon: TrendingUp },
    { id: 'impact', label: 'Impact Analysis', icon: AlertCircle },
  ]

  const activeTabLabel = tabConfig.find((t) => t.id === activeTab)?.label

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">⚠️ Risk Management</h1>
        <p className="text-slate-600">Identify and mitigate operational risks</p>
      </div>

      <InlineDataImport templateId="operations" />

      <div className="flex gap-2 border-b border-slate-300 mb-6 overflow-x-auto pb-2">
        {tabConfig.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Total Risks</p>
          <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Critical</p>
          <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Mitigated</p>
          <p className="text-3xl font-bold text-green-600">{stats.mitigated}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Avg Mitigation</p>
          <p className="text-3xl font-bold text-blue-600">{stats.avgMitigation}%</p>
        </div>
      </div>

      {activeTab === 'table' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search risks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
              <Filter size={20} />
              Filter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Risk ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Probability</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Impact</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Mitigation</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 15).map((item) => (
                  <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{item.id}</td>
                    <td className="py-3 px-4 text-slate-700">{item.type}</td>
                    <td className="py-3 px-4 text-slate-700">{item.probability}%</td>
                    <td className="py-3 px-4 text-slate-700">{item.impact}%</td>
                    <td className="py-3 px-4 text-slate-700">{item.mitigation}%</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Mitigated' ? 'bg-green-100 text-green-800' :
                        item.status === 'Escalated' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'heatmap' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">🔥 Risk Heatmap (Probability vs Impact)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="probability" name="Probability (%)" />
              <YAxis dataKey="impact" name="Impact (%)" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Risks" data={riskData} fill="#ef4444" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'mitigation' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Mitigation Tracking</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mitigationTracking}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Count" />
              <Bar dataKey="avgMitigation" fill="#10b981" name="Avg Mitigation (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'impact' && (
        <div className="space-y-4">
          {impactAnalysis.map((risk, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-600">Risk Type</p>
                  <p className="font-semibold text-slate-900">{risk.type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Count</p>
                  <p className="font-bold text-blue-600">{risk.count}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Avg Probability</p>
                  <p className="font-bold text-orange-600">{risk.avgProbability}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Avg Impact</p>
                  <p className="font-bold text-red-600">{risk.avgImpact}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <InlineDecisionSummary
        context="risk"
        pageTitle="Risk Management"
        activeView={activeTabLabel}
      />
    </div>
  )
}
