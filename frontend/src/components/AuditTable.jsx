import React, { useState } from 'react'
import { ExternalLink, CheckCircle, AlertCircle, Loader, Copy, Eye } from 'lucide-react'

export default function AuditTable({ events, rakeId, onVerifyTx }) {
  const [verifyingTx, setVerifyingTx] = useState(null)
  const [verificationResult, setVerificationResult] = useState(null)
  const [copiedTx, setCopiedTx] = useState(null)

  const handleVerifyTx = async (txHash) => {
    setVerifyingTx(txHash)
    try {
      const result = await onVerifyTx(txHash)
      setVerificationResult(result)
    } finally {
      setVerifyingTx(null)
    }
  }

  const handleCopyTx = (txHash) => {
    navigator.clipboard.writeText(txHash)
    setCopiedTx(txHash)
    setTimeout(() => setCopiedTx(null), 2000)
  }

  const getEventIcon = (eventType) => {
    const icons = {
      rake_created: '🆕',
      loading_started: '⬆️',
      loading_completed: '✅',
      dispatch_authorized: '📋',
      location_update: '📍',
      delivery_started: '🚚',
      delivery_completed: '🏁',
      quality_verified: '✔️',
      payment_processed: '💳',
    }
    return icons[eventType] || '📝'
  }

  const getEventColor = (eventType) => {
    const colors = {
      rake_created: 'bg-blue-50 border-blue-200',
      loading_started: 'bg-yellow-50 border-yellow-200',
      loading_completed: 'bg-green-50 border-green-200',
      dispatch_authorized: 'bg-purple-50 border-purple-200',
      location_update: 'bg-cyan-50 border-cyan-200',
      delivery_started: 'bg-orange-50 border-orange-200',
      delivery_completed: 'bg-emerald-50 border-emerald-200',
      quality_verified: 'bg-teal-50 border-teal-200',
      payment_processed: 'bg-indigo-50 border-indigo-200',
    }
    return colors[eventType] || 'bg-slate-50 border-slate-200'
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const formatTxHash = (hash) => {
    if (!hash) return 'N/A'
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`
  }

  return (
    <div className="space-y-4">
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-300">
              <th className="px-4 py-3 text-left font-bold text-slate-900">Time</th>
              <th className="px-4 py-3 text-left font-bold text-slate-900">Event</th>
              <th className="px-4 py-3 text-left font-bold text-slate-900">Actor</th>
              <th className="px-4 py-3 text-left font-bold text-slate-900">Details</th>
              <th className="px-4 py-3 text-left font-bold text-slate-900">Transaction Hash</th>
              <th className="px-4 py-3 text-center font-bold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, i) => (
              <tr key={i} className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${getEventColor(event.event_type)}`}>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {formatTimestamp(event.timestamp)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getEventIcon(event.event_type)}</span>
                    <span className="font-medium text-slate-900 capitalize">
                      {event.event_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-800">
                    {event.actor.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 max-w-xs">
                  <p className="truncate" title={event.details}>{event.details}</p>
                </td>
                <td className="px-4 py-3">
                  {event.tx_hash ? (
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-700">
                        {formatTxHash(event.tx_hash)}
                      </code>
                      <button
                        onClick={() => handleCopyTx(event.tx_hash)}
                        className="p-1 hover:bg-slate-200 rounded transition-colors"
                        title="Copy transaction hash"
                      >
                        {copiedTx === event.tx_hash ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <Copy size={16} className="text-slate-600" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400">Pending</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {event.tx_hash ? (
                    <button
                      onClick={() => handleVerifyTx(event.tx_hash)}
                      disabled={verifyingTx === event.tx_hash}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Verify transaction on blockchain"
                    >
                      {verifyingTx === event.tx_hash ? (
                        <>
                          <Loader size={14} className="animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Eye size={14} />
                          Verify
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-slate-400 text-xs">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Verification Result Modal */}
      {verificationResult && (
        <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
          <div className="flex items-start gap-4">
            <CheckCircle size={32} className="text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Transaction Verified ✓</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Transaction Hash</p>
                  <code className="text-xs bg-white px-2 py-1 rounded font-mono text-slate-700 block mt-1">
                    {verificationResult.tx_hash}
                  </code>
                </div>
                <div>
                  <p className="text-slate-600">Block Number</p>
                  <p className="font-bold text-slate-900 mt-1">#{verificationResult.block_number?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-600">Confirmations</p>
                  <p className="font-bold text-slate-900 mt-1">{verificationResult.confirmations} confirmations</p>
                </div>
                <div>
                  <p className="text-slate-600">Gas Used</p>
                  <p className="font-bold text-slate-900 mt-1">{verificationResult.gas_used?.toLocaleString()} units</p>
                </div>
              </div>
              <button
                onClick={() => setVerificationResult(null)}
                className="mt-4 px-4 py-2 rounded font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Total Events</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{events.length}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Verified Events</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{events.filter(e => e.tx_hash).length}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">First Event</p>
          <p className="text-sm font-bold text-slate-900 mt-2">{formatTimestamp(events[0]?.timestamp)}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Latest Event</p>
          <p className="text-sm font-bold text-slate-900 mt-2">{formatTimestamp(events[events.length - 1]?.timestamp)}</p>
        </div>
      </div>
    </div>
  )
}
