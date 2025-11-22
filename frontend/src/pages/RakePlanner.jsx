import React, { useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Calendar, Download, Settings, Play } from 'lucide-react'
import ModernLayout from '../components/ModernLayout'
import MetricCard from '../components/MetricCard'
import ChartCard from '../components/ChartCard'
import DataTable from '../components/DataTable'

const RakePlanner = () => {
  const [activeTab, setActiveTab] = useState('formation')
  const [dateRange, setDateRange] = useState('Oct 6, 2025')

  const optimizationMetrics = [
    { title: 'Demurrage Cost Reduction', value: '₹2.40 L', unit: '↑', change: 'Monthly Savings' },
    { title: 'Cost per Ton', value: '₹950', unit: '', change: 'Target: ₹950' },
    { title: 'Rake Utilization', value: '16.5%', unit: '↑', change: 'Improvement to 85%' },
    { title: 'On-Time Delivery', value: '+22.7%', unit: '↑', change: 'Improvement to 95%' },
  ]

  const rakeFormationData = [
    {
      id: 'SAIL-R001',
      source: 'LPI_Bokaro',
      destination: 'Haldia_Port_User',
      wagons: '64 (BOXN)',
      load: 3800,
      utilization: '98.7%',
      delayRisk: '12%',
      cost: '9,21,500',
    },
    {
      id: 'SAIL-R002',
      source: 'LP2_Bokaro',
      destination: 'Jamshedpur_Manufacturing',
      wagons: '58 (BOXN)',
      load: 3500,
      utilization: '97.2%',
      delayRisk: '8%',
      cost: '8,75,000',
    },
    {
      id: 'SAIL-R003',
      source: 'LP3_Bokaro',
      destination: 'Siliguri_Supplier',
      wagons: '55 (BRN)',
      load: 3200,
      utilization: '92.3%',
      delayRisk: '21%',
      cost: '7,85,000',
    },
  ]

  const beforeAfterData = [
    { metric: 'Cost/Tonne (₹)', before: 1200, after: 950 },
    { metric: 'Utilization (%)', before: 72, after: 85 },
    { metric: 'On-Time Rate (%)', before: 85, after: 95 },
  ]

  const predictedRakesData = [
    { destination: 'Haldia_Port_User', rakes: 7, color: '#06b6d4' },
    { destination: 'Jamshedpur_Manufacturing', rakes: 5, color: '#06b6d4' },
    { destination: 'Siliguri_Supplier', rakes: 4, color: '#06b6d4' },
    { destination: 'Gaya_Trader', rakes: 3, color: '#06b6d4' },
  ]

  const columns = [
    { key: 'id', label: 'Rake ID', sortable: true },
    { key: 'source', label: 'Source', sortable: true },
    { key: 'destination', label: 'Destination', sortable: true },
    { key: 'wagons', label: 'Wagons (Type)', sortable: false },
    { key: 'load', label: 'Load (T)', sortable: true },
    { key: 'utilization', label: 'Utilization', sortable: true },
    {
      key: 'delayRisk',
      label: 'Delay Risk',
      render: (value) => (
        <span className={value === '12%' || value === '8%' ? 'text-green-400' : 'text-yellow-400'}>
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
          <h1 className="text-3xl font-bold text-white mb-2">Optimization & Dispatch Plan</h1>
          <p className="text-slate-400">
            Generate an AI-powered daily dispatch plan that balances cost, efficiency, and on-time delivery based on your operational constraints.
          </p>
        </div>

        {/* Configuration Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Optimization Parameters</h3>
          <p className="text-sm text-slate-400 mb-6">Provide operational inputs to generate the dispatch plan.</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Dispatch Date</label>
              <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-4 py-2">
                <Calendar size={18} className="text-slate-400" />
                <input
                  type="text"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="bg-transparent text-white outline-none flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Material Availability (Tons)</label>
              <input
                type="text"
                defaultValue="15000"
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Wagon Availability (BOXN)</label>
              <input
                type="text"
                defaultValue="190"
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Max Cost per Ton (₹)</label>
              <input
                type="text"
                defaultValue="500"
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-8 py-2 rounded-lg transition-colors flex items-center gap-2">
            <Play size={18} />
            Run Optimization
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {optimizationMetrics.map((metric, idx) => (
            <div key={idx} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <p className="text-slate-400 text-sm font-medium mb-2">{metric.title}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-cyan-400">{metric.value}</span>
                {metric.unit && <span className="text-green-400 text-lg">{metric.unit}</span>}
              </div>
              <p className="text-xs text-slate-500 mt-2">{metric.change}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700">
          {['formation', 'comparison', 'prediction'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab === 'formation' && 'Optimized Dispatch Plan'}
              {tab === 'comparison' && 'Before vs. After Optimization'}
              {tab === 'prediction' && 'Predicted Rakes Required'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'formation' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Recommended rake formations and assignments.</h3>
              <button className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors">
                <Download size={18} />
                Export Plan
              </button>
            </div>
            <DataTable columns={columns} data={rakeFormationData} />
          </div>
        )}

        {activeTab === 'comparison' && (
          <ChartCard title="Before vs. After Optimization" subtitle="Comparison of key performance indicators.">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={beforeAfterData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="metric" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="before" fill="#475569" name="Before Optimization" />
                <Bar dataKey="after" fill="#06b6d4" name="After Optimization" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {activeTab === 'prediction' && (
          <ChartCard title="Predicted Rakes Required" subtitle="Forecasted rake demand by destination for the selected period.">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={predictedRakesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="destination" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="rakes" fill="#06b6d4" name="Rakes Required" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    </ModernLayout>
  )
}

export default RakePlanner
