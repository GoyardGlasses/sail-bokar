import React, { useState, useEffect, useMemo } from 'react'
import { Lock, CheckCircle, AlertCircle, Search, AlertTriangle, Code, Users, Zap, Shield, TrendingUp, Activity, Link2, Layers } from 'lucide-react'
import AuditTable from '../components/AuditTable'
import {
  SmartContractManagement,
  MultiSignatureAuthorization,
  RealTimeEventStreaming,
  ConsensusMechanismVisualization,
  DataIntegrityVerification,
  ComplianceRegulatory,
} from '../components/BlockchainAdvancedFeatures'
import {
  AdvancedAnalytics,
  BlockchainNetworkHealth,
  HistoricalComparison,
  IntegrationWebhooks,
  DisputeResolution,
} from '../components/BlockchainAdvancedFeatures2'
import { fetchBlockchainAuditTrail, verifyTransaction, getBlockchainStats } from '../api/blockchainApi'
import { useMLPredictions } from '../context/MLPredictionsContext'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'

export default function BlockchainPage() {
  const [activeTab, setActiveTab] = useState('audit')
  const [rakeId, setRakeId] = useState('SAIL-R001')
  const [searchRakeId, setSearchRakeId] = useState('')
  const [auditData, setAuditData] = useState(null)
  const [blockchainStats, setBlockchainStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [blockchainConfigured, setBlockchainConfigured] = useState(true)
  const { dataImported, getPrediction } = useMLPredictions()
  const [mlRisk, setMlRisk] = useState(null)
  const [mlAnomaly, setMlAnomaly] = useState(null)

  useEffect(() => {
    loadBlockchainStats()
    loadAuditTrail(rakeId)
  }, [])

  useEffect(() => {
    if (!dataImported) return

    try {
      const risk = getPrediction('risk_assessment')
      const anomaly = getPrediction('anomaly_detection')
      setMlRisk(risk)
      setMlAnomaly(anomaly)
    } catch (err) {
      console.error('Error reading ML predictions for blockchain:', err)
    }
  }, [dataImported, getPrediction])

  const mlSecuritySummary = useMemo(() => {
    if (!mlRisk && !mlAnomaly) return null

    const parseNumber = (raw) => {
      if (raw == null) return null
      if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null
      if (typeof raw === 'string') {
        const n = Number(raw)
        return Number.isFinite(n) ? n : null
      }
      if (typeof raw === 'object') {
        if (typeof raw.score === 'number') return raw.score
        if (typeof raw.risk_score === 'number') return raw.risk_score
        if (typeof raw.value === 'number') return raw.value
      }
      return null
    }

    const riskScoreRaw = Array.isArray(mlRisk) ? mlRisk[0] : mlRisk
    const anomalyRaw = Array.isArray(mlAnomaly) ? mlAnomaly[0] : mlAnomaly

    const riskScoreVal = parseNumber(riskScoreRaw)
    const anomalyCountVal = parseNumber(
      anomalyRaw && typeof anomalyRaw === 'object' && 'anomaly_count' in anomalyRaw
        ? anomalyRaw.anomaly_count
        : anomalyRaw
    )

    if (riskScoreVal == null && anomalyCountVal == null) return null

    const riskPct = riskScoreVal != null
      ? (riskScoreVal <= 1 ? riskScoreVal * 100 : riskScoreVal)
      : null

    return {
      riskPct,
      anomalyCount: anomalyCountVal,
    }
  }, [mlRisk, mlAnomaly])

  const loadBlockchainStats = async () => {
    try {
      const stats = await getBlockchainStats()
      setBlockchainStats(stats)
    } catch (error) {
      console.error('Error fetching blockchain stats:', error)
      setBlockchainConfigured(false)
    }
  }

  const loadAuditTrail = async (id) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchBlockchainAuditTrail(id)
      setAuditData(data)
    } catch (error) {
      setError('Failed to load audit trail: ' + error.message)
      console.error('Error fetching audit trail:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchRake = () => {
    if (searchRakeId.trim()) {
      setRakeId(searchRakeId)
      loadAuditTrail(searchRakeId)
      setSearchRakeId('')
    }
  }

  const handleVerifyTx = async (txHash) => {
    try {
      return await verifyTransaction(txHash)
    } catch (error) {
      console.error('Verification error:', error)
      throw error
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Lock size={32} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">Blockchain Audit Trail</h1>
        </div>
        <p className="text-slate-600">Immutable record of rake dispatch events</p>
      </div>

      <InlineDataImport templateId="operations" />

      {/* Blockchain Not Configured */}
      {!blockchainConfigured && (
        <div className="card p-6 bg-yellow-50 border-l-4 border-yellow-500">
          <div className="flex items-start gap-4">
            <AlertTriangle size={24} className="text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Blockchain Not Configured</h3>
              <p className="text-slate-600 mb-3">
                Blockchain integration is not currently configured. Please contact your administrator to set up blockchain connectivity.
              </p>
              <a href="/admin" className="text-blue-600 font-medium hover:underline">
                View Admin Documentation →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Blockchain Stats */}
      {blockchainStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-sm text-slate-600">Total Rakes Tracked</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{blockchainStats.total_rakes_tracked?.toLocaleString()}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-slate-600">Total Events</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{blockchainStats.total_events?.toLocaleString()}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-slate-600">Network Status</p>
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle size={20} className="text-green-600" />
              <p className="text-lg font-bold text-green-600">{blockchainStats.network_status}</p>
            </div>
          </div>
          <div className="card p-4">
            <p className="text-sm text-slate-600">Avg Confirmation</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{blockchainStats.avg_confirmation_time}</p>
          </div>
        </div>
      )}

      {mlSecuritySummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mlSecuritySummary.riskPct != null && (
            <div className="card p-4">
              <p className="text-sm text-slate-600">ML Risk Score</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {mlSecuritySummary.riskPct.toFixed(1)}%
              </p>
            </div>
          )}
          {mlSecuritySummary.anomalyCount != null && (
            <div className="card p-4">
              <p className="text-sm text-slate-600">ML Detected Anomalies</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {Math.round(mlSecuritySummary.anomalyCount).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        {[
          { id: 'audit', label: 'Audit Trail', icon: Lock },
          { id: 'contracts', label: 'Smart Contracts', icon: Code },
          { id: 'multisig', label: 'Multi-Sig', icon: Users },
          { id: 'streaming', label: 'Real-Time', icon: Zap },
          { id: 'consensus', label: 'Consensus', icon: Shield },
          { id: 'integrity', label: 'Integrity', icon: CheckCircle },
          { id: 'compliance', label: 'Compliance', icon: AlertTriangle },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'network', label: 'Network', icon: Layers },
          { id: 'history', label: 'History', icon: Activity },
          { id: 'webhooks', label: 'Webhooks', icon: Link2 },
          { id: 'disputes', label: 'Disputes', icon: AlertCircle },
        ].map((tab) => {
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
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Search Rake (only show on audit tab) */}
      {activeTab === 'audit' && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Search Rake Audit Trail</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter Rake ID (e.g., SAIL-R001)"
              value={searchRakeId}
              onChange={(e) => setSearchRakeId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchRake()}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <button
              onClick={handleSearchRake}
              disabled={loading || !searchRakeId.trim()}
              className="btn btn-primary btn-sm flex items-center gap-2"
            >
              <Search size={18} />
              Search
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-2">Current Rake: <strong>{rakeId}</strong></p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="card p-4 bg-red-50 border-l-4 border-red-500">
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'audit' && (
        <>
          {/* Audit Trail Table */}
          {loading ? (
            <div className="card p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading audit trail...</p>
            </div>
          ) : auditData && auditData.events ? (
            <AuditTable
              events={auditData.events}
              rakeId={auditData.rake_id}
              onVerifyTx={handleVerifyTx}
            />
          ) : null}
        </>
      )}

      {activeTab === 'contracts' && <SmartContractManagement />}
      {activeTab === 'multisig' && <MultiSignatureAuthorization />}
      {activeTab === 'streaming' && <RealTimeEventStreaming />}
      {activeTab === 'consensus' && <ConsensusMechanismVisualization />}
      {activeTab === 'integrity' && <DataIntegrityVerification />}
      {activeTab === 'compliance' && <ComplianceRegulatory />}
      {activeTab === 'analytics' && <AdvancedAnalytics />}
      {activeTab === 'network' && <BlockchainNetworkHealth />}
      {activeTab === 'history' && <HistoricalComparison />}
      {activeTab === 'webhooks' && <IntegrationWebhooks />}
      {activeTab === 'disputes' && <DisputeResolution />}

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-start gap-3">
            <Lock size={20} className="text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-900 text-sm">Immutable Records</p>
              <p className="text-xs text-slate-600 mt-1">Once recorded, rake events cannot be altered</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-900 text-sm">Transparent Tracking</p>
              <p className="text-xs text-slate-600 mt-1">Complete visibility of rake dispatch journey</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-purple-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-900 text-sm">Cryptographic Verification</p>
              <p className="text-xs text-slate-600 mt-1">SHA256 hashing ensures data integrity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
