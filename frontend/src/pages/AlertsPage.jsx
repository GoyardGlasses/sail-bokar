import React, { useState } from 'react'
import { AlertDashboard, AlertRulesEngine, NotificationCenter, AlertSettings } from '../components/AlertSystem'
import { Bell, Settings, BarChart3, Zap } from 'lucide-react'

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'rules', label: 'Rules', icon: Zap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Real-Time Alerts & Notifications</h1>
        <p className="text-slate-600 mt-1">Manage alerts, rules, and notification settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        {tabs.map((tab) => {
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
              <Icon size={20} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'dashboard' && <AlertDashboard />}
        {activeTab === 'rules' && <AlertRulesEngine />}
        {activeTab === 'notifications' && (
          <div className="card p-6">
            <NotificationCenter />
          </div>
        )}
        {activeTab === 'settings' && <AlertSettings />}
      </div>
    </div>
  )
}
