import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { AlertCircle, TrendingDown, Leaf } from 'lucide-react'
import { getSuppliers, getSupplierPerformance, getSupplierContracts, getRisks, getRiskMatrix, getEmissionsData, getSustainabilityMetrics, getESGReport, getGreenSuppliers } from '../api/businessPagesApi3'

// ============ SUPPLIER MANAGEMENT COMPONENTS ============
export function SupplierScorecard() {
  const [suppliers, setSuppliers] = useState([])
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [suppliersData, contractsData] = await Promise.all([
        getSuppliers(),
        getSupplierContracts(),
      ])
      setSuppliers(suppliersData)
      setContracts(contractsData)
    } catch (error) {
      console.error('Failed to load supplier data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    'Active': 'bg-green-100 text-green-800',
    'On Watch': 'bg-yellow-100 text-yellow-800',
    'Inactive': 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="px-4 py-2 text-left font-bold text-slate-900">Supplier</th>
                  <th className="px-4 py-2 text-right font-bold text-slate-900">On-Time %</th>
                  <th className="px-4 py-2 text-right font-bold text-slate-900">Quality %</th>
                  <th className="px-4 py-2 text-right font-bold text-slate-900">Cost Score</th>
                  <th className="px-4 py-2 text-right font-bold text-slate-900">Risk</th>
                  <th className="px-4 py-2 text-left font-bold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-900">{supplier.name}</td>
                    <td className="px-4 py-2 text-right text-slate-600">{supplier.onTimeDelivery}%</td>
                    <td className="px-4 py-2 text-right text-slate-600">{supplier.quality}%</td>
                    <td className="px-4 py-2 text-right text-slate-600">{supplier.cost}</td>
                    <td className={`px-4 py-2 text-right font-bold ${supplier.riskScore > 40 ? 'text-red-600' : supplier.riskScore > 20 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {supplier.riskScore}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[supplier.status]}`}>
                        {supplier.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {contracts.length > 0 && (
            <div className="card p-4">
              <h3 className="font-bold text-slate-900 mb-4">Active Contracts</h3>
              <div className="space-y-2">
                {contracts.map((contract) => (
                  <div key={contract.id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <div>
                      <p className="font-medium text-slate-900">{contract.supplier}</p>
                      <p className="text-xs text-slate-600">{contract.startDate} to {contract.endDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">${(contract.value / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ============ RISK MANAGEMENT COMPONENTS ============
export function RiskDashboard() {
  const [risks, setRisks] = useState([])
  const [matrix, setMatrix] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [risksData, matrixData] = await Promise.all([
        getRisks(),
        getRiskMatrix(),
      ])
      setRisks(risksData)
      setMatrix(matrixData)
    } catch (error) {
      console.error('Failed to load risk data:', error)
    } finally {
      setLoading(false)
    }
  }

  const severityColors = {
    'Critical': 'bg-red-100 text-red-800 border-red-300',
    'High': 'bg-orange-100 text-orange-800 border-orange-300',
    'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Low': 'bg-blue-100 text-blue-800 border-blue-300',
  }

  const statusBadge = {
    'Open': 'bg-red-200 text-red-800',
    'Mitigated': 'bg-yellow-200 text-yellow-800',
    'Closed': 'bg-green-200 text-green-800',
  }

  return (
    <div className="space-y-6">
      {matrix && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <p className="text-sm text-slate-600">Critical</p>
            <p className="text-3xl font-bold text-red-600">{matrix.critical}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">High</p>
            <p className="text-3xl font-bold text-orange-600">{matrix.high}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Medium</p>
            <p className="text-3xl font-bold text-yellow-600">{matrix.medium}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Low</p>
            <p className="text-3xl font-bold text-blue-600">{matrix.low}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {risks.map((risk) => (
            <div key={risk.id} className={`card p-4 border-l-4 ${severityColors[risk.severity]}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-slate-900">{risk.title}</p>
                  <p className="text-sm text-slate-600">{risk.category}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${statusBadge[risk.status]}`}>
                  {risk.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2 text-sm">
                <div>
                  <p className="text-xs text-slate-600">Probability</p>
                  <p className="font-bold text-slate-900">{risk.probability}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Impact</p>
                  <p className="font-bold text-slate-900">{risk.impact}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Score</p>
                  <p className="font-bold text-slate-900">{Math.round(risk.probability * risk.impact / 100)}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">Mitigation: {risk.mitigation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ SUSTAINABILITY COMPONENTS ============
export function SustainabilityDashboard() {
  const [emissions, setEmissions] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [esg, setEsg] = useState(null)
  const [greenSuppliers, setGreenSuppliers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [emissionsData, metricsData, esgData, greenData] = await Promise.all([
        getEmissionsData(30),
        getSustainabilityMetrics(),
        getESGReport(),
        getGreenSuppliers(),
      ])
      setEmissions(emissionsData)
      setMetrics(metricsData)
      setEsg(esgData)
      setGreenSuppliers(greenData)
    } catch (error) {
      console.error('Failed to load sustainability data:', error)
    } finally {
      setLoading(false)
    }
  }

  const emissionsByRoute = emissions.reduce((acc, e) => {
    const existing = acc.find(x => x.route === e.route)
    if (existing) {
      existing.emissions += e.emissions
      existing.fuel += e.fuel
    } else {
      acc.push({ route: e.route, emissions: e.emissions, fuel: e.fuel })
    }
    return acc
  }, [])

  return (
    <div className="space-y-6">
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="card text-center">
            <p className="text-sm text-slate-600">Carbon Footprint</p>
            <p className="text-3xl font-bold text-slate-900">{metrics.carbonFootprint}</p>
            <p className="text-xs text-slate-600">tonnes CO₂</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Fuel Efficiency</p>
            <p className="text-3xl font-bold text-slate-900">{metrics.fuelEfficiency}</p>
            <p className="text-xs text-slate-600">km/liter</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Green Suppliers</p>
            <p className="text-3xl font-bold text-green-600">{metrics.greenSuppliers}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Waste Reduction</p>
            <p className="text-3xl font-bold text-slate-900">{metrics.wasteReduction}%</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Water Usage</p>
            <p className="text-3xl font-bold text-slate-900">{metrics.waterUsage}</p>
            <p className="text-xs text-slate-600">m³</p>
          </div>
        </div>
      )}

      {esg && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <p className="text-sm text-slate-600">Environmental</p>
            <p className="text-3xl font-bold text-green-600">{esg.environmental}%</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Social</p>
            <p className="text-3xl font-bold text-blue-600">{esg.social}%</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Governance</p>
            <p className="text-3xl font-bold text-purple-600">{esg.governance}%</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Overall ESG</p>
            <p className="text-3xl font-bold text-slate-900">{esg.overall}%</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {emissionsByRoute.length > 0 && (
            <div className="card p-4">
              <h3 className="font-bold text-slate-900 mb-4">Emissions by Route</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={emissionsByRoute}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="route" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="emissions" fill="#ef4444" name="CO₂ (tonnes)" />
                  <Bar dataKey="fuel" fill="#f59e0b" name="Fuel (liters)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {greenSuppliers.length > 0 && (
            <div className="card p-4">
              <h3 className="font-bold text-slate-900 mb-4">Green Suppliers</h3>
              <div className="space-y-2">
                {greenSuppliers.map((supplier) => (
                  <div key={supplier.id} className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-900">{supplier.name}</p>
                        <p className="text-xs text-slate-600">{supplier.certification} • {supplier.emissions}</p>
                      </div>
                      <p className="text-lg font-bold text-green-600">{supplier.score}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
