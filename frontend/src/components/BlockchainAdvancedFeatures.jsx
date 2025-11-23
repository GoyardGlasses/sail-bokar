import React, { useState } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts'
import { CheckCircle, AlertCircle, FileText } from 'lucide-react'

// ============ SMART CONTRACT MANAGEMENT ============
export function SmartContractManagement() {
  const [contracts] = useState([
    { id: 'SC001', name: 'Auto Dispatch', status: 'active', executions: 1247, gasUsed: 2500000, lastExecution: '2025-11-23T20:30:00Z' },
    { id: 'SC002', name: 'Quality Verification', status: 'active', executions: 856, gasUsed: 1800000, lastExecution: '2025-11-23T19:45:00Z' },
    { id: 'SC003', name: 'Payment Settlement', status: 'paused', executions: 523, gasUsed: 950000, lastExecution: '2025-11-23T15:20:00Z' },
    { id: 'SC004', name: 'Compliance Check', status: 'active', executions: 2100, gasUsed: 3200000, lastExecution: '2025-11-23T20:45:00Z' },
  ])

  const gasOptimization = [
    { contract: 'Auto Dispatch', current: 2500000, optimized: 2100000, savings: 16 },
    { contract: 'Quality Verification', current: 1800000, optimized: 1450000, savings: 19 },
    { contract: 'Payment Settlement', current: 950000, optimized: 780000, savings: 18 },
    { contract: 'Compliance Check', current: 3200000, optimized: 2600000, savings: 19 },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Smart Contract Management</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-sm font-medium text-slate-900 mb-3">Active Contracts</p>
          <div className="space-y-2">
            {contracts.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <div>
                  <p className="text-sm font-medium text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-600">{c.id}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <p className="text-sm font-medium text-slate-900 mb-3">Contract Stats</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
              <p className="text-sm text-slate-600">Total Executions</p>
              <p className="text-lg font-bold text-blue-600">{contracts.reduce((a, c) => a + c.executions, 0).toLocaleString()}</p>
            </div>
            <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
              <p className="text-sm text-slate-600">Total Gas Used</p>
              <p className="text-lg font-bold text-purple-600">{(contracts.reduce((a, c) => a + c.gasUsed, 0) / 1000000).toFixed(1)}M</p>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
              <p className="text-sm text-slate-600">Active Contracts</p>
              <p className="text-lg font-bold text-green-600">{contracts.filter(c => c.status === 'active').length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Gas Optimization Opportunities</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={gasOptimization}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="contract" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip formatter={(v) => (v / 1000000).toFixed(2) + 'M'} />
            <Legend />
            <Bar dataKey="current" fill="#ef4444" name="Current Gas" />
            <Bar dataKey="optimized" fill="#10b981" name="Optimized Gas" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ============ MULTI-SIGNATURE AUTHORIZATION ============
export function MultiSignatureAuthorization() {
  const [pendingApprovals] = useState([
    { id: 'DISP001', action: 'Dispatch Rake R001', requiredSigs: 3, currentSigs: 2, signers: ['Manager A', 'Officer B', 'Pending: Director C'] },
    { id: 'DISP002', action: 'Dispatch Rake R002', requiredSigs: 2, currentSigs: 2, signers: ['Manager A', 'Officer B'] },
    { id: 'DISP003', action: 'Dispatch Rake R003', requiredSigs: 3, currentSigs: 1, signers: ['Manager A', 'Pending: Officer B', 'Pending: Director C'] },
  ])

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Multi-Signature Authorization</h3>

      <div className="space-y-3">
        {pendingApprovals.map((approval) => (
          <div key={approval.id} className="card p-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-slate-900">{approval.action}</p>
                <p className="text-xs text-slate-600 mt-1">{approval.id}</p>
              </div>
              <span className="text-sm font-bold text-slate-900">
                {approval.currentSigs}/{approval.requiredSigs} Signatures
              </span>
            </div>

            <div className="mb-3">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(approval.currentSigs / approval.requiredSigs) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              {approval.signers.map((signer, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {signer.includes('Pending') ? (
                    <>
                      <AlertCircle size={14} className="text-yellow-600" />
                      <span className="text-yellow-700">{signer}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} className="text-green-600" />
                      <span className="text-green-700">{signer}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Pending Approvals</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingApprovals.filter(a => a.currentSigs < a.requiredSigs).length}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Approved</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{pendingApprovals.filter(a => a.currentSigs === a.requiredSigs).length}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Avg Time to Approve</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">2.3h</p>
        </div>
      </div>
    </div>
  )
}

// ============ REAL-TIME EVENT STREAMING ============
export function RealTimeEventStreaming() {
  const [events] = useState([
    { timestamp: '2025-11-23T20:45:30Z', type: 'dispatch_created', rake: 'R001', status: 'confirmed', confirmations: 12 },
    { timestamp: '2025-11-23T20:44:15Z', type: 'quality_verified', rake: 'R002', status: 'confirmed', confirmations: 8 },
    { timestamp: '2025-11-23T20:43:00Z', type: 'loading_completed', rake: 'R003', status: 'confirmed', confirmations: 5 },
    { timestamp: '2025-11-23T20:41:45Z', type: 'delivery_started', rake: 'R004', status: 'pending', confirmations: 0 },
    { timestamp: '2025-11-23T20:40:30Z', type: 'payment_processed', rake: 'R005', status: 'confirmed', confirmations: 15 },
  ])

  const syncStatus = { status: 'synced', blockHeight: 1847293, lastSync: '2 seconds ago', peers: 42 }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Real-Time Event Streaming</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="card p-4 bg-green-50 border-l-4 border-green-500">
          <p className="text-sm text-slate-600">Sync Status</p>
          <p className="text-lg font-bold text-green-600 mt-2">✓ Synced</p>
          <p className="text-xs text-slate-600 mt-1">{syncStatus.lastSync}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-600">Block Height</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{syncStatus.blockHeight.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-600">Connected Peers</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{syncStatus.peers}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-600">Events/min</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">12.5</p>
        </div>
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Live Event Stream</p>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {events.map((event, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded hover:bg-slate-100 transition-colors">
              <div className={`w-2 h-2 rounded-full ${event.status === 'confirmed' ? 'bg-green-600' : 'bg-yellow-600'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{event.type.replace(/_/g, ' ')}</p>
                <p className="text-xs text-slate-600">{event.rake} • {new Date(event.timestamp).toLocaleTimeString()}</p>
              </div>
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                {event.confirmations > 0 ? `${event.confirmations} conf` : 'pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ CONSENSUS MECHANISM VISUALIZATION ============
export function ConsensusMechanismVisualization() {
  const [validators] = useState([
    { id: 'V001', name: 'Validator A', stake: 1000, blocks: 245, uptime: 99.8, status: 'active' },
    { id: 'V002', name: 'Validator B', stake: 850, blocks: 198, uptime: 99.5, status: 'active' },
    { id: 'V003', name: 'Validator C', stake: 750, blocks: 167, uptime: 98.9, status: 'active' },
    { id: 'V004', name: 'Validator D', stake: 600, blocks: 134, uptime: 99.2, status: 'active' },
  ])

  const consensusData = [
    { name: 'Blocks Validated', value: 744 },
    { name: 'Blocks Pending', value: 12 },
    { name: 'Failed Validations', value: 2 },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Consensus Mechanism (PoS)</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-sm font-medium text-slate-900 mb-3">Validator Nodes</p>
          <div className="space-y-2">
            {validators.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <div>
                  <p className="text-sm font-medium text-slate-900">{v.name}</p>
                  <p className="text-xs text-slate-600">Stake: {v.stake} ETH • Uptime: {v.uptime}%</p>
                </div>
                <span className="text-xs font-bold text-green-600">{v.blocks} blocks</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <p className="text-sm font-medium text-slate-900 mb-3">Consensus Stats</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={consensusData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={60} fill="#8884d8" dataKey="value">
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Total Stake</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">3,200 ETH</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Avg Block Time</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">12.5s</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Network Health</p>
          <p className="text-3xl font-bold text-green-600 mt-2">✓ Healthy</p>
        </div>
      </div>
    </div>
  )
}

// ============ DATA INTEGRITY VERIFICATION ============
export function DataIntegrityVerification() {
  const [merkleTree] = useState({
    root: '0x7f3a8b2c...',
    depth: 8,
    leaves: 256,
    verified: true,
  })

  const hashChainData = [
    { block: 1847290, hash: '0x1a2b3c4d...', parentHash: '0x9z8y7x6w...', verified: true },
    { block: 1847291, hash: '0x5e6f7g8h...', parentHash: '0x1a2b3c4d...', verified: true },
    { block: 1847292, hash: '0x9i0j1k2l...', parentHash: '0x5e6f7g8h...', verified: true },
    { block: 1847293, hash: '0x3m4n5o6p...', parentHash: '0x9i0j1k2l...', verified: true },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Data Integrity Verification</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4 bg-green-50 border-l-4 border-green-500">
          <p className="text-sm font-medium text-slate-900 mb-3">Merkle Tree Status</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-sm text-slate-600">Root Hash</p>
              <code className="text-xs bg-white px-2 py-1 rounded font-mono">{merkleTree.root}</code>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-slate-600">Tree Depth</p>
              <p className="text-sm font-bold text-slate-900">{merkleTree.depth}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-slate-600">Leaves</p>
              <p className="text-sm font-bold text-slate-900">{merkleTree.leaves}</p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-green-200">
              <p className="text-sm text-slate-600">Verification</p>
              <span className="flex items-center gap-1 text-green-600 font-bold">
                <CheckCircle size={16} /> Valid
              </span>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <p className="text-sm font-medium text-slate-900 mb-3">Hash Chain Validation</p>
          <div className="space-y-2">
            {hashChainData.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-slate-700 truncate">Block {item.block}: {item.hash}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Integrity Checks</p>
        <div className="space-y-2">
          {[
            { check: 'Hash Chain Continuity', status: 'passed' },
            { check: 'Merkle Root Verification', status: 'passed' },
            { check: 'Timestamp Ordering', status: 'passed' },
            { check: 'Signature Validation', status: 'passed' },
            { check: 'Data Consistency', status: 'passed' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <p className="text-sm text-slate-900">{item.check}</p>
              <span className="flex items-center gap-1 text-green-600 font-semibold text-xs">
                <CheckCircle size={14} /> {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ COMPLIANCE & REGULATORY ============
export function ComplianceRegulatory() {
  const [reports] = useState([
    { name: 'GDPR Compliance', status: 'compliant', lastAudit: '2025-11-20', nextAudit: '2025-12-20' },
    { name: 'Data Retention Policy', status: 'compliant', lastAudit: '2025-11-15', nextAudit: '2025-12-15' },
    { name: 'Audit Trail Completeness', status: 'compliant', lastAudit: '2025-11-23', nextAudit: '2025-12-23' },
    { name: 'Access Control', status: 'compliant', lastAudit: '2025-11-18', nextAudit: '2025-12-18' },
  ])

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Compliance & Regulatory</h3>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Compliance Status</p>
        <div className="space-y-2">
          {reports.map((r, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <div>
                <p className="text-sm font-medium text-slate-900">{r.name}</p>
                <p className="text-xs text-slate-600">Last audit: {r.lastAudit} • Next: {r.nextAudit}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                ✓ {r.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Compliant Reports</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{reports.filter(r => r.status === 'compliant').length}/{reports.length}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Data Retention</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">7 years</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Last Full Audit</p>
          <p className="text-sm font-bold text-slate-900 mt-2">2025-11-23</p>
        </div>
      </div>

      <button className="w-full btn btn-secondary">
        <FileText size={18} className="mr-2" />
        Export Compliance Report
      </button>
    </div>
  )
}
