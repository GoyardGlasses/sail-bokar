/**
 * Policy-Based Execution Dashboard - Phase 2 Feature 2
 */

import React, { useState, useEffect } from 'react'
import { Settings, CheckCircle, AlertCircle, Play, ToggleRight } from 'lucide-react'
import { useMLPredictions } from '../context/MLPredictionsContext'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'

export default function PolicyExecutionPage() {
  const { dataImported, getPrediction } = useMLPredictions()
  const [mlDecisionSupport, setMlDecisionSupport] = useState(null)
  const [status, setStatus] = useState(null)
  const [policies, setPolicies] = useState([])
  const [executions, setExecutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPolicy, setSelectedPolicy] = useState(null)

  // Get ML prediction when data is imported
  useEffect(() => {
    if (dataImported) {
      const decisionSupport = getPrediction('decision_support')
      setMlDecisionSupport(decisionSupport)
    }
  }, [dataImported, getPrediction])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const mockStatus = { status: 'running', total_policies: 4, enabled_policies: 3, total_executions: 45, timestamp: new Date().toISOString() }
      const mockPolicies = [
        { id: 'POL-001', name: 'Auto-Publish Low-Risk', type: 'auto_publish', enabled: true, conditions: [{ field: 'risk_score', operator: '<', value: 0.2 }], action: 'publish_plan', execution_count: 12 },
        { id: 'POL-002', name: 'Auto-Mitigate High-Severity', type: 'auto_mitigate', enabled: true, conditions: [{ field: 'severity', operator: '==', value: 'high' }], action: 'apply_mitigation', execution_count: 8 },
        { id: 'POL-003', name: 'Auto-Escalate Critical', type: 'auto_escalate', enabled: true, conditions: [{ field: 'status', operator: '==', value: 'critical' }], action: 'escalate_issue', execution_count: 5 },
      ]
      const mockExecutions = [
        { id: 'EXEC-001', policy_id: 'POL-001', status: 'success', timestamp: new Date().toISOString() },
      ]

      try {
        const [statusRes, policiesRes, executionsRes] = await Promise.all([
          fetch('/api/policies/status').catch(() => null),
          fetch('/api/policies/policies').catch(() => null),
          fetch('/api/policies/executions').catch(() => null),
        ])

        const statusData = statusRes ? await statusRes.json() : mockStatus
        const policiesData = policiesRes ? await policiesRes.json() : { policies: mockPolicies }
        const executionsData = executionsRes ? await executionsRes.json() : { executions: mockExecutions }

        setStatus(statusData || mockStatus)
        setPolicies((policiesData?.policies) || mockPolicies)
        setExecutions((executionsData?.executions) || mockExecutions)
      } catch {
        setStatus(mockStatus)
        setPolicies(mockPolicies)
        setExecutions(mockExecutions)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const togglePolicy = async (policyId, enabled) => {
    try {
      const res = await fetch(`/api/policies/policies/${policyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled })
      })
      const data = await res.json()
      
      if (data.id) {
        alert(`✓ Policy ${!enabled ? 'enabled' : 'disabled'}!`)
        await fetchData()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error updating policy')
    }
  }

  const getPolicyTypeColor = (type) => {
    const colors = {
      'auto_publish': 'bg-green-100 text-green-700',
      'auto_alert': 'bg-yellow-100 text-yellow-700',
      'auto_mitigate': 'bg-blue-100 text-blue-700',
      'auto_escalate': 'bg-red-100 text-red-700',
      'auto_execute': 'bg-purple-100 text-purple-700',
    }
    return colors[type] || 'bg-slate-100 text-slate-700'
  }

  let decisionSnapshot = null
  if (mlDecisionSupport && typeof mlDecisionSupport === 'object') {
    const raw = Array.isArray(mlDecisionSupport) ? mlDecisionSupport[0] : mlDecisionSupport
    if (raw && typeof raw === 'object') {
      const action = raw.recommended_action || raw.action || null
      const expectedCost = Number(raw.expected_cost ?? raw.cost ?? 0)
      const expectedTime = Number(raw.expected_delivery_time ?? raw.time ?? 0)
      const successProbRaw = Number(raw.expected_success_probability ?? raw.success_probability ?? 0)
      const successProb = Number.isFinite(successProbRaw)
        ? (successProbRaw <= 1 ? successProbRaw * 100 : successProbRaw)
        : null

      if (action || Number.isFinite(expectedCost) || Number.isFinite(expectedTime) || successProb != null) {
        decisionSnapshot = {
          action,
          expectedCost: Number.isFinite(expectedCost) && expectedCost > 0 ? expectedCost : null,
          expectedTime: Number.isFinite(expectedTime) && expectedTime > 0 ? expectedTime : null,
          successProb,
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Settings className="mx-auto text-blue-600 mb-4 animate-spin" size={48} />
          <p className="text-slate-600 dark:text-slate-400">Loading policies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Policy-Based Execution
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Automatic execution based on policies and conditions
          </p>
        </div>
      </div>

      <InlineDataImport templateId="operations" />

      {decisionSnapshot && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {decisionSnapshot.action && (
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">ML Recommended Action</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-50 mt-1">
                {decisionSnapshot.action.toString().replace(/_/g, ' ')}
              </p>
            </div>
          )}
          {decisionSnapshot.expectedCost != null && (
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">Expected Cost</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
                ₹{Math.round(decisionSnapshot.expectedCost).toLocaleString()}
              </p>
            </div>
          )}
          {decisionSnapshot.successProb != null && (
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">Success Probability</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {decisionSnapshot.successProb.toFixed(0)}%
              </p>
            </div>
          )}
        </div>
      )}

      {/* Status Cards */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Policies</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {status.total_policies}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Enabled</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {status.enabled_policies}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Executions</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              {status.total_executions}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
            <p className="text-sm font-bold text-green-600 mt-2">
              {status.status === 'running' ? '🟢 Running' : '🔴 Stopped'}
            </p>
          </div>
        </div>
      )}

      {/* Policies List */}
      <div className="card">
        <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
          <Settings size={20} />
          Active Policies
        </h3>
        {policies.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">No policies defined</p>
        ) : (
          <div className="space-y-3">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="border border-slate-200 dark:border-slate-700 rounded p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                onClick={() => setSelectedPolicy(policy)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">
                      {policy.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      ID: {policy.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getPolicyTypeColor(policy.type)}`}>
                      {policy.type.replace(/_/g, ' ')}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        togglePolicy(policy.id, policy.enabled)
                      }}
                      className={`p-2 rounded transition-colors ${
                        policy.enabled
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <ToggleRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <p className="mb-2">
                    <span className="font-semibold">Action:</span> {policy.action}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Conditions:</span> {policy.conditions.length}
                  </p>
                  <p>
                    <span className="font-semibold">Executions:</span> {policy.execution_count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Executions */}
      <div className="card">
        <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
          <Play size={20} />
          Recent Executions
        </h3>
        {executions.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">No executions yet</p>
        ) : (
          <div className="space-y-3">
            {executions.slice(-10).reverse().map((execution) => (
              <div
                key={execution.id}
                className="border border-slate-200 dark:border-slate-700 rounded p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">
                      {execution.id}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Policy: {execution.policy_id}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
                    {execution.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {new Date(execution.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Policy Details Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                  {selectedPolicy.name}
                </h3>
                <button
                  onClick={() => setSelectedPolicy(null)}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Policy ID
                  </p>
                  <p className="text-slate-900 dark:text-slate-50">{selectedPolicy.id}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Type
                  </p>
                  <p className="text-slate-900 dark:text-slate-50">{selectedPolicy.type}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    Conditions
                  </p>
                  <div className="space-y-2">
                    {selectedPolicy.conditions.map((cond, idx) => (
                      <div key={idx} className="bg-slate-100 dark:bg-slate-900 p-2 rounded text-sm">
                        <p className="text-slate-900 dark:text-slate-50">
                          {cond.field} {cond.operator} {JSON.stringify(cond.value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Action
                  </p>
                  <p className="text-slate-900 dark:text-slate-50">{selectedPolicy.action}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Executions
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                      {selectedPolicy.execution_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Status
                    </p>
                    <p className={`text-lg font-bold ${selectedPolicy.enabled ? 'text-green-600' : 'text-slate-600'}`}>
                      {selectedPolicy.enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
