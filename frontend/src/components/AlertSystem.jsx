import React, { useState, useEffect } from 'react'
import { AlertCircle, Bell, Settings, BarChart3, Trash2, Plus, Check, X, Send } from 'lucide-react'
import { getAlerts, getAlertRules, acknowledgeAlert, resolveAlert, createAlertRule, deleteAlertRule, getAlertStats } from '../api/alertApi'

// Alert Dashboard Component
export function AlertDashboard() {
  const [alerts, setAlerts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadAlerts()
  }, [filter])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const [alertsData, statsData] = await Promise.all([
        getAlerts(filter === 'all' ? undefined : filter),
        getAlertStats(),
      ])
      setAlerts(alertsData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledge = async (alertId) => {
    try {
      await acknowledgeAlert(alertId, 'admin@example.com')
      loadAlerts()
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  const handleResolve = async (alertId) => {
    try {
      await resolveAlert(alertId)
      loadAlerts()
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }

  const severityColors = {
    critical: 'bg-red-100 text-red-900 border-red-300',
    high: 'bg-orange-100 text-orange-900 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    low: 'bg-blue-100 text-blue-900 border-blue-300',
  }

  const statusBadge = {
    active: 'bg-red-200 text-red-800',
    acknowledged: 'bg-yellow-200 text-yellow-800',
    resolved: 'bg-green-200 text-green-800',
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Alert Dashboard</h2>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="card">
            <p className="text-sm text-slate-600">Total Alerts</p>
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600">Active</p>
            <p className="text-3xl font-bold text-red-600">{stats.active}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600">Acknowledged</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.acknowledged}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600">Resolved</p>
            <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600">Critical</p>
            <p className="text-3xl font-bold text-red-700">{stats.bySeverity.critical}</p>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {['all', 'active', 'acknowledged', 'resolved'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-slate-600">No alerts found</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className={`card border-l-4 p-4 ${severityColors[alert.severity]}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={20} />
                    <h3 className="font-bold">{alert.ruleName}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusBadge[alert.status]}`}>
                      {alert.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{alert.message}</p>
                  <p className="text-xs opacity-75">
                    {alert.metric}: {alert.value} (threshold: {alert.threshold}) • {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {alert.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                        title="Acknowledge"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        title="Resolve"
                      >
                        <X size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Alert Rules Engine Component
export function AlertRulesEngine() {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    metric: 'delay_risk',
    condition: 'greater_than',
    threshold: 70,
    severity: 'high',
    channels: ['email'],
    enabled: true,
  })

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    setLoading(true)
    try {
      const rulesData = await getAlertRules()
      setRules(rulesData)
    } catch (error) {
      console.error('Failed to load rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRule = async () => {
    try {
      await createAlertRule(formData)
      loadRules()
      setShowForm(false)
      setFormData({
        name: '',
        description: '',
        metric: 'delay_risk',
        condition: 'greater_than',
        threshold: 70,
        severity: 'high',
        channels: ['email'],
        enabled: true,
      })
    } catch (error) {
      console.error('Failed to create rule:', error)
    }
  }

  const handleDeleteRule = async (id) => {
    try {
      await deleteAlertRule(id)
      loadRules()
    } catch (error) {
      console.error('Failed to delete rule:', error)
    }
  }

  const channelOptions = ['email', 'sms', 'push', 'slack', 'webhook']
  const metricOptions = ['delay_risk', 'forecast_confidence', 'equipment_failure_risk', 'anomaly_score', 'cost_variance']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Alert Rules</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          <Plus size={18} className="inline mr-2" />
          New Rule
        </button>
      </div>

      {showForm && (
        <div className="card space-y-4 p-6 bg-blue-50">
          <h3 className="font-bold text-slate-900">Create Alert Rule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Rule name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg"
            />
            <select
              value={formData.metric}
              onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg"
            >
              {metricOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="greater_than">Greater Than</option>
              <option value="less_than">Less Than</option>
              <option value="equals">Equals</option>
              <option value="between">Between</option>
            </select>
            <input
              type="number"
              placeholder="Threshold"
              value={formData.threshold}
              onChange={(e) => setFormData({ ...formData, threshold: parseFloat(e.target.value) })}
              className="px-3 py-2 border border-slate-300 rounded-lg"
            />
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <div className="flex gap-2">
              {channelOptions.map((ch) => (
                <label key={ch} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.channels.includes(ch)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, channels: [...formData.channels, ch] })
                      } else {
                        setFormData({ ...formData, channels: formData.channels.filter(c => c !== ch) })
                      }
                    }}
                  />
                  <span className="text-sm">{ch}</span>
                </label>
              ))}
            </div>
          </div>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            rows="3"
          />
          <div className="flex gap-2">
            <button onClick={handleCreateRule} className="btn btn-primary">
              Create Rule
            </button>
            <button onClick={() => setShowForm(false)} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : rules.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-slate-600">No alert rules configured</p>
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-slate-900">{rule.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      rule.enabled ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'
                    }`}>
                      {rule.enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{rule.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-slate-100 px-2 py-1 rounded">{rule.metric}</span>
                    <span className="bg-slate-100 px-2 py-1 rounded">{rule.condition}</span>
                    <span className="bg-slate-100 px-2 py-1 rounded">{rule.threshold}</span>
                    <span className={`px-2 py-1 rounded ${
                      rule.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      rule.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      rule.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {rule.severity}
                    </span>
                    {rule.channels.map((ch) => (
                      <span key={ch} className="bg-purple-100 text-purple-800 px-2 py-1 rounded">{ch}</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Notification Center Component
export function NotificationCenter() {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'alert', title: 'High Delay Risk', message: 'Bokaro->Dhanbad: 85% risk', time: '5 min ago', read: false },
    { id: 2, type: 'warning', title: 'Equipment Maintenance', message: 'Fleet A needs maintenance', time: '15 min ago', read: false },
    { id: 3, type: 'info', title: 'Forecast Updated', message: 'New forecast available', time: '1 hour ago', read: true },
  ])

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-900">Notifications</h3>
        <button onClick={clearAll} className="text-sm text-blue-600 hover:text-blue-700">
          Clear All
        </button>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-slate-600 text-center py-4">No notifications</p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 rounded-lg border-l-4 cursor-pointer transition-colors ${
                notif.read ? 'bg-slate-50 border-slate-300' : 'bg-blue-50 border-blue-500'
              }`}
              onClick={() => markAsRead(notif.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-slate-900">{notif.title}</p>
                  <p className="text-sm text-slate-600">{notif.message}</p>
                </div>
                <span className="text-xs text-slate-500">{notif.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Alert Settings Component
export function AlertSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    slackNotifications: true,
    webhookUrl: '',
    quietHours: { enabled: false, start: '22:00', end: '08:00' },
    escalationEnabled: true,
    escalationMinutes: 30,
  })

  const handleSave = () => {
    localStorage.setItem('alertSettings', JSON.stringify(settings))
    alert('Settings saved successfully!')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Alert Settings</h2>

      <div className="card space-y-6 p-6">
        {/* Notification Channels */}
        <div>
          <h3 className="font-bold text-slate-900 mb-4">Notification Channels</h3>
          <div className="space-y-3">
            {[
              { key: 'emailNotifications', label: 'Email Notifications' },
              { key: 'smsNotifications', label: 'SMS Notifications' },
              { key: 'pushNotifications', label: 'Push Notifications' },
              { key: 'slackNotifications', label: 'Slack Notifications' },
            ].map((channel) => (
              <label key={channel.key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings[channel.key]}
                  onChange={(e) => setSettings({ ...settings, [channel.key]: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-slate-900">{channel.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Webhook Configuration */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Webhook URL</label>
          <input
            type="url"
            value={settings.webhookUrl}
            onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
            placeholder="https://example.com/webhook"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
          />
        </div>

        {/* Quiet Hours */}
        <div>
          <label className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              checked={settings.quietHours.enabled}
              onChange={(e) => setSettings({
                ...settings,
                quietHours: { ...settings.quietHours, enabled: e.target.checked }
              })}
              className="w-4 h-4"
            />
            <span className="text-slate-900 font-medium">Enable Quiet Hours</span>
          </label>
          {settings.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4 ml-7">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Start Time</label>
                <input
                  type="time"
                  value={settings.quietHours.start}
                  onChange={(e) => setSettings({
                    ...settings,
                    quietHours: { ...settings.quietHours, start: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">End Time</label>
                <input
                  type="time"
                  value={settings.quietHours.end}
                  onChange={(e) => setSettings({
                    ...settings,
                    quietHours: { ...settings.quietHours, end: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        {/* Alert Escalation */}
        <div>
          <label className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              checked={settings.escalationEnabled}
              onChange={(e) => setSettings({ ...settings, escalationEnabled: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-slate-900 font-medium">Enable Alert Escalation</span>
          </label>
          {settings.escalationEnabled && (
            <div className="ml-7">
              <label className="block text-sm text-slate-600 mb-2">Escalate After (minutes)</label>
              <input
                type="number"
                value={settings.escalationMinutes}
                onChange={(e) => setSettings({ ...settings, escalationMinutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          )}
        </div>

        <button onClick={handleSave} className="btn btn-primary w-full">
          Save Settings
        </button>
      </div>
    </div>
  )
}
