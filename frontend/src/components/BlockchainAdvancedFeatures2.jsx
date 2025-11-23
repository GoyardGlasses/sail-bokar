import React, { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts'
import { TrendingUp, AlertCircle, CheckCircle, Download, Link2, Key, Activity } from 'lucide-react'

// ============ ADVANCED ANALYTICS ============
export function AdvancedAnalytics() {
  const eventFrequencyData = [
    { date: 'Mon', events: 145 },
    { date: 'Tue', events: 168 },
    { date: 'Wed', events: 152 },
    { date: 'Thu', events: 189 },
    { date: 'Fri', events: 201 },
    { date: 'Sat', events: 98 },
    { date: 'Sun', events: 87 },
  ]

  const actorPerformance = [
    { actor: 'Yard Manager', dispatches: 245, successRate: 98.5, avgTime: '2.3h' },
    { actor: 'Loader Op', dispatches: 198, successRate: 97.8, avgTime: '2.1h' },
    { actor: 'Dispatch Officer', dispatches: 267, successRate: 99.2, avgTime: '1.9h' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Advanced Analytics</h3>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Event Frequency Analysis</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={eventFrequencyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="events" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Actor Performance Metrics</p>
        <div className="space-y-3">
          {actorPerformance.map((a, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded">
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium text-slate-900">{a.actor}</p>
                <span className="text-xs font-bold text-green-600">{a.successRate}% success</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-slate-600">Dispatches</p>
                  <p className="font-bold text-slate-900">{a.dispatches}</p>
                </div>
                <div>
                  <p className="text-slate-600">Avg Time</p>
                  <p className="font-bold text-slate-900">{a.avgTime}</p>
                </div>
                <div>
                  <p className="text-slate-600">Success Rate</p>
                  <p className="font-bold text-slate-900">{a.successRate}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Avg Dispatch Success</p>
          <p className="text-3xl font-bold text-green-600 mt-2">98.5%</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Peak Event Hour</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">14:00</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Anomalies Detected</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">3</p>
        </div>
      </div>
    </div>
  )
}

// ============ BLOCKCHAIN NETWORK HEALTH ============
export function BlockchainNetworkHealth() {
  const networkData = [
    { time: '20:00', latency: 45, throughput: 850 },
    { time: '20:15', latency: 52, throughput: 920 },
    { time: '20:30', latency: 48, throughput: 1050 },
    { time: '20:45', latency: 55, throughput: 980 },
    { time: '21:00', latency: 50, throughput: 1120 },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Blockchain Network Health</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="card p-4 bg-green-50 border-l-4 border-green-500">
          <p className="text-sm text-slate-600">Network Status</p>
          <p className="text-lg font-bold text-green-600 mt-2">✓ Healthy</p>
          <p className="text-xs text-slate-600 mt-1">All systems operational</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-600">Avg Latency</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">50ms</p>
          <p className="text-xs text-green-600 mt-1">↓ 2% from avg</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-600">Throughput</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">980 tx/s</p>
          <p className="text-xs text-green-600 mt-1">↑ 5% from avg</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-600">Block Time</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">12.3s</p>
          <p className="text-xs text-green-600 mt-1">Optimal</p>
        </div>
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Network Performance</p>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={networkData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis yAxisId="left" label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Throughput (tx/s)', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="latency" stroke="#ef4444" strokeWidth={2} name="Latency" />
            <Area yAxisId="right" type="monotone" dataKey="throughput" fill="#10b981" stroke="#059669" opacity={0.6} name="Throughput" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ============ HISTORICAL COMPARISON ============
export function HistoricalComparison() {
  const [comparison, setComparison] = useState('weekly')

  const weeklyData = [
    { week: 'Week 1', avgTime: 2.3, successRate: 97.8, cost: 1200 },
    { week: 'Week 2', avgTime: 2.1, successRate: 98.2, cost: 1150 },
    { week: 'Week 3', avgTime: 1.9, successRate: 98.5, cost: 1100 },
    { week: 'Week 4', avgTime: 1.8, successRate: 99.1, cost: 1050 },
  ]

  const monthlyData = [
    { month: 'Sep', avgTime: 2.8, successRate: 96.5, cost: 4800 },
    { month: 'Oct', avgTime: 2.4, successRate: 97.8, cost: 4500 },
    { month: 'Nov', avgTime: 2.0, successRate: 98.7, cost: 4200 },
  ]

  const data = comparison === 'weekly' ? weeklyData : monthlyData

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Historical Comparison & Patterns</h3>

      <div className="flex gap-2 mb-4">
        {['weekly', 'monthly'].map(comp => (
          <button
            key={comp}
            onClick={() => setComparison(comp)}
            className={`px-4 py-2 rounded font-medium transition-all ${
              comparison === comp
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
            }`}
          >
            {comp === 'weekly' ? 'Weekly' : 'Monthly'}
          </button>
        ))}
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Performance Trends</p>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={comparison === 'weekly' ? 'week' : 'month'} />
            <YAxis yAxisId="left" label={{ value: 'Avg Time (h)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Success Rate (%)', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="avgTime" stroke="#3b82f6" strokeWidth={2} name="Avg Time" />
            <Line yAxisId="right" type="monotone" dataKey="successRate" stroke="#10b981" strokeWidth={2} name="Success Rate" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Improvement Trend</p>
          <p className="text-3xl font-bold text-green-600 mt-2">↓ 21.7%</p>
          <p className="text-xs text-slate-600 mt-1">Avg dispatch time</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Success Rate Trend</p>
          <p className="text-3xl font-bold text-green-600 mt-2">↑ 2.6%</p>
          <p className="text-xs text-slate-600 mt-1">Overall improvement</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Cost Reduction</p>
          <p className="text-3xl font-bold text-green-600 mt-2">↓ 12.5%</p>
          <p className="text-xs text-slate-600 mt-1">Cost per dispatch</p>
        </div>
      </div>
    </div>
  )
}

// ============ INTEGRATION & WEBHOOKS ============
export function IntegrationWebhooks() {
  const [integrations] = useState([
    { id: 'INT001', name: 'ERP System', status: 'connected', lastSync: '2 min ago', events: 1247 },
    { id: 'INT002', name: 'Email Notifications', status: 'connected', lastSync: '5 min ago', events: 856 },
    { id: 'INT003', name: 'SMS Gateway', status: 'connected', lastSync: '1 min ago', events: 523 },
    { id: 'INT004', name: 'Analytics Platform', status: 'connected', lastSync: '30 sec ago', events: 2100 },
  ])

  const webhooks = [
    { event: 'dispatch_created', url: 'https://api.example.com/webhooks/dispatch', active: true, lastTriggered: '20:45:30' },
    { event: 'delivery_completed', url: 'https://api.example.com/webhooks/delivery', active: true, lastTriggered: '20:30:15' },
    { event: 'payment_processed', url: 'https://api.example.com/webhooks/payment', active: true, lastTriggered: '20:15:45' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Integration & Webhooks</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-sm font-medium text-slate-900 mb-3">Connected Integrations</p>
          <div className="space-y-2">
            {integrations.map((i) => (
              <div key={i.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <div>
                  <p className="text-sm font-medium text-slate-900">{i.name}</p>
                  <p className="text-xs text-slate-600">Last sync: {i.lastSync}</p>
                </div>
                <span className="flex items-center gap-1 text-green-600 font-semibold text-xs">
                  <CheckCircle size={14} /> {i.events} events
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <p className="text-sm font-medium text-slate-900 mb-3">Active Webhooks</p>
          <div className="space-y-2">
            {webhooks.map((w, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <div>
                  <p className="text-sm font-medium text-slate-900">{w.event}</p>
                  <p className="text-xs text-slate-600 truncate">{w.url}</p>
                </div>
                {w.active && <CheckCircle size={16} className="text-green-600 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Connected Systems</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{integrations.length}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Active Webhooks</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{webhooks.filter(w => w.active).length}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Total Events Synced</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{integrations.reduce((a, i) => a + i.events, 0).toLocaleString()}</p>
        </div>
      </div>

      <button className="w-full btn btn-secondary">
        <Key size={18} className="mr-2" />
        Manage API Keys
      </button>
    </div>
  )
}

// ============ DISPUTE RESOLUTION ============
export function DisputeResolution() {
  const [disputes] = useState([
    { id: 'DISP001', rake: 'R001', type: 'Delivery Mismatch', status: 'open', filed: '2025-11-23T18:00:00Z', evidence: 2 },
    { id: 'DISP002', rake: 'R002', type: 'Quality Issue', status: 'resolved', filed: '2025-11-22T14:30:00Z', evidence: 3 },
    { id: 'DISP003', rake: 'R003', type: 'Delay Claim', status: 'under_review', filed: '2025-11-23T16:45:00Z', evidence: 1 },
  ])

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Dispute Resolution</h3>

      <div className="space-y-3">
        {disputes.map((d) => (
          <div key={d.id} className="card p-4 border-l-4 border-orange-500">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-bold text-slate-900">{d.type}</p>
                <p className="text-xs text-slate-600 mt-1">{d.id} • Rake: {d.rake}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                d.status === 'resolved' ? 'bg-green-100 text-green-800' :
                d.status === 'open' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {d.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600 mt-3">
              <p>Filed: {new Date(d.filed).toLocaleString()}</p>
              <p>{d.evidence} evidence items</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Total Disputes</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{disputes.length}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Open</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{disputes.filter(d => d.status === 'open').length}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Under Review</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{disputes.filter(d => d.status === 'under_review').length}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Resolved</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{disputes.filter(d => d.status === 'resolved').length}</p>
        </div>
      </div>

      <button className="w-full btn btn-secondary">
        <Activity size={18} className="mr-2" />
        File New Dispute
      </button>
    </div>
  )
}
