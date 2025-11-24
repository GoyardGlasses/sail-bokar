/**
 * Constraints Management Dashboard
 * Operational and business constraint management
 */

import React, { useState } from 'react'
import { AlertCircle, CheckCircle, Lock, Zap } from 'lucide-react'

export default function ConstraintsManagementDashboard() {
  const [activeTab, setActiveTab] = useState<'constraints' | 'violations' | 'rules'>('constraints')

  const mockConstraints = [
    {
      id: 'c-001',
      name: 'Min Rake Size',
      type: 'capacity',
      severity: 'critical',
      status: 'active',
      rule: 'Minimum 300 tonnes per rake',
    },
    {
      id: 'c-002',
      name: 'Loading Point Capacity',
      type: 'capacity',
      severity: 'high',
      status: 'active',
      rule: 'Max 500 tonnes per loading point',
    },
    {
      id: 'c-003',
      name: 'Siding Availability',
      type: 'resource',
      severity: 'high',
      status: 'active',
      rule: '8 sidings available for operations',
    },
  ]

  const mockViolations = [
    {
      id: 'v-001',
      constraint: 'Min Rake Size',
      severity: 'warning',
      message: 'Rake RK-045 below minimum size (280 tonnes)',
    },
  ]

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Constraints Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage operational and business constraints
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Lock size={18} />
          Add Constraint
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Active Constraints</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {mockConstraints.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All critical</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Violations</p>
          <p className="text-2xl font-bold text-red-600">{mockViolations.length}</p>
          <p className="text-xs text-red-600 mt-1">1 warning</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Compliance Rate</p>
          <p className="text-2xl font-bold text-green-600">98.5%</p>
          <p className="text-xs text-green-600 mt-1">↑ +0.5%</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Critical Issues</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">0</p>
          <p className="text-xs text-green-600 mt-1">All resolved</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'constraints', label: 'Constraints', icon: Lock },
          { id: 'violations', label: 'Violations', icon: AlertCircle },
          { id: 'rules', label: 'Rules', icon: Zap },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`px-4 py-2 font-medium flex items-center gap-2 border-b-2 transition ${
              activeTab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 dark:text-slate-400'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'constraints' && (
          <div className="space-y-3">
            {mockConstraints.map((constraint) => (
              <div key={constraint.id} className="card border-l-4 border-blue-500">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-50">
                      {constraint.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {constraint.rule}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      constraint.severity === 'critical'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {constraint.severity.toUpperCase()}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <CheckCircle size={14} className="text-green-600" />
                  Status: {constraint.status}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'violations' && (
          <div className="space-y-3">
            {mockViolations.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto text-green-600 mb-3" size={32} />
                <p className="text-slate-600 dark:text-slate-400">No violations detected</p>
              </div>
            ) : (
              mockViolations.map((violation) => (
                <div key={violation.id} className="card border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
                  <p className="font-bold text-slate-900 dark:text-slate-50">{violation.constraint}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{violation.message}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="card">
            <p className="text-slate-600 dark:text-slate-400 text-center py-8">
              Rules management coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
