import React, { useState } from 'react'
import { AuditLogViewer, ComplianceDashboard, DataProtectionSettings } from '../components/ComplianceSystem'
import { FileText, Shield, Lock } from 'lucide-react'

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState('audit')

  const tabs = [
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'protection', label: 'Data Protection', icon: Lock },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Audit & Compliance</h1>
        <p className="text-slate-600 mt-1">Monitor compliance and manage data protection policies</p>
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
        {activeTab === 'audit' && <AuditLogViewer />}
        {activeTab === 'compliance' && <ComplianceDashboard />}
        {activeTab === 'protection' && <DataProtectionSettings />}
      </div>
    </div>
  )
}
