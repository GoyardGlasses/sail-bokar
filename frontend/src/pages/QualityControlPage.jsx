import React, { useState, useMemo, useEffect } from 'react'
import { Search, Filter, BarChart3, LineChart as LineChartIcon, TrendingUp, AlertCircle } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useMLPredictions } from '../context/MLPredictionsContext'
import { useImportedData } from '../hooks/useImportedData'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'

// Generate mock quality data
const generateQualityData = () => {
  const materials = ['CR Coils', 'HR Coils', 'Plates', 'Sheets']
  const materialSpecs = {
    'CR Coils': { thickness: '0.5-3.0mm', width: '600-1500mm', length: 'coil' },
    'HR Coils': { thickness: '1.2-12.7mm', width: '600-1500mm', length: 'coil' },
    'Plates': { thickness: '3-100mm', width: '1000-2000mm', length: '2000-6000mm' },
    'Sheets': { thickness: '0.4-2.0mm', width: '800-1500mm', length: '2000-4000mm' }
  }
  const suppliers = ['Supplier A', 'Supplier B', 'Supplier C', 'Supplier D', 'Supplier E']
  
  const data = []
  for (let i = 0; i < 100; i++) {
    data.push({
      id: `QC-${String(i + 1000).slice(-4)}`,
      material: materials[Math.floor(Math.random() * materials.length)],
      supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
      batchSize: Math.floor(Math.random() * 500) + 100,
      defectRate: (Math.random() * 5).toFixed(2),
      qualityScore: Math.floor(Math.random() * 40) + 60,
      testDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: Math.random() > 0.1 ? 'Pass' : 'Fail',
      issues: Math.floor(Math.random() * 10),
    })
  }
  return data
}

