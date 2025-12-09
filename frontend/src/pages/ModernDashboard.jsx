import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts'
import { TrendingUp, Package, Truck, AlertCircle, CheckCircle } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import ChartCard from '../components/ChartCard'
import DataTable from '../components/DataTable'
import { useMLPredictions } from '../context/MLPredictionsContext'
import { useImportedData } from '../hooks/useImportedData'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'

const ModernDashboard = () => {
  const { dataImported, getPrediction } = useMLPredictions()
  const [mlPredictions, setMlPredictions] = useState({})
  const [dashboardData, setDashboardData] = useState(null)
  const { data: importedData, isLoaded } = useImportedData()

  // Get ML predictions when data is imported
  useEffect(() => {
    if (dataImported) {
      const predictions = {
        cost: getPrediction('cost_prediction'),
        delay: getPrediction('delay_prediction'),
        demand: getPrediction('demand_forecasting'),
        risk: getPrediction('risk_assessment'),
        quality: getPrediction('quality_prediction'),
      }
      setMlPredictions(predictions)
    }
  }, [dataImported, getPrediction])

  useEffect(() => {
    // Mock data - replace with API call
    const mockData = {
      metrics: [
        { title: 'Total Rakes', value: '18', change: 12, icon: Truck },
        { title: 'Total Tonnage', value: '68.4k', unit: 'T', change: 8, icon: Package },
        { title: 'Avg Utilization', value: '68.5%', change: 5, icon: TrendingUp },
        { title: 'Target Utilization', value: '85%', change: -2, trend: 'down', icon: AlertCircle },
      ],
      demandChart: [
        { date: 'D-58', demand: 65000, forecast: 68000 },
        { date: 'D-50', demand: 62000, forecast: 65000 },
        { date: 'D-42', demand: 70000, forecast: 72000 },
        { date: 'D-34', demand: 68000, forecast: 70000 },
        { date: 'D-26', demand: 72000, forecast: 74000 },
        { date: 'D-18', demand: 75000, forecast: 76000 },
        { date: 'D-10', demand: 78000, forecast: 80000 },
        { date: 'D-0', demand: 82000, forecast: 85000 },
      ],
      rakeUtilization: [
        { date: 'D-58', utilization: 65, cost: 320 },
        { date: 'D-50', utilization: 72, cost: 350 },
        { date: 'D-42', utilization: 68, cost: 330 },
        { date: 'D-34', utilization: 75, cost: 360 },
        { date: 'D-26', utilization: 78, cost: 380 },
        { date: 'D-18', utilization: 82, cost: 400 },
        { date: 'D-10', utilization: 85, cost: 420 },
        { date: 'D-0', utilization: 88, cost: 450 },
      ],
      rakeData: [
        { id: 'SAIL-R001', source: 'LPI_Bokaro', destination: 'Haldia_Port_User', wagons: '64 (BOXN)', load: 3800, utilization: '98.7%', delay: '12%', cost: '9,21,500' },
        { id: 'SAIL-R002', source: 'LP2_Bokaro', destination: 'Jamshedpur_Manufacturing', wagons: '58 (BOXN)', load: 3500, utilization: '97.2%', delay: '8%', cost: '8,75,000' },
        { id: 'SAIL-R003', source: 'LP3_Bokaro', destination: 'Siliguri_Supplier', wagons: '55 (BRN)', load: 3200, utilization: '92.3%', delay: '21%', cost: '7,85,000' },
      ],
    }
    setDashboardData(mockData)
  }, [])

  if (!dashboardData) return <div className="p-8 text-slate-600">Loading...</div>

  const baseMetrics = dashboardData.metrics || []
  const baseDemandChart = dashboardData.demandChart || []
  const baseRakeUtilization = dashboardData.rakeUtilization || []
  const baseRakeData = dashboardData.rakeData || []

  let metrics = baseMetrics
  let demandChart = baseDemandChart
  let rakeUtilization = baseRakeUtilization
  let rakeData = baseRakeData

  if (isLoaded && importedData) {
    try {
      const rakes = Array.isArray(importedData.rakes) ? importedData.rakes : []
      const orders = Array.isArray(importedData.orders) ? importedData.orders : []

      if (rakes.length > 0 || orders.length > 0) {
        const totalRakes = rakes.length

        const totalTonnageValues = orders
          .map((o) => Number(o?.quantity ?? o?.tonnage ?? 0))
          .filter((v) => Number.isFinite(v) && v > 0)

        const totalTonnage =
          totalTonnageValues.length > 0
            ? totalTonnageValues.reduce((sum, v) => sum + v, 0)
            : null

        const tonnageDisplay =
          totalTonnage != null
            ? totalTonnage >= 1000
              ? `${(totalTonnage / 1000).toFixed(1)}k`
              : totalTonnage.toFixed(0)
            : baseMetrics[1]?.value || '68.4k'

        metrics = [
          {
            title: baseMetrics[0]?.title || 'Total Rakes',
            value: totalRakes > 0 ? totalRakes.toString() : baseMetrics[0]?.value || '18',
            unit: baseMetrics[0]?.unit,
            change: baseMetrics[0]?.change ?? 12,
            icon: baseMetrics[0]?.icon || Truck,
          },
          {
            title: baseMetrics[1]?.title || 'Total Tonnage',
            value: tonnageDisplay,
            unit: baseMetrics[1]?.unit || 'T',
            change: baseMetrics[1]?.change ?? 8,
            icon: baseMetrics[1]?.icon || Package,
          },
          baseMetrics[2] || {
            title: 'Avg Utilization',
            value: '68.5%',
            change: 5,
            icon: TrendingUp,
          },
          baseMetrics[3] || {
            title: 'Target Utilization',
            value: '85%',
            change: -2,
            trend: 'down',
            icon: AlertCircle,
          },
        ]

        if (orders.length > 0 && totalTonnage != null) {
          const avgPerOrder = totalTonnage / orders.length
          const baseValue = avgPerOrder * 10
          const points = 8

          demandChart = Array.from({ length: points }).map((_, idx) => {
            const factor = 0.9 + (idx / (points - 1)) * 0.2
            const demandVal = baseValue * factor
            const forecastFactor = 0.95 + (idx / (points - 1)) * 0.25
            const forecastVal = baseValue * forecastFactor

            return {
              date: `D-${(points - 1 - idx) * 8}`,
              demand: Math.round(demandVal),
              forecast: Math.round(forecastVal),
            }
          })
        }

        if (rakes.length > 0) {
          rakeUtilization = rakes.slice(0, baseRakeUtilization.length || 8).map((r, idx) => {
            const base = baseRakeUtilization[idx] || {}
            const utilRaw = Number(r?.utilization ?? r?.utilization_percent ?? base.utilization ?? 0)
            const costRaw = Number(
              r?.cost_per_tonne ??
                r?.costPerTon ??
                base.cost ??
                0
            )

            return {
              utilization:
                Number.isFinite(utilRaw) && utilRaw > 0 ? Math.min(100, utilRaw) : base.utilization || 70,
              cost:
                Number.isFinite(costRaw) && costRaw > 0 ? costRaw : base.cost || 350,
              name: r.rakeId || r.id || base.name || `R${String(idx + 1).padStart(3, '0')}`,
            }
          })
        }

        if (rakes.length > 0) {
          rakeData = rakes.slice(0, baseRakeData.length || 3).map((r, idx) => {
            const base = baseRakeData[idx] || {}

            return {
              id: r.rakeId || r.id || base.id || `Rake-${idx + 1}`,
              source: r.source || r.origin || base.source || 'Unknown',
              destination: r.destination || base.destination || 'Unknown',
              wagons: base.wagons || `${r.wagons || r.wagonCount || '64'} (BOXN)`,
              load: Number(r.load ?? r.load_tonnage ?? r.tonnage ?? base.load ?? 0),
              utilization: base.utilization || '95%',
              delay: base.delay || '12%',
              cost: base.cost || '9,21,500',
            }
          })
        }
      }
    } catch (e) {
      metrics = baseMetrics
      demandChart = baseDemandChart
      rakeUtilization = baseRakeUtilization
      rakeData = baseRakeData
    }
  }

  let onTimeDeliveryDisplay = '94.2%'
  let avgDelayDisplay = '2.4 hrs'
  let costEfficiencyDisplay = '₹385/T'

  const delayModel = mlPredictions.delay
  const costModel = mlPredictions.cost

  if (delayModel) {
    const onTime =
      typeof delayModel.on_time_probability === 'number'
        ? delayModel.on_time_probability <= 1
          ? delayModel.on_time_probability * 100
          : delayModel.on_time_probability
        : typeof delayModel.on_time_percentage === 'number'
          ? delayModel.on_time_percentage
          : null

    const avgDelay =
      typeof delayModel.average_delay_hours === 'number'
        ? delayModel.average_delay_hours
        : typeof delayModel.avg_delay_hours === 'number'
          ? delayModel.avg_delay_hours
          : null

    if (typeof onTime === 'number') {
      onTimeDeliveryDisplay = `${onTime.toFixed(1)}%`
    }

    if (typeof avgDelay === 'number') {
      avgDelayDisplay = `${avgDelay.toFixed(1)} hrs`
    }
  }

  if (costModel) {
    const costPerTon =
      typeof costModel.cost_per_tonne === 'number'
        ? costModel.cost_per_tonne
        : typeof costModel.average_cost_per_ton === 'number'
          ? costModel.average_cost_per_ton
          : null

    if (typeof costPerTon === 'number') {
      costEfficiencyDisplay = `₹${costPerTon.toFixed(0)}/T`
    }
  }

  const columns = [
    { key: 'id', label: 'Rake ID', sortable: true },
    { key: 'source', label: 'Source', sortable: true },
    { key: 'destination', label: 'Destination', sortable: true },
    { key: 'wagons', label: 'Wagons (Type)', sortable: false },
    { key: 'load', label: 'Load (T)', sortable: true },
    { key: 'utilization', label: 'Utilization', sortable: true },
    {
      key: 'delay',
      label: 'Delay Risk',
      render: (value) => (
        <span className={value === '12%' ? 'text-green-400' : value === '8%' ? 'text-green-400' : 'text-yellow-400'}>
          {value}
        </span>
      ),
    },
    { key: 'cost', label: 'Cost (₹)', sortable: true },
  ]

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Operations Dashboard</h1>
        <p className="text-slate-600">Real-time overview of rake formation, utilization, and logistics performance</p>
      </div>

      <InlineDataImport templateId="operations" />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <MetricCard
            key={idx}
            title={metric.title}
            value={metric.value}
            unit={metric.unit}
            change={metric.change}
            trend={metric.trend || 'up'}
            icon={metric.icon}
          />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Demand Forecast" subtitle="Predicted vs Historical Demand (Tonnes)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={demandChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="demand"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ fill: '#06b6d4', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#0ea5e9', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Rake Utilization Trend" subtitle="Utilization % vs Cost per Tonne">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={rakeUtilization}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="utilization" fill="#06b6d4" name="Utilization (%)" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cost"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Cost (₹/T)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

      {/* Rake Data Table */}
      <DataTable
        title="Active Rakes - Detailed Performance"
        columns={columns}
        data={rakeData}
      />

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <h3 className="text-slate-900 font-medium">On-Time Delivery</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{onTimeDeliveryDisplay}</p>
          <p className="text-sm text-slate-600 mt-2">+2.1% from last week</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <AlertCircle size={20} className="text-amber-500" />
            </div>
            <h3 className="text-slate-900 font-medium">Avg Delay</h3>
          </div>
          <p className="text-3xl font-bold text-amber-600">{avgDelayDisplay}</p>
          <p className="text-sm text-slate-600 mt-2">-0.5 hrs improvement</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-cyan-600" />
            </div>
            <h3 className="text-slate-900 font-medium">Cost Efficiency</h3>
          </div>
          <p className="text-3xl font-bold text-cyan-600">{costEfficiencyDisplay}</p>
          <p className="text-sm text-slate-600 mt-2">-₹12/T optimized</p>
        </div>
      </div>
    </div>
  )
}

export default ModernDashboard
