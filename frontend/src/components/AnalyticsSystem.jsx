import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Plus, Trash2, Share2, Download, Edit2, Grid, List } from 'lucide-react'
import { getDashboards, createDashboard, deleteDashboard, getAnalyticsData, getWidgetLibrary, exportDashboard, shareDashboard } from '../api/analyticsApi'

// Dashboard Builder Component
export function DashboardBuilder() {
  const [dashboards, setDashboards] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  useEffect(() => {
    loadDashboards()
  }, [])

  const loadDashboards = async () => {
    setLoading(true)
    try {
      const data = await getDashboards()
      setDashboards(data)
    } catch (error) {
      console.error('Failed to load dashboards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDashboard = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a dashboard name')
      return
    }
    try {
      await createDashboard({
        ...formData,
        widgets: [],
        isShared: false,
        owner: 'admin@example.com',
      })
      loadDashboards()
      setShowForm(false)
      setFormData({ name: '', description: '' })
    } catch (error) {
      console.error('Failed to create dashboard:', error)
    }
  }

  const handleDeleteDashboard = async (id) => {
    if (window.confirm('Are you sure you want to delete this dashboard?')) {
      try {
        await deleteDashboard(id)
        loadDashboards()
      } catch (error) {
        console.error('Failed to delete dashboard:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Dashboards</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          <Plus size={18} className="inline mr-2" />
          New Dashboard
        </button>
      </div>

      {showForm && (
        <div className="card space-y-4 p-6 bg-blue-50">
          <h3 className="font-bold text-slate-900">Create Dashboard</h3>
          <input
            type="text"
            placeholder="Dashboard name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            rows="3"
          />
          <div className="flex gap-2">
            <button onClick={handleCreateDashboard} className="btn btn-primary">
              Create
            </button>
            <button onClick={() => setShowForm(false)} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : dashboards.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-slate-600">No dashboards yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboards.map((dash) => (
            <div key={dash.id} className="card p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-900">{dash.name}</h3>
                  <p className="text-sm text-slate-600">{dash.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteDashboard(dash.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{dash.widgets.length} widgets</span>
                {dash.isShared && <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Shared</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Widget Library Component
export function WidgetLibrary() {
  const [widgets, setWidgets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWidgets()
  }, [])

  const loadWidgets = async () => {
    setLoading(true)
    try {
      const data = await getWidgetLibrary()
      setWidgets(data.widgets || [])
    } catch (error) {
      console.error('Failed to load widgets:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Widget Library</h2>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {widgets.map((widget, idx) => (
            <div key={idx} className="card p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-2">{widget.icon}</div>
              <p className="font-bold text-slate-900">{widget.name}</p>
              <p className="text-xs text-slate-600 mt-1">{widget.description}</p>
              <button className="btn btn-sm btn-primary mt-3 w-full">
                Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Analytics Dashboard Component
export function AnalyticsDashboard() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState('delay_trend')

  useEffect(() => {
    loadData()
  }, [selectedMetric])

  const loadData = async () => {
    setLoading(true)
    try {
      const analyticsData = await getAnalyticsData(selectedMetric, 30)
      setData(analyticsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const metrics = [
    { value: 'delay_trend', label: 'Delay Trend' },
    { value: 'forecast_accuracy', label: 'Forecast Accuracy' },
    { value: 'route_performance', label: 'Route Performance' },
    { value: 'cost_analysis', label: 'Cost Analysis' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h2>
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg"
        >
          {metrics.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <div className="card p-4">
            <h3 className="font-bold text-slate-900 mb-4">Trend Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Value" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Area Chart */}
          <div className="card p-4">
            <h3 className="font-bold text-slate-900 mb-4">Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" fill="#dbeafe" stroke="#3b82f6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="card p-4">
            <h3 className="font-bold text-slate-900 mb-4">Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="card p-4">
            <h3 className="font-bold text-slate-900 mb-4">Category Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'High', value: data.filter(d => d.category === 'High').length },
                    { name: 'Medium', value: data.filter(d => d.category === 'Medium').length },
                    { name: 'Low', value: data.filter(d => d.category === 'Low').length },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#ef4444" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-sm text-slate-600">Average</p>
          <p className="text-2xl font-bold text-slate-900">
            {data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length) : 0}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-slate-600">Maximum</p>
          <p className="text-2xl font-bold text-slate-900">
            {data.length > 0 ? Math.max(...data.map(d => d.value)) : 0}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-slate-600">Minimum</p>
          <p className="text-2xl font-bold text-slate-900">
            {data.length > 0 ? Math.min(...data.map(d => d.value)) : 0}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-slate-600">Data Points</p>
          <p className="text-2xl font-bold text-slate-900">{data.length}</p>
        </div>
      </div>
    </div>
  )
}

// Drill-Down Component
export function DrillDownAnalytics() {
  const [breadcrumbs, setBreadcrumbs] = useState(['Overview'])
  const [data, setData] = useState([
    { name: 'Bokaro->Dhanbad', value: 85, category: 'High Risk' },
    { name: 'Bokaro->Patna', value: 8, category: 'Low Risk' },
    { name: 'Bokaro->Kolkata', value: 12, category: 'Low Risk' },
    { name: 'Bokaro->Hatia', value: 35, category: 'Medium Risk' },
  ])

  const handleDrillDown = (item) => {
    setBreadcrumbs([...breadcrumbs, item.name])
    setData([
      { name: `${item.name} - Route A`, value: Math.random() * 100, category: 'Sub-route' },
      { name: `${item.name} - Route B`, value: Math.random() * 100, category: 'Sub-route' },
      { name: `${item.name} - Route C`, value: Math.random() * 100, category: 'Sub-route' },
    ])
  }

  const handleBreadcrumbClick = (index) => {
    setBreadcrumbs(breadcrumbs.slice(0, index + 1))
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Drill-Down Analytics</h2>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <button
              onClick={() => handleBreadcrumbClick(idx)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {crumb}
            </button>
            {idx < breadcrumbs.length - 1 && <span className="text-slate-400">/</span>}
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-4 py-2 text-left font-bold text-slate-900">Name</th>
              <th className="px-4 py-2 text-right font-bold text-slate-900">Value</th>
              <th className="px-4 py-2 text-left font-bold text-slate-900">Category</th>
              <th className="px-4 py-2 text-center font-bold text-slate-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-4 py-2 text-slate-900">{item.name}</td>
                <td className="px-4 py-2 text-right font-medium text-slate-900">{Math.round(item.value)}</td>
                <td className="px-4 py-2 text-slate-600">{item.category}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleDrillDown(item)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-xs"
                  >
                    Drill Down
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Comparative Analysis Component
export function ComparativeAnalytics() {
  const [period1, setPeriod1] = useState('last_month')
  const [period2, setPeriod2] = useState('this_month')

  const comparisonData = [
    { metric: 'Avg Delay', period1: 6.5, period2: 5.2, change: -20 },
    { metric: 'Forecast Accuracy', period1: 92, period2: 94.2, change: 2.2 },
    { metric: 'Route Efficiency', period1: 78, period2: 82, change: 5.1 },
    { metric: 'Cost per Shipment', period1: 450, period2: 420, change: -6.7 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Comparative Analysis</h2>
        <div className="flex gap-2">
          <select value={period1} onChange={(e) => setPeriod1(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
            <option value="last_month">Last Month</option>
            <option value="last_quarter">Last Quarter</option>
            <option value="last_year">Last Year</option>
          </select>
          <select value={period2} onChange={(e) => setPeriod2(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
            <option value="this_month">This Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="this_year">This Year</option>
          </select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-4 py-2 text-left font-bold text-slate-900">Metric</th>
              <th className="px-4 py-2 text-right font-bold text-slate-900">{period1}</th>
              <th className="px-4 py-2 text-right font-bold text-slate-900">{period2}</th>
              <th className="px-4 py-2 text-right font-bold text-slate-900">Change</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-4 py-2 font-medium text-slate-900">{row.metric}</td>
                <td className="px-4 py-2 text-right text-slate-600">{row.period1}</td>
                <td className="px-4 py-2 text-right text-slate-600">{row.period2}</td>
                <td className={`px-4 py-2 text-right font-bold ${row.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {row.change > 0 ? '+' : ''}{row.change}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
