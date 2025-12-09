import React, { useState, useMemo, useEffect } from 'react'
import { Search, Filter, BarChart3, LineChart as LineChartIcon, TrendingUp, AlertCircle } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useMLPredictions } from '../context/MLPredictionsContext'
import { useImportedData } from '../hooks/useImportedData'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'

const generateSupplierData = () => {
  const suppliers = ['Supplier A', 'Supplier B', 'Supplier C', 'Supplier D', 'Supplier E', 'Supplier F', 'Supplier G']
  const data = suppliers.map(supplier => ({
    id: supplier,
    supplier,
    rating: Math.floor(Math.random() * 40) + 60,
    onTimeRate: Math.floor(Math.random() * 40) + 60,
    qualityScore: Math.floor(Math.random() * 40) + 60,
    costCompetitiveness: Math.floor(Math.random() * 40) + 60,
    orders: Math.floor(Math.random() * 100) + 20,
    totalValue: Math.floor(Math.random() * 5000000) + 1000000,
    status: Math.random() > 0.2 ? 'Active' : 'At Risk'
  }))
  return data
}

export default function SupplierManagementPage() {
  const { dataImported, getPrediction } = useMLPredictions()
  const { data: importedData, isLoaded } = useImportedData()
  const [mlSupplierPerformance, setMlSupplierPerformance] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [baseSupplierData] = useState(generateSupplierData())
  const [activeTab, setActiveTab] = useState('table')

  const hasImportedSuppliers =
    isLoaded && importedData && Array.isArray(importedData.suppliers) && importedData.suppliers.length > 0

  const hasImportedOrders =
    isLoaded && importedData && Array.isArray(importedData.orders) && importedData.orders.length > 0

  const supplierData = useMemo(() => {
    if (hasImportedSuppliers) {
      const mapped = importedData.suppliers
        .map((s, index) => {
          if (!s) return null

          const name =
            s.name ||
            s.supplierName ||
            s.vendor ||
            s.id ||
            `Supplier ${index + 1}`

          const ratingRaw = Number(
            s.rating ??
              s.performanceScore ??
              s.overall_score ??
              0
          )
          const rating =
            Number.isFinite(ratingRaw) && ratingRaw > 0
              ? Math.max(50, Math.min(100, ratingRaw))
              : 75 + (index % 10)

          const onTimeRaw = Number(
            s.onTimeRate ??
              s.on_time_rate ??
              s.ontime_percent ??
              0
          )
          const onTimeRate =
            Number.isFinite(onTimeRaw) && onTimeRaw > 0
              ? Math.max(50, Math.min(100, onTimeRaw))
              : 80 - (index % 15)

          const qualityRaw = Number(
            s.qualityScore ??
              s.quality ??
              s.score ??
              0
          )
          const qualityScore =
            Number.isFinite(qualityRaw) && qualityRaw > 0
              ? Math.max(50, Math.min(100, qualityRaw))
              : 78 + (index % 12)

          const costRaw = Number(
            s.costCompetitiveness ??
              s.cost_score ??
              s.costIndex ??
              0
          )
          const costCompetitiveness =
            Number.isFinite(costRaw) && costRaw > 0
              ? Math.max(50, Math.min(100, costRaw))
              : 82 - (index % 10)

          const ordersRaw = Number(
            s.orders ??
              s.orderCount ??
              s.total_orders ??
              0
          )
          const orders =
            Number.isFinite(ordersRaw) && ordersRaw > 0
              ? ordersRaw
              : 10 + (index % 20) * 2

          const totalValueRaw = Number(
            s.totalValue ??
              s.orderValue ??
              s.total_value ??
              0
          )
          const totalValue =
            Number.isFinite(totalValueRaw) && totalValueRaw > 0
              ? totalValueRaw
              : 1_000_000 + index * 250_000

          const statusRaw = (s.status || s.riskLevel || '').toString().toLowerCase()
          const status =
            statusRaw === 'at risk' || statusRaw === 'high'
              ? 'At Risk'
              : 'Active'

          return {
            id: s.id || name,
            supplier: name,
            rating,
            onTimeRate,
            qualityScore,
            costCompetitiveness,
            orders,
            totalValue,
            status,
          }
        })
        .filter(Boolean)

      return mapped.length ? mapped : baseSupplierData
    }

    if (hasImportedOrders) {
      const map = {}

      importedData.orders.forEach((o, index) => {
        if (!o) return

        const name =
          o.supplierName ||
          o.vendor ||
          o.supplier ||
          o.customer ||
          `Supplier ${index + 1}`

        if (!map[name]) {
          map[name] = {
            supplier: name,
            ratingSum: 0,
            ratingCount: 0,
            onTimeSum: 0,
            onTimeCount: 0,
            qualitySum: 0,
            qualityCount: 0,
            costSum: 0,
            costCount: 0,
            orders: 0,
            totalValue: 0,
            riskHits: 0,
          }
        }

        const rec = map[name]

        const isDelayed =
          o.status === 'Delayed' ||
          o.delayFlag === true ||
          o.isDelayed === true

        const qty = Number(o.totalQuantity ?? o.quantity ?? o.qty ?? 0)
        const baseCost = Number(o.cost ?? o.totalCost ?? o.estimatedCost ?? 0)
        const value =
          Number.isFinite(baseCost) && baseCost > 0
            ? baseCost
            : Number.isFinite(qty) && qty > 0
              ? qty * 5000
              : 250000

        rec.orders += 1
        rec.totalValue += value

        const rating = isDelayed ? 70 : 85
        rec.ratingSum += rating
        rec.ratingCount += 1

        const onTime = isDelayed ? 70 : 92
        rec.onTimeSum += onTime
        rec.onTimeCount += 1

        const qualityScore = 80 + (index % 15)
        rec.qualitySum += qualityScore
        rec.qualityCount += 1

        const costScore = isDelayed ? 75 : 88
        rec.costSum += costScore
        rec.costCount += 1

        if (isDelayed) {
          rec.riskHits += 1
        }
      })

      const aggregated = Object.values(map).map((rec, index) => {
        const rating = rec.ratingCount ? rec.ratingSum / rec.ratingCount : 80
        const onTimeRate = rec.onTimeCount ? rec.onTimeSum / rec.onTimeCount : 85
        const qualityScore = rec.qualityCount ? rec.qualitySum / rec.qualityCount : 82
        const costCompetitiveness = rec.costCount ? rec.costSum / rec.costCount : 86

        const status =
          rec.riskHits > 0 && onTimeRate < 85
            ? 'At Risk'
            : 'Active'

        return {
          id: `${rec.supplier}-${index}`,
          supplier: rec.supplier,
          rating: Number(rating.toFixed(1)),
          onTimeRate: Number(onTimeRate.toFixed(1)),
          qualityScore: Number(qualityScore.toFixed(1)),
          costCompetitiveness: Number(costCompetitiveness.toFixed(1)),
          orders: rec.orders,
          totalValue: rec.totalValue,
          status,
        }
      })

      return aggregated.length ? aggregated : baseSupplierData
    }

    return baseSupplierData
  }, [hasImportedSuppliers, hasImportedOrders, importedData, baseSupplierData])

  // Get ML prediction when data is imported
  useEffect(() => {
    if (dataImported) {
      const supplierPerf = getPrediction('supplier_performance')
      setMlSupplierPerformance(supplierPerf)
    }
  }, [dataImported, getPrediction])

  const mlSupplierRaw = Array.isArray(mlSupplierPerformance)
    ? mlSupplierPerformance
    : mlSupplierPerformance && Array.isArray(mlSupplierPerformance.predictions)
      ? mlSupplierPerformance.predictions
      : mlSupplierPerformance

  let mlSupplierCount = 0
  let mlAvgRating = null
  let mlActiveSuppliers = null
  let mlTotalValue = null

  if (Array.isArray(mlSupplierRaw)) {
    mlSupplierCount = mlSupplierRaw.length
    let ratingSum = 0
    let ratingCount = 0
    let activeCount = 0
    let valueSum = 0

    mlSupplierRaw.forEach((s) => {
      if (!s || typeof s !== 'object') return

      const rating = Number(
        s.rating ??
          s.performance_score ??
          s.overall_score ??
          0
      )
      if (Number.isFinite(rating) && rating > 0) {
        ratingSum += rating
        ratingCount += 1
      }

      const status = (s.status || s.risk_level || '').toString().toLowerCase()
      if (status === 'active' || status === 'low') {
        activeCount += 1
      }

      const value = Number(
        s.total_value ??
          s.volume ??
          s.exposure ??
          0
      )
      if (Number.isFinite(value) && value > 0) {
        valueSum += value
      }
    })

    if (ratingCount > 0) {
      mlAvgRating = ratingSum / ratingCount
    }
    if (activeCount > 0) {
      mlActiveSuppliers = activeCount
    }
    if (valueSum > 0) {
      mlTotalValue = valueSum
    }
  }

  const filteredData = useMemo(() => {
    return supplierData.filter(item =>
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [supplierData, searchTerm])

  const performanceData = useMemo(() => {
    return supplierData.map(s => ({
      supplier: s.supplier,
      rating: s.rating,
      onTime: s.onTimeRate,
      quality: s.qualityScore,
      cost: s.costCompetitiveness
    }))
  }, [supplierData])

  const statusDistribution = useMemo(() => {
    const active = supplierData.filter(s => s.status === 'Active').length
    const atRisk = supplierData.filter(s => s.status === 'At Risk').length
    return [
      { name: 'Active', value: active },
      { name: 'At Risk', value: atRisk }
    ]
  }, [supplierData])

  const stats = useMemo(() => {
    const totalBase = supplierData.length

    if (!totalBase && !mlSupplierCount) {
      return { total: 0, active: 0, avgRating: '0.0', totalValue: 0 }
    }

    const total = mlSupplierCount > 0 ? Math.max(totalBase, mlSupplierCount) : totalBase

    const activeBase = supplierData.filter(s => s.status === 'Active').length
    const avgRatingBase =
      totalBase > 0
        ? supplierData.reduce((sum, s) => sum + (Number(s.rating) || 0), 0) / totalBase
        : 0
    const totalValueBase = supplierData.reduce((sum, s) => sum + (Number(s.totalValue) || 0), 0)

    const avgRating =
      mlAvgRating != null
        ? mlAvgRating.toFixed(1)
        : avgRatingBase.toFixed(1)

    const active =
      mlActiveSuppliers != null
        ? Math.max(activeBase, mlActiveSuppliers)
        : activeBase

    const totalValue =
      mlTotalValue != null && mlTotalValue > 0
        ? Math.max(totalValueBase, mlTotalValue)
        : totalValueBase

    return { total, active, avgRating, totalValue }
  }, [supplierData, mlSupplierCount, mlAvgRating, mlActiveSuppliers, mlTotalValue])

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">🏭 Supplier Management</h1>
        <p className="text-slate-600">Monitor and manage supplier performance</p>
      </div>

      <InlineDataImport templateId="operations" />

      <div className="flex gap-2 border-b border-slate-300 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'table', label: 'Suppliers', icon: BarChart3 },
          { id: 'performance', label: 'Performance Scorecard', icon: LineChartIcon },
          { id: 'reliability', label: 'Reliability Metrics', icon: TrendingUp },
          { id: 'status', label: 'Status Distribution', icon: AlertCircle },
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Total Suppliers</p>
          <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Active</p>
          <p className="text-3xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Avg Rating</p>
          <p className="text-3xl font-bold text-blue-600">{stats.avgRating}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Total Value</p>
          <p className="text-3xl font-bold text-purple-600">₹{(stats.totalValue / 10000000).toFixed(1)}Cr</p>
        </div>
      </div>

      {activeTab === 'table' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search suppliers..."
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
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Supplier</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Rating</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">On-Time Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Quality</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Orders</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{item.supplier}</td>
                    <td className="py-3 px-4 text-slate-700">{item.rating}%</td>
                    <td className="py-3 px-4 text-slate-700">{item.onTimeRate}%</td>
                    <td className="py-3 px-4 text-slate-700">{item.qualityScore}%</td>
                    <td className="py-3 px-4 text-slate-700">{item.orders}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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

      {activeTab === 'performance' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Supplier Performance Scorecard</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="supplier" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="rating" fill="#3b82f6" name="Overall Rating" />
              <Bar dataKey="quality" fill="#10b981" name="Quality Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'reliability' && (
        <div className="space-y-4">
          {supplierData.map((supplier, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-slate-600">Supplier</p>
                  <p className="font-semibold text-slate-900">{supplier.supplier}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">On-Time Rate</p>
                  <p className="font-bold text-blue-600">{supplier.onTimeRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Quality Score</p>
                  <p className="font-bold text-green-600">{supplier.qualityScore}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Cost Competitiveness</p>
                  <p className="font-bold text-purple-600">{supplier.costCompetitiveness}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Overall Rating</p>
                  <p className={`font-bold ${supplier.rating > 75 ? 'text-green-600' : 'text-orange-600'}`}>{supplier.rating}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'status' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">📈 Supplier Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                {statusDistribution.map((entry, index) => (
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
