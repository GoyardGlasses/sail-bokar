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
import ModernLayout from '../components/ModernLayout'
import MetricCard from '../components/MetricCard'
import ChartCard from '../components/ChartCard'
import DataTable from '../components/DataTable'

const ModernDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)

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

  if (!dashboardData) return <div className="text-white">Loading...</div>

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
    <ModernLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Operations Dashboard</h1>
          <p className="text-slate-400">Real-time overview of rake formation, utilization, and logistics performance</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardData.metrics.map((metric, idx) => (
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
              <LineChart data={dashboardData.demandChart}>
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
              <ComposedChart data={dashboardData.rakeUtilization}>
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
          data={dashboardData.rakeData}
        />

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-green-400" />
              </div>
              <h3 className="text-slate-300 font-medium">On-Time Delivery</h3>
            </div>
            <p className="text-3xl font-bold text-green-400">94.2%</p>
            <p className="text-sm text-slate-400 mt-2">+2.1% from last week</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle size={20} className="text-yellow-400" />
              </div>
              <h3 className="text-slate-300 font-medium">Avg Delay</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-400">2.4 hrs</p>
            <p className="text-sm text-slate-400 mt-2">-0.5 hrs improvement</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-cyan-400" />
              </div>
              <h3 className="text-slate-300 font-medium">Cost Efficiency</h3>
            </div>
            <p className="text-3xl font-bold text-cyan-400">₹385/T</p>
            <p className="text-sm text-slate-400 mt-2">-₹12/T optimized</p>
          </div>
        </div>
      </div>
    </ModernLayout>
  )
}

export default ModernDashboard