export default function QualityControlPage() {
  const { dataImported, getPrediction } = useMLPredictions()
  const { data: importedData, isLoaded } = useImportedData()
  const [mlQualityPrediction, setMlQualityPrediction] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [baseQualityData] = useState(generateQualityData())
  const [activeTab, setActiveTab] = useState('table')

  const hasImportedMaterials =
    isLoaded && importedData && Array.isArray(importedData.materials) && importedData.materials.length > 0

  const hasImportedOrders =
    isLoaded && importedData && Array.isArray(importedData.orders) && importedData.orders.length > 0

  const qualityData = useMemo(() => {
    if (!hasImportedMaterials && !hasImportedOrders) {
      return baseQualityData
    }

    const records = []

    if (hasImportedMaterials) {
      importedData.materials.forEach((m, index) => {
        if (!m) return

        const id = m.id || m.batchId || m.recordId || `QC-${String(index + 1000).slice(-4)}`
        const material =
          m.materialName ||
          m.material ||
          m.grade ||
          m.item ||
          'Material'
        const supplier =
          m.supplierName ||
          m.vendor ||
          m.supplier ||
          'Supplier'

        const batchRaw = Number(
          m.batchSize ??
            m.quantity ??
            m.availableQty ??
            m.stock ??
            0
        )
        const batchSize =
          Number.isFinite(batchRaw) && batchRaw > 0
            ? batchRaw
            : 100 + (index % 10) * 25

        const defectRaw = Number(
          m.defectRate ??
            m.defect_rate ??
            m.defect_percent ??
            m.defects ??
            0
        )
        const defectRate =
          Number.isFinite(defectRaw) && defectRaw > 0
            ? Math.min(15, defectRaw)
            : Number(((index % 5) * 0.5 + 0.5).toFixed(2))

        const qualityRaw = Number(
          m.qualityScore ??
            m.quality ??
            m.score ??
            0
        )
        const qualityScore =
          Number.isFinite(qualityRaw) && qualityRaw > 0
            ? Math.max(50, Math.min(100, qualityRaw))
            : 80 + (index % 10)

        const issuesRaw = Number(m.issues ?? m.defectsCount ?? 0)
        const issues =
          Number.isFinite(issuesRaw) && issuesRaw >= 0
            ? issuesRaw
            : Math.max(0, Math.round((defectRate / 100) * batchSize * 0.1))

        const rawDate = m.testDate || m.date || m.createdAt || m.timestamp
        let testDate = new Date()
        if (rawDate && typeof rawDate === 'string') {
          const parsed = new Date(rawDate)
          if (!Number.isNaN(parsed.getTime())) {
            testDate = parsed
          }
        }

        const status =
          qualityScore >= 80 && defectRate < 3
            ? 'Pass'
            : 'Fail'

        records.push({
          id,
          material,
          supplier,
          batchSize,
          defectRate: Number(defectRate).toFixed(2),
          qualityScore,
          testDate: testDate.toISOString().split('T')[0],
          status,
          issues,
        })
      })
    } else if (hasImportedOrders) {
      importedData.orders.forEach((o, index) => {
        if (!o) return

        const id = o.id || o.orderId || o.reference || `QC-${String(index + 1200).slice(-4)}`
        const material =
          o.material ||
          o.materialName ||
          o.grade ||
          'Material'
        const supplier =
          o.supplierName ||
          o.vendor ||
          o.customer ||
          'Supplier'

        const batchRaw = Number(
          o.totalQuantity ??
            o.quantity ??
            o.qty ??
            0
        )
        const batchSize =
          Number.isFinite(batchRaw) && batchRaw > 0
            ? batchRaw
            : 150 + (index % 8) * 30

        const defectRate = Number(((index % 7) * 0.4 + 0.6).toFixed(2))
        const qualityScore = 78 + (index % 15)
        const issues = Math.max(0, Math.round((defectRate / 100) * batchSize * 0.05))

        const rawDate = o.testDate || o.shipmentDate || o.orderDate || o.date
        let testDate = new Date()
        if (rawDate && typeof rawDate === 'string') {
          const parsed = new Date(rawDate)
          if (!Number.isNaN(parsed.getTime())) {
            testDate = parsed
          }
        }

        const status =
          qualityScore >= 80 && defectRate < 3
            ? 'Pass'
            : 'Fail'

        records.push({
          id,
          material,
          supplier,
          batchSize,
          defectRate: Number(defectRate).toFixed(2),
          qualityScore,
          testDate: testDate.toISOString().split('T')[0],
          status,
          issues,
        })
      })
    }

    return records.length ? records : baseQualityData
  }, [hasImportedMaterials, hasImportedOrders, importedData, baseQualityData])

  // Get ML prediction when data is imported
  useEffect(() => {
    if (dataImported) {
      const qualityPred = getPrediction('quality_prediction')
      setMlQualityPrediction(qualityPred)
    }
  }, [dataImported, getPrediction])

  const mlQualityRaw = Array.isArray(mlQualityPrediction)
    ? mlQualityPrediction
    : mlQualityPrediction && Array.isArray(mlQualityPrediction.predictions)
      ? mlQualityPrediction.predictions
      : mlQualityPrediction

  let mlSampleCount = 0
  let mlAvgDefect = null
  let mlAvgQuality = null
  let mlPassRate = null

  if (Array.isArray(mlQualityRaw)) {
    mlSampleCount = mlQualityRaw.length
    let sumDefect = 0
    let sumQuality = 0
    let sumPassProb = 0
    let countDefect = 0
    let countQuality = 0
    let countPassProb = 0

    mlQualityRaw.forEach((q) => {
      if (!q || typeof q !== 'object') return

      const defect = Number(
        q.defect_rate ??
          q.defectRate ??
          q.defects_percent ??
          q.defects ??
          0
      )
      if (Number.isFinite(defect) && defect >= 0) {
        sumDefect += defect
        countDefect += 1
      }

      const quality = Number(
        q.quality_score ??
          q.quality ??
          q.score ??
          q.value ??
          0
      )
      if (Number.isFinite(quality) && quality > 0) {
        sumQuality += quality
        countQuality += 1
      }

      const passProb = Number(
        q.pass_probability ??
          q.passRate ??
          q.pass_rate ??
          0
      )
      if (Number.isFinite(passProb) && passProb > 0) {
        sumPassProb += passProb
        countPassProb += 1
      }
    })

    if (countDefect > 0) {
      mlAvgDefect = sumDefect / countDefect
    }
    if (countQuality > 0) {
      mlAvgQuality = sumQuality / countQuality
    }
    if (countPassProb > 0) {
      mlPassRate = sumPassProb / countPassProb
    }
  }

  // Filter data
  const filteredData = useMemo(() => {
    return qualityData.filter(item =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [qualityData, searchTerm])

  // Defect rate trends
  const defectTrends = useMemo(() => {
    const grouped = {}
    qualityData.forEach(item => {
      const date = item.testDate.substring(0, 7)
      if (!grouped[date]) {
        grouped[date] = { date, avgDefect: 0, count: 0, passed: 0 }
      }
      grouped[date].count++
      grouped[date].avgDefect += parseFloat(item.defectRate)
      if (item.status === 'Pass') grouped[date].passed++
    })
    return Object.values(grouped).map(d => ({
      ...d,
      avgDefect: (d.avgDefect / d.count).toFixed(2),
      passRate: ((d.passed / d.count) * 100).toFixed(1)
    })).sort((a, b) => a.date.localeCompare(b.date))
  }, [qualityData])

  // Quality by supplier
  const supplierQuality = useMemo(() => {
    const suppliers = {}
    qualityData.forEach(item => {
      if (!suppliers[item.supplier]) {
        suppliers[item.supplier] = { supplier: item.supplier, count: 0, avgQuality: 0, passed: 0, failed: 0 }
      }
      suppliers[item.supplier].count++
      suppliers[item.supplier].avgQuality += item.qualityScore
      if (item.status === 'Pass') suppliers[item.supplier].passed++
      else suppliers[item.supplier].failed++
    })
    return Object.values(suppliers).map(s => ({
      ...s,
      avgQuality: (s.avgQuality / s.count).toFixed(1),
      passRate: ((s.passed / s.count) * 100).toFixed(1)
    }))
  }, [qualityData])

  // Compliance status
  const complianceData = useMemo(() => {
    const passed = qualityData.filter(d => d.status === 'Pass').length
    const failed = qualityData.filter(d => d.status === 'Fail').length
    return [
      { name: 'Passed', value: passed },
      { name: 'Failed', value: failed }
    ]
  }, [qualityData])

  const stats = useMemo(() => {
    const totalBase = qualityData.length

    if (!totalBase && !mlSampleCount) {
      return { total: 0, passed: 0, avgDefect: '0.00', avgQuality: '0.0' }
    }

    const total = mlSampleCount > 0 ? Math.max(totalBase, mlSampleCount) : totalBase

    const passedBase = qualityData.filter((d) => d.status === 'Pass').length
    const avgDefectBase =
      totalBase > 0
        ? qualityData.reduce((sum, d) => sum + parseFloat(d.defectRate), 0) / totalBase
        : 0
    const avgQualityBase =
      totalBase > 0
        ? qualityData.reduce((sum, d) => sum + d.qualityScore, 0) / totalBase
        : 0

    const avgDefect =
      mlAvgDefect != null
        ? mlAvgDefect.toFixed(2)
        : avgDefectBase.toFixed(2)

    const avgQuality =
      mlAvgQuality != null
        ? mlAvgQuality.toFixed(1)
        : avgQualityBase.toFixed(1)

    const passed =
      mlPassRate != null
        ? Math.max(passedBase, Math.round((mlPassRate / 100) * total))
        : passedBase

    return { total, passed, avgDefect, avgQuality }
  }, [qualityData, mlSampleCount, mlAvgDefect, mlAvgQuality, mlPassRate])

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">🔍 Quality Control</h1>
        <p className="text-slate-600">Monitor and analyze product quality metrics</p>
      </div>

      <InlineDataImport templateId="operations" />

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-300 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'table', label: 'Quality Records', icon: BarChart3 },
          { id: 'trends', label: 'Defect Trends', icon: LineChartIcon },
          { id: 'supplier', label: 'Supplier Quality', icon: TrendingUp },
          { id: 'compliance', label: 'Compliance Status', icon: AlertCircle },
        ].map(tab => {
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Total Tests</p>
          <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Passed</p>
          <p className="text-3xl font-bold text-green-600">{stats.passed}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Avg Defect Rate</p>
          <p className="text-3xl font-bold text-orange-600">{stats.avgDefect}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Avg Quality Score</p>
          <p className="text-3xl font-bold text-blue-600">{stats.avgQuality}%</p>
        </div>
      </div>

      {/* TAB 1: QUALITY RECORDS TABLE */}
      {activeTab === 'table' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search quality records..."
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
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">QC ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Material</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Supplier</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Batch Size</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Defect Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Quality Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 15).map((item) => (
                  <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{item.id}</td>
                    <td className="py-3 px-4 text-slate-700">{item.material}</td>
                    <td className="py-3 px-4 text-slate-700">{item.supplier}</td>
                    <td className="py-3 px-4 text-slate-700">{item.batchSize}</td>
                    <td className="py-3 px-4 text-slate-700">{item.defectRate}%</td>
                    <td className="py-3 px-4 text-slate-700">{item.qualityScore}%</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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

      {/* TAB 2: DEFECT TRENDS */}
      {activeTab === 'trends' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">📈 Defect Rate Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={defectTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgDefect" stroke="#ef4444" name="Avg Defect Rate (%)" />
              <Line type="monotone" dataKey="passRate" stroke="#10b981" name="Pass Rate (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* TAB 3: SUPPLIER QUALITY */}
      {activeTab === 'supplier' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">🏭 Supplier Quality Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplierQuality}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="supplier" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgQuality" fill="#3b82f6" name="Avg Quality Score" />
                <Bar dataKey="passRate" fill="#10b981" name="Pass Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {supplierQuality.map((supplier, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Supplier</p>
                    <p className="font-semibold text-slate-900">{supplier.supplier}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Tests</p>
                    <p className="font-bold text-blue-600">{supplier.count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Passed</p>
                    <p className="font-bold text-green-600">{supplier.passed}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Quality Score</p>
                    <p className="font-bold text-purple-600">{supplier.avgQuality}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Pass Rate</p>
                    <p className={`font-bold ${supplier.passRate > 90 ? 'text-green-600' : 'text-orange-600'}`}>{supplier.passRate}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COMPLIANCE STATUS */}
      {activeTab === 'compliance' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">✓ Compliance Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={complianceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                {complianceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#10b981', '#ef4444'][index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
