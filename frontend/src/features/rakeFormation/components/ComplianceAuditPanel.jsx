import React, { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Clock, Shield, FileText, BarChart3 } from 'lucide-react'

/**
 * Compliance & Audit Panel Component
 * Displays compliance status, audit trails, and regulatory requirements
 */
export default function ComplianceAuditPanel() {
  const [activeTab, setActiveTab] = useState('compliance')
  const [complianceScore, setComplianceScore] = useState(0)
  const [violations, setViolations] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [regulations, setRegulations] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadComplianceData()
  }, [activeTab])

  const loadComplianceData = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Generate compliance score
      setComplianceScore(92)

      // Generate violations
      setViolations([
        {
          id: 1,
          rule: 'Loading Time Limit',
          severity: 'high',
          timestamp: '2024-12-02 14:30',
          entity: 'RAKE-001',
          description: 'Loading time exceeded 8 hours limit',
          status: 'open',
        },
        {
          id: 2,
          rule: 'Cost Limit',
          severity: 'medium',
          timestamp: '2024-12-02 10:15',
          entity: 'RAKE-002',
          description: 'Cost per tonne exceeded budget',
          status: 'acknowledged',
        },
        {
          id: 3,
          rule: 'SLA Compliance',
          severity: 'high',
          timestamp: '2024-12-01 18:45',
          entity: 'RAKE-003',
          description: 'Dispatch did not meet SLA deadline',
          status: 'resolved',
        },
      ])

      // Generate audit logs
      setAuditLogs([
        {
          id: 1,
          action: 'Rake Created',
          user: 'admin@company.com',
          entity: 'RAKE-001',
          timestamp: '2024-12-02 09:00',
          status: 'success',
        },
        {
          id: 2,
          action: 'Rake Approved',
          user: 'manager@company.com',
          entity: 'RAKE-001',
          timestamp: '2024-12-02 09:30',
          status: 'success',
        },
        {
          id: 3,
          action: 'Dispatch Started',
          user: 'driver@company.com',
          entity: 'RAKE-001',
          timestamp: '2024-12-02 10:00',
          status: 'success',
        },
        {
          id: 4,
          action: 'Compliance Check Failed',
          user: 'system',
          entity: 'RAKE-002',
          timestamp: '2024-12-02 14:30',
          status: 'failure',
        },
      ])

      // Generate regulations
      setRegulations([
        {
          id: 1,
          regulation: 'Indian Railways Act',
          requirement: 'Rake formation must follow railway guidelines',
          status: 'compliant',
          deadline: '2024-12-31',
        },
        {
          id: 2,
          regulation: 'Motor Vehicles Act',
          requirement: 'All vehicles must have valid registration',
          status: 'compliant',
          deadline: '2024-12-31',
        },
        {
          id: 3,
          regulation: 'Environmental Protection Act',
          requirement: 'Emissions must meet pollution standards',
          status: 'compliant',
          deadline: '2024-12-31',
        },
        {
          id: 4,
          regulation: 'Occupational Safety',
          requirement: 'Workers must have safety training',
          status: 'in-progress',
          deadline: '2024-12-31',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant':
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'open':
      case 'failure':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'acknowledged':
      case 'in-progress':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      default:
        return <Shield className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Compliance & Audit
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor compliance status, violations, and audit trails
        </p>
      </div>

      {/* Compliance Score */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-green-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Compliance Score</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {complianceScore}
              <span className="text-lg text-gray-600 dark:text-gray-400">/100</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Grade: A (Excellent)</p>
          </div>
          <div className="text-right">
            <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border-4 border-green-500">
              <span className="text-2xl font-bold text-green-600">92%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'compliance', label: 'Violations', icon: AlertTriangle },
          { id: 'audit', label: 'Audit Trail', icon: FileText },
          { id: 'regulations', label: 'Regulations', icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        ) : activeTab === 'compliance' ? (
          <ViolationsView violations={violations} getSeverityColor={getSeverityColor} />
        ) : activeTab === 'audit' ? (
          <AuditTrailView logs={auditLogs} getStatusIcon={getStatusIcon} />
        ) : (
          <RegulationsView regulations={regulations} getStatusIcon={getStatusIcon} />
        )}
      </div>
    </div>
  )
}

/**
 * Violations View
 */
function ViolationsView({ violations, getSeverityColor }) {
  return (
    <div className="space-y-3">
      {violations.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">No violations found</p>
        </div>
      ) : (
        violations.map((violation) => (
          <div
            key={violation.id}
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {violation.rule}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {violation.timestamp}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded ${getSeverityColor(violation.severity)}`}>
                {violation.severity.toUpperCase()}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {violation.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-500">
                Entity: {violation.entity}
              </span>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  violation.status === 'open'
                    ? 'bg-red-100 text-red-800'
                    : violation.status === 'acknowledged'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                }`}
              >
                {violation.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

/**
 * Audit Trail View
 */
function AuditTrailView({ logs, getStatusIcon }) {
  return (
    <div className="space-y-2">
      {logs.map((log, idx) => (
        <div
          key={log.id}
          className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex-shrink-0 mt-1">{getStatusIcon(log.status)}</div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">{log.action}</h3>
              <span className="text-xs text-gray-500 dark:text-gray-500">{log.timestamp}</span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              By: {log.user} | Entity: {log.entity}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Regulations View
 */
function RegulationsView({ regulations, getStatusIcon }) {
  return (
    <div className="space-y-3">
      {regulations.map((reg) => (
        <div
          key={reg.id}
          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-3">
              {getStatusIcon(reg.status)}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {reg.regulation}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {reg.requirement}
                </p>
              </div>
            </div>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded whitespace-nowrap ${
                reg.status === 'compliant'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {reg.status.toUpperCase()}
            </span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-500">
            Deadline: {reg.deadline}
          </p>
        </div>
      ))}
    </div>
  )
}
