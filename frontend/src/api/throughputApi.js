import axios from 'axios'

const API_URL = (import.meta.env.VITE_API_URL) || 'http://localhost:5000/api'

// Mock data generator
export const generateMockThroughputData = (startDate, endDate, loadingPoint) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const throughput = []

  let current = new Date(start)
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0]
    const baseValue = Math.random() * 30000 + 20000
    const variance = Math.sin(current.getTime() / (1000 * 60 * 60 * 24)) * 5000
    const tonnes = Math.round(baseValue + variance)
    const dispatches = Math.round(tonnes / 350 + Math.random() * 20)

    throughput.push({
      date: dateStr,
      tonnes: Math.max(15000, tonnes),
      dispatches: Math.max(40, dispatches),
      region: loadingPoint.includes('A') ? 'Region A' : 'Region B',
    })

    current.setDate(current.getDate() + 1)
  }

  const avgThroughput = Math.round(
    throughput.reduce((sum, d) => sum + d.tonnes, 0) / throughput.length
  )
  const peakThroughput = Math.max(...throughput.map(d => d.tonnes))
  const totalDispatches = throughput.reduce((sum, d) => sum + d.dispatches, 0)

  return {
    throughput,
    loadingPoint,
    startDate,
    endDate,
    avgThroughput,
    peakThroughput,
    totalDispatches,
  }
}

// Fetch throughput data
export const fetchThroughputData = async (request) => {
  try {
    const response = await axios.get(`${API_URL}/throughput`, {
      params: {
        start: request.startDate,
        end: request.endDate,
        loading_point: request.loadingPoint,
      },
    })
    return response.data
  } catch (error) {
    console.warn('API call failed, using mock data:', error)
    return generateMockThroughputData(
      request.startDate,
      request.endDate,
      request.loadingPoint
    )
  }
}

// Generate comparison data for regionA vs regionB
export const generateComparisonData = (throughputA, throughputB) => {
  const maxLength = Math.max(throughputA.length, throughputB.length)
  const comparison = []

  for (let i = 0; i < maxLength; i++) {
    comparison.push({
      date: throughputA[i]?.date || throughputB[i]?.date,
      regionA: throughputA[i]?.tonnes || 0,
      regionB: throughputB[i]?.tonnes || 0,
      dispatchesA: throughputA[i]?.dispatches || 0,
      dispatchesB: throughputB[i]?.dispatches || 0,
    })
  }

  return comparison
}

// Download chart as image
export const downloadChartImage = (chartRef, filename) => {
  if (!chartRef) return

  const canvas = chartRef.querySelector('canvas')
  if (!canvas) {
    console.error('Canvas not found')
    return
  }

  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = filename || 'throughput-chart.png'
  link.click()
}
