import React, { useState, useMemo } from 'react'
import { Search, Filter, BarChart3, LineChart as LineChartIcon, TrendingUp, AlertCircle } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useImportedData } from '../hooks/useImportedData'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'

const generateSustainabilityData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const data = months.map(month => ({
    month,
    carbonFootprint: Math.floor(Math.random() * 500) + 300,
    energyUsage: Math.floor(Math.random() * 1000) + 500,
    wasteGenerated: Math.floor(Math.random() * 200) + 50,
    recyclingRate: Math.floor(Math.random() * 40) + 60,
    waterUsage: Math.floor(Math.random() * 800) + 400,
  }))
  return data
}

export default function SustainabilityPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: importedData, isLoaded } = useImportedData()
  const [baseSustainabilityData] = useState(generateSustainabilityData())
  const [activeTab, setActiveTab] = useState('table')
  const hasImportedOrders =
    isLoaded && importedData && Array.isArray(importedData.orders) && importedData.orders.length > 0

  const sustainabilityData = useMemo(() => {
    if (!hasImportedOrders) {
      return baseSustainabilityData
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthMap = new Map()

    importedData.orders.forEach((order) => {
      if (!order) return

      const rawDate =
        order.shipmentDate ||
        order.orderDate ||
        order.date ||
        order.loadingDate

      if (!rawDate || typeof rawDate !== 'string') return

      const parsed = new Date(rawDate)
      if (Number.isNaN(parsed.getTime())) return

      const monthIndex = parsed.getMonth()
      const monthLabel = months[monthIndex] || months[0]

      const qty = Number(order.totalQuantity ?? order.quantity ?? order.qty ?? 0)
      if (!Number.isFinite(qty) || qty <= 0) return

      const existing = monthMap.get(monthLabel) || {
        month: monthLabel,
        tonnage: 0,
      }

      existing.tonnage += qty
      monthMap.set(monthLabel, existing)
    })

    const dynamic = Array.from(monthMap.values()).map((m, index) => {
      const tonnage = m.tonnage
      const carbonFootprint = Math.max(200, Math.round(tonnage * 0.08))
      const energyUsage = Math.max(500, Math.round(tonnage * 0.6))
      const wasteGenerated = Math.max(40, Math.round(tonnage * 0.02))
      const recyclingRate = 65 + (index % 6) * 3
      const waterUsage = Math.max(300, Math.round(tonnage * 0.4))

      return {
        month: m.month,
        carbonFootprint,
        energyUsage,
        wasteGenerated,
        recyclingRate,
        waterUsage,
      }
    })

    return dynamic.length ? dynamic : baseSustainabilityData
  }, [hasImportedOrders, importedData, baseSustainabilityData])

  const complianceData = useMemo(() => {
    if (!sustainabilityData || sustainabilityData.length === 0) {
      return [
        { name: 'Compliant', value: 0 },
        { name: 'Non-Compliant', value: 0 },
      ]
    }

    const compliant = sustainabilityData.filter((d) => d.recyclingRate >= 70 && d.carbonFootprint <= 800)
      .length
    const nonCompliant = sustainabilityData.length - compliant

    return [
      { name: 'Compliant', value: compliant },
      { name: 'Non-Compliant', value: nonCompliant },
    ]
  }, [sustainabilityData])

  const environmentalMetrics = useMemo(() => {
    const totalCarbon = sustainabilityData.reduce((sum, d) => sum + d.carbonFootprint, 0)
    const totalEnergy = sustainabilityData.reduce((sum, d) => sum + d.energyUsage, 0)
    const totalWaste = sustainabilityData.reduce((sum, d) => sum + d.wasteGenerated, 0)
    const avgRecycling =
      sustainabilityData.length > 0
        ? (
            sustainabilityData.reduce((sum, d) => sum + d.recyclingRate, 0) /
            sustainabilityData.length
          ).toFixed(1)
        : '0.0'

    return { totalCarbon, totalEnergy, totalWaste, avgRecycling }
  }, [sustainabilityData])

  const stats = useMemo(() => {
    const total = sustainabilityData.length

    if (!total) {
      return { total: 0, avgCarbon: '0', avgEnergy: '0', avgWaste: '0' }
    }

    const avgCarbon = (
      sustainabilityData.reduce((sum, d) => sum + d.carbonFootprint, 0) / total
    ).toFixed(0)
    const avgEnergy = (
      sustainabilityData.reduce((sum, d) => sum + d.energyUsage, 0) / total
    ).toFixed(0)
    const avgWaste = (
      sustainabilityData.reduce((sum, d) => sum + d.wasteGenerated, 0) / total
    ).toFixed(0)

    return { total, avgCarbon, avgEnergy, avgWaste }
  }, [sustainabilityData])

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">🌱 Sustainability & ESG</h1>
        <p className="text-slate-600">Monitor environmental and sustainability metrics</p>
      </div>

      <InlineDataImport templateId="operations" />

      <div className="flex gap-2 border-b border-slate-300 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'table', label: 'Metrics', icon: BarChart3 },
          { id: 'carbon', label: 'Carbon Footprint', icon: LineChartIcon },
          { id: 'environmental', label: 'Environmental Impact', icon: TrendingUp },
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Avg Carbon Footprint</p>
          <p className="text-3xl font-bold text-slate-800">{stats.avgCarbon} kg</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Avg Energy Usage</p>
          <p className="text-3xl font-bold text-blue-600">{stats.avgEnergy} kWh</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Avg Waste Generated</p>
          <p className="text-3xl font-bold text-orange-600">{stats.avgWaste} kg</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Avg Recycling Rate</p>
          <p className="text-3xl font-bold text-green-600">{environmentalMetrics.avgRecycling}%</p>
        </div>
      </div>

      {activeTab === 'table' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Month</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Carbon (kg)</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Energy (kWh)</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Waste (kg)</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Recycling Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Water (L)</th>
                </tr>
              </thead>
              <tbody>
                {sustainabilityData.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{item.month}</td>
                    <td className="py-3 px-4 text-slate-700">{item.carbonFootprint}</td>
                    <td className="py-3 px-4 text-slate-700">{item.energyUsage}</td>
                    <td className="py-3 px-4 text-slate-700">{item.wasteGenerated}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.recyclingRate > 70 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.recyclingRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{item.waterUsage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'carbon' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Carbon Footprint Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sustainabilityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="carbonFootprint" stroke="#ef4444" strokeWidth={2} name="Carbon Footprint (kg)" />
              <Line type="monotone" dataKey="energyUsage" stroke="#f59e0b" strokeWidth={2} name="Energy Usage (kWh)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'environmental' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">🌍 Environmental Metrics Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sustainabilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="wasteGenerated" fill="#ef4444" name="Waste (kg)" />
                <Bar dataKey="recyclingRate" fill="#10b981" name="Recycling Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-lg shadow p-6">
              <h4 className="font-bold text-green-900 mb-3">✓ Positive Metrics</h4>
              <div className="space-y-2">
                <p className="text-sm text-green-800">Total Carbon: {environmentalMetrics.totalCarbon} kg</p>
                <p className="text-sm text-green-800">Recycling Rate: {environmentalMetrics.avgRecycling}%</p>
                <p className="text-sm text-green-800">Water Usage: {sustainabilityData.reduce((sum, d) => sum + d.waterUsage, 0)} L</p>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg shadow p-6">
              <h4 className="font-bold text-orange-900 mb-3">⚠️ Areas for Improvement</h4>
              <div className="space-y-2">
                <p className="text-sm text-orange-800">Total Waste: {environmentalMetrics.totalWaste} kg</p>
                <p className="text-sm text-orange-800">Energy Usage: {environmentalMetrics.totalEnergy} kWh</p>
                <p className="text-sm text-orange-800">Target: Reduce by 15% next quarter</p>
              </div>
            </div>
          </div>
        </div>
      )}

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

          <div className="mt-6 space-y-3">
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="font-semibold text-green-900">ISO 14001 Certification</p>
              <p className="text-sm text-green-700">Status: Compliant ✓</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="font-semibold text-green-900">Carbon Neutrality Target</p>
              <p className="text-sm text-green-700">Progress: 65% towards 2030 goal</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <p className="font-semibold text-yellow-900">Waste Reduction Program</p>
              <p className="text-sm text-yellow-700">Status: In Progress - 45% reduction achieved</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
