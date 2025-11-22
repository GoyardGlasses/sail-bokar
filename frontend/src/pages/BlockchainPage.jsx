import React, { useState, useEffect } from 'react'
import { Link, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000'

export default function BlockchainPage() {
  const [shipments, setShipments] = useState([])
  const [blockchainStats, setBlockchainStats] = useState(null)
  const [newShipment, setNewShipment] = useState({
    origin: 'BOKARO',
    destination: 'Kolkata',
    material: 'HR_Coils',
    quantity: 100
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchBlockchainStats()
  }, [])

  const fetchBlockchainStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/blockchain/stats`)
      setBlockchainStats(response.data.data)
    } catch (error) {
      console.error('Error fetching blockchain stats:', error)
    }
  }

  const createShipment = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_BASE}/blockchain/shipment/create`, newShipment)
      setShipments([...shipments, response.data.data])
      setNewShipment({
        origin: 'BOKARO',
        destination: 'Kolkata',
        material: 'HR_Coils',
        quantity: 100
      })
      fetchBlockchainStats()
    } catch (error) {
      console.error('Error creating shipment:', error)
    } finally {
      setLoading(false)
    }
  }

  const mineBlock = async () => {
    setLoading(true)
    try {
      await axios.post(`${API_BASE}/blockchain/block/mine`)
      fetchBlockchainStats()
    } catch (error) {
      console.error('Error mining block:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lock className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Blockchain Supply Chain</h1>
        </div>
        <p className="text-gray-600">Transparent & Immutable Tracking</p>
      </div>

      {/* Blockchain Stats */}
      {blockchainStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Total Blocks</p>
            <p className="text-3xl font-bold text-gray-900">{blockchainStats.total_blocks}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Total Shipments</p>
            <p className="text-3xl font-bold text-gray-900">{blockchainStats.total_shipments}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Pending Shipments</p>
            <p className="text-3xl font-bold text-orange-600">{blockchainStats.pending_shipments}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Chain Integrity</p>
            <div className="flex items-center gap-2 mt-2">
              {blockchainStats.chain_integrity ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <p className="text-lg font-bold text-green-600">Valid</p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <p className="text-lg font-bold text-red-600">Invalid</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Shipment */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Shipment</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Origin</label>
            <input
              type="text"
              value={newShipment.origin}
              onChange={(e) => setNewShipment({...newShipment, origin: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
            <select
              value={newShipment.destination}
              onChange={(e) => setNewShipment({...newShipment, destination: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option>Kolkata</option>
              <option>Patna</option>
              <option>Ranchi</option>
              <option>Durgapur</option>
              <option>Haldia</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
            <select
              value={newShipment.material}
              onChange={(e) => setNewShipment({...newShipment, material: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option>HR_Coils</option>
              <option>CR_Coils</option>
              <option>Plates</option>
              <option>Wire_Rods</option>
              <option>TMT_Bars</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (tonnes)</label>
            <input
              type="number"
              value={newShipment.quantity}
              onChange={(e) => setNewShipment({...newShipment, quantity: parseFloat(e.target.value)})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={createShipment}
              disabled={loading}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>

      {/* Mine Block */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Mine New Block</h2>
            <p className="text-gray-600 text-sm mt-1">Commit pending shipments to blockchain</p>
          </div>
          <button
            onClick={mineBlock}
            disabled={loading || !blockchainStats || blockchainStats.pending_shipments === 0}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Mining...' : 'Mine Block'}
          </button>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Shipments</h2>
        {shipments.length === 0 ? (
          <p className="text-gray-600">No shipments created yet</p>
        ) : (
          <div className="space-y-2">
            {shipments.map((shipment, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{shipment.shipment_id}</p>
                  <p className="text-sm text-gray-600">{shipment.timestamp}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs text-gray-500">{shipment.hash.substring(0, 16)}...</p>
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Blockchain Features */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Blockchain Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2">✓ Immutable Records</h3>
            <p className="text-sm text-gray-600">Once recorded, shipment data cannot be altered</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2">✓ Transparent Tracking</h3>
            <p className="text-sm text-gray-600">Complete visibility of shipment journey</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2">✓ Cryptographic Verification</h3>
            <p className="text-sm text-gray-600">SHA256 hashing ensures data integrity</p>
          </div>
        </div>
      </div>
    </div>
  )
}
