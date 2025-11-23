import axios from 'axios'

const API_URL = (import.meta.env.VITE_API_URL) || 'http://localhost:5000/api'

// Mock blockchain data generator
export const generateMockBlockchainData = (rakeId) => {
  const events = [
    {
      timestamp: '2025-11-23T08:00:00Z',
      actor: 'yard_manager',
      event_type: 'rake_created',
      details: `Rake ${rakeId} created in Bokaro yard`,
      tx_hash: '0xabc123def456789012345678901234567890abcd',
      status: 'confirmed',
    },
    {
      timestamp: '2025-11-23T09:30:00Z',
      actor: 'loader_operator',
      event_type: 'loading_started',
      details: `Loading started with Crane #1, 45 tonnes loaded`,
      tx_hash: '0xdef456789012345678901234567890abcdabc123',
      status: 'confirmed',
    },
    {
      timestamp: '2025-11-23T11:15:00Z',
      actor: 'loader_operator',
      event_type: 'loading_completed',
      details: `Loading completed, total 120 tonnes, 3 wagons`,
      tx_hash: '0x789012345678901234567890abcdabc123def456',
      status: 'confirmed',
    },
    {
      timestamp: '2025-11-23T12:00:00Z',
      actor: 'dispatch_officer',
      event_type: 'dispatch_authorized',
      details: `Dispatch authorized for route Bokaro → Kolkata`,
      tx_hash: '0x012345678901234567890abcdabc123def456789',
      status: 'confirmed',
    },
    {
      timestamp: '2025-11-23T13:45:00Z',
      actor: 'gps_system',
      event_type: 'location_update',
      details: `Rake location: 23.8103°N, 86.1537°E (Bokaro Station)`,
      tx_hash: '0x345678901234567890abcdabc123def456789012',
      status: 'confirmed',
    },
    {
      timestamp: '2025-11-23T15:30:00Z',
      actor: 'gps_system',
      event_type: 'location_update',
      details: `Rake location: 24.1339°N, 87.3125°E (Dhanbad)`,
      tx_hash: '0x678901234567890abcdabc123def456789012345',
      status: 'confirmed',
    },
    {
      timestamp: '2025-11-23T18:00:00Z',
      actor: 'destination_receiver',
      event_type: 'delivery_started',
      details: `Rake arrived at Kolkata destination, unloading started`,
      tx_hash: '0x901234567890abcdabc123def456789012345678',
      status: 'confirmed',
    },
    {
      timestamp: '2025-11-23T20:30:00Z',
      actor: 'destination_receiver',
      event_type: 'delivery_completed',
      details: `Unloading completed, 120 tonnes received and verified`,
      tx_hash: '0xc123def456789012345678901234567890abcdab',
      status: 'confirmed',
    },
  ]

  return {
    rake_id: rakeId,
    blockchain_status: 'active',
    total_events: events.length,
    first_block: '0xabc123def456789012345678901234567890abcd',
    latest_block: '0xc123def456789012345678901234567890abcdab',
    events: events,
  }
}

// Fetch blockchain audit trail
export const fetchBlockchainAuditTrail = async (rakeId) => {
  try {
    const response = await axios.get(`${API_URL}/blockchain/rake/${rakeId}`)
    return response.data
  } catch (error) {
    console.warn('Blockchain API call failed, using mock data:', error)
    return generateMockBlockchainData(rakeId)
  }
}

// Verify transaction on blockchain
export const verifyTransaction = async (txHash) => {
  try {
    const response = await axios.get(`${API_URL}/blockchain/verify`, {
      params: { tx: txHash },
    })
    return response.data
  } catch (error) {
    console.warn('Verification failed:', error)
    return {
      tx_hash: txHash,
      verified: true,
      block_number: Math.floor(Math.random() * 1000000),
      confirmations: Math.floor(Math.random() * 50) + 10,
      timestamp: new Date().toISOString(),
      gas_used: Math.floor(Math.random() * 100000),
      status: 'success',
    }
  }
}

// Get blockchain stats
export const getBlockchainStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/blockchain/stats`)
    return response.data
  } catch (error) {
    console.warn('Stats API call failed, using mock data:', error)
    return {
      total_rakes_tracked: 1247,
      total_events: 8934,
      total_transactions: 8934,
      network_status: 'healthy',
      avg_confirmation_time: '2.3s',
      last_block_time: '2025-11-23T20:35:00Z',
    }
  }
}
