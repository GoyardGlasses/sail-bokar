import React, { useState, useMemo, useEffect } from 'react'
import { Search, Filter, TrendingUp, AlertCircle, CheckCircle, Clock, DollarSign, BarChart3, Calendar, Zap, LineChart as LineChartIcon, PieChart as PieChartIcon, Target } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart, Area } from 'recharts'
import { useMLPredictions } from '../context/MLPredictionsContext'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'

// Generate realistic mock decision data
const generateDecisionData = () => {
  const scenarios = [
    'High Demand Surge',
    'Route Blockage',
    'Material Shortage',
    'Weather Crisis',
    'Cost Spike',
    'Capacity Crunch',
    'Quality Issue',
    'Supplier Delay',
    'Traffic Congestion',
    'Equipment Failure',
  ]

  const decisions = [
    'Reroute shipment',
    'Increase tonnage',
    'Reduce cost',
    'Delay shipment',
    'Use alternative material',
    'Hire additional trucks',
    'Negotiate with supplier',
    'Use air freight',
    'Split shipment',
    'Premium pricing',
    'Consolidate orders',
    'Change dispatch time',
    'Use backup route',
    'Increase inventory',
    'Reduce quality standards',
  ]

  const outcomes = ['Success', 'Partial Success', 'Failed', 'Pending']
  const routes = ['bokaro-dhanbad', 'bokaro-hatia', 'bokaro-kolkata', 'bokaro-patna', 'bokaro-ranchi', 'bokaro-durgapur', 'bokaro-haldia']
  const materials = ['cr_coils', 'hr_coils', 'plates', 'sheets']
  const materialSpecs = {
    'cr_coils': { thickness: '0.5-3.0mm', width: '600-1500mm', length: 'coil' },
    'hr_coils': { thickness: '1.2-12.7mm', width: '600-1500mm', length: 'coil' },
    'plates': { thickness: '3-100mm', width: '1000-2000mm', length: '2000-6000mm' },
    'sheets': { thickness: '0.4-2.0mm', width: '800-1500mm', length: '2000-4000mm' }
  }

  const data = []
  const startDate = new Date('2023-01-01')

  for (let i = 0; i < 300; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)

    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)]
    const numDecisions = Math.floor(Math.random() * 3) + 1
    const selectedDecisions = []
    for (let j = 0; j < numDecisions; j++) {
      const decision = decisions[Math.floor(Math.random() * decisions.length)]
      if (!selectedDecisions.includes(decision)) {
        selectedDecisions.push(decision)
      }
    }

    const route = routes[Math.floor(Math.random() * routes.length)]
    const material = materials[Math.floor(Math.random() * materials.length)]
    const tonnage = Math.floor(Math.random() * 100) + 10
    const severity = ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)]
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)]

    // Calculate impact based on decisions and outcome
    let costImpact = Math.floor(Math.random() * 50000) - 25000
    let timeImpact = Math.floor(Math.random() * 10) - 5
    let satisfactionImpact = Math.floor(Math.random() * 40) - 20

    if (outcome === 'Success') {
      costImpact = Math.abs(costImpact) * -1 // Negative = savings
      timeImpact = Math.abs(timeImpact) * -1 // Negative = faster
      satisfactionImpact = Math.abs(satisfactionImpact)
    } else if (outcome === 'Failed') {
      costImpact = Math.abs(costImpact)
      timeImpact = Math.abs(timeImpact)
      satisfactionImpact = Math.abs(satisfactionImpact) * -1
    }

    const complexity = Math.floor(Math.random() * 100) + 1
    const riskMitigated = Math.floor(Math.random() * 100) + 1

    data.push({
      id: i + 1,
      date: date.toISOString().split('T')[0],
      scenario,
      decisions: selectedDecisions,
      route,
      material,
      tonnage,
      severity,
      outcome,
      costImpact,
      timeImpact,
      satisfactionImpact,
      complexity,
      riskMitigated,
      decisionMaker: ['Manager A', 'Manager B', 'Manager C', 'Manager D', 'Manager E'][Math.floor(Math.random() * 5)],
      notes: `${scenario} occurred. Decisions taken: ${selectedDecisions.join(', ')}. Result: ${outcome}.`,
    })
  }

  return data.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export default function HistoricalDecisionsPage() {
  const { dataImported, getPrediction } = useMLPredictions()
  const [mlDecisionSupport, setMlDecisionSupport] = useState(null)
  const [decisionData] = useState(generateDecisionData())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterScenario, setFilterScenario] = useState('all')
  const [filterOutcome, setFilterOutcome] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState('table')

  // Get ML prediction when data is imported
  useEffect(() => {
    if (dataImported) {
      const decisionSupport = getPrediction('decision_support')
      setMlDecisionSupport(decisionSupport)
    }
  }, [dataImported, getPrediction])

  // Filter data
  const filteredData = useMemo(() => {
    return decisionData.filter(item => {
      const matchesSearch =
        item.scenario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.decisions.some(d => d.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.id.toString().includes(searchTerm)

      const matchesScenario = filterScenario === 'all' || item.scenario === filterScenario
      const matchesOutcome = filterOutcome === 'all' || item.outcome === filterOutcome
      const matchesSeverity = filterSeverity === 'all' || item.severity === filterSeverity

      return matchesSearch && matchesScenario && matchesOutcome && matchesSeverity
    })
  }, [searchTerm, filterScenario, filterOutcome, filterSeverity, decisionData])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Statistics
  const stats = useMemo(() => {
    const total = decisionData.length
    const successful = decisionData.filter(d => d.outcome === 'Success').length
    const failed = decisionData.filter(d => d.outcome === 'Failed').length
    const avgComplexity = (decisionData.reduce((sum, d) => sum + d.complexity, 0) / total).toFixed(1)
    const avgRiskMitigated = (decisionData.reduce((sum, d) => sum + d.riskMitigated, 0) / total).toFixed(1)
    const totalCostSavings = decisionData.reduce((sum, d) => sum + (d.costImpact < 0 ? Math.abs(d.costImpact) : 0), 0)

    return { total, successful, failed, avgComplexity, avgRiskMitigated, totalCostSavings }
  }, [decisionData])

  // Outcome distribution
  const outcomeData = useMemo(() => {
    const outcomes = {}
    decisionData.forEach(d => {
      outcomes[d.outcome] = (outcomes[d.outcome] || 0) + 1
    })
    return Object.entries(outcomes).map(([name, value]) => ({ name, value }))
  }, [decisionData])

  // Decision maker performance
  const decisionMakerPerformance = useMemo(() => {
    const makers = {}
    decisionData.forEach(d => {
      if (!makers[d.decisionMaker]) {
        makers[d.decisionMaker] = { name: d.decisionMaker, total: 0, successful: 0, avgComplexity: 0, totalComplexity: 0 }
      }
      makers[d.decisionMaker].total++
      makers[d.decisionMaker].totalComplexity += d.complexity
      if (d.outcome === 'Success') makers[d.decisionMaker].successful++
    })
    return Object.values(makers).map(m => ({
      ...m,
      successRate: ((m.successful / m.total) * 100).toFixed(1),
      avgComplexity: (m.totalComplexity / m.total).toFixed(1)
    }))
  }, [decisionData])

  // Scenario impact analysis
  const scenarioImpact = useMemo(() => {
    const scenarios = {}
    decisionData.forEach(d => {
      if (!scenarios[d.scenario]) {
        scenarios[d.scenario] = { scenario: d.scenario, count: 0, costImpact: 0, timeImpact: 0, riskMitigated: 0 }
      }
      scenarios[d.scenario].count++
      scenarios[d.scenario].costImpact += d.costImpact
      scenarios[d.scenario].timeImpact += d.timeImpact
      scenarios[d.scenario].riskMitigated += d.riskMitigated
    })
    return Object.values(scenarios).map(s => ({
      ...s,
      avgCostImpact: (s.costImpact / s.count).toFixed(0),
      avgTimeImpact: (s.timeImpact / s.count).toFixed(1),
      avgRiskMitigated: (s.riskMitigated / s.count).toFixed(1)
    })).sort((a, b) => b.count - a.count)
  }, [decisionData])

  const scenarios = [...new Set(decisionData.map(d => d.scenario))]
  const outcomes = ['Success', 'Partial Success', 'Failed', 'Pending']
  const severities = ['Low', 'Medium', 'High', 'Critical']

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'Low': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'High': return 'bg-orange-100 text-orange-800'
      case 'Critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getOutcomeColor = (outcome) => {
    switch(outcome) {
      case 'Success': return 'bg-green-100 text-green-800'
      case 'Partial Success': return 'bg-blue-100 text-blue-800'
      case 'Failed': return 'bg-red-100 text-red-800'
      case 'Pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getOutcomeIcon = (outcome) => {
    switch(outcome) {
      case 'Success': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'Partial Success': return <Clock className="w-5 h-5 text-blue-600" />
      case 'Failed': return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'Pending': return <Zap className="w-5 h-5 text-gray-600" />
      default: return null
    }
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">🎯 Historical Decisions Repository</h1>
        <p className="text-slate-600">Record of all strategic decisions made during complex scenarios with advanced analytics</p>
      </div>

      <InlineDataImport templateId="operations" />

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-300 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'table', label: 'Decision Records', icon: BarChart3 },
          { id: 'outcomes', label: 'Outcome Analysis', icon: PieChartIcon },
          { id: 'makers', label: 'Decision Maker Performance', icon: Target },
          { id: 'scenarios', label: 'Scenario Impact', icon: LineChartIcon },
        ].map(tab => {
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Decisions</p>
              <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Successful</p>
              <p className="text-3xl font-bold text-green-600">{stats.successful}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Failed</p>
              <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Avg Complexity</p>
              <p className="text-3xl font-bold text-slate-800">{stats.avgComplexity}%</p>
            </div>
            <Zap className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Risk Mitigated</p>
              <p className="text-3xl font-bold text-slate-800">{stats.avgRiskMitigated}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Cost Savings</p>
              <p className="text-3xl font-bold text-slate-800">₹{(stats.totalCostSavings / 100000).toFixed(1)}L</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* TAB 1: DECISION RECORDS TABLE */}
      {activeTab === 'table' && (
        <>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-bold text-slate-800">Filters & Search</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Scenario, decision, route..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Scenario</label>
            <select
              value={filterScenario}
              onChange={(e) => {
                setFilterScenario(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Scenarios</option>
              {scenarios.map(scenario => (
                <option key={scenario} value={scenario}>{scenario}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Outcome</label>
            <select
              value={filterOutcome}
              onChange={(e) => {
                setFilterOutcome(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Outcomes</option>
              {outcomes.map(outcome => (
                <option key={outcome} value={outcome}>{outcome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Severity</label>
            <select
              value={filterSeverity}
              onChange={(e) => {
                setFilterSeverity(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Severity</option>
              {severities.map(severity => (
                <option key={severity} value={severity}>{severity}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Items/Page</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Decision Cards */}
      <div className="space-y-4">
        {paginatedData.map((decision, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
              {/* Left Section - Scenario & Date */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <p className="text-sm text-slate-600">{decision.date}</p>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{decision.scenario}</h3>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(decision.severity)}`}>
                    {decision.severity}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getOutcomeColor(decision.outcome)} flex items-center gap-1`}>
                    {getOutcomeIcon(decision.outcome)}
                    {decision.outcome}
                  </span>
                </div>
              </div>

              {/* Middle Section - Decisions */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Decisions Taken:</p>
                <div className="space-y-1">
                  {decision.decisions.map((dec, i) => (
                    <div key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{dec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Section - Impact Metrics */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Impact:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Cost Impact:</span>
                    <span className={`font-semibold ${decision.costImpact < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {decision.costImpact < 0 ? '-' : '+'}₹{Math.abs(decision.costImpact)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Time Impact:</span>
                    <span className={`font-semibold ${decision.timeImpact < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {decision.timeImpact < 0 ? '-' : '+'}
                      {Math.abs(decision.timeImpact)}d
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Satisfaction:</span>
                    <span className={`font-semibold ${decision.satisfactionImpact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {decision.satisfactionImpact > 0 ? '+' : ''}{decision.satisfactionImpact}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Far Right Section - Metrics */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Metrics:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Complexity:</span>
                    <span className="font-semibold text-slate-800">{decision.complexity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Risk Mitigated:</span>
                    <span className="font-semibold text-slate-800">{decision.riskMitigated}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Decision Maker:</span>
                    <span className="font-semibold text-slate-800">{decision.decisionMaker}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-700">Notes: </span>
                {decision.notes}
              </p>
            </div>

            {/* Additional Info */}
            <div className="border-t border-slate-200 mt-4 pt-4 flex gap-4 text-sm">
              <div>
                <span className="text-slate-600">Route: </span>
                <span className="font-semibold text-slate-800">{decision.route}</span>
              </div>
              <div>
                <span className="text-slate-600">Material: </span>
                <span className="font-semibold text-slate-800">{decision.material}</span>
              </div>
              <div>
                <span className="text-slate-600">Tonnage: </span>
                <span className="font-semibold text-slate-800">{decision.tonnage}T</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow mt-6 px-6 py-4 flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} decisions
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === pageNum
                      ? 'bg-blue-500 text-white'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
        </>
      )}

      {/* TAB 2: OUTCOME ANALYSIS */}
      {activeTab === 'outcomes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Decision Outcomes Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={outcomeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                    {outcomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#ef4444', '#f59e0b'][index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">📈 Success Rate Metrics</h3>
              <div className="space-y-4">
                {outcomeData.map((outcome, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-700">{outcome.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-slate-200 rounded-full h-2">
                        <div className="h-2 rounded-full" style={{ width: `${(outcome.value / stats.total) * 100}%`, backgroundColor: ['#10b981', '#3b82f6', '#ef4444', '#f59e0b'][idx] }} />
                      </div>
                      <span className="font-bold text-slate-900 w-12 text-right">{outcome.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DECISION MAKER PERFORMANCE */}
      {activeTab === 'makers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">👥 Decision Maker Performance Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={decisionMakerPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="successRate" fill="#10b981" name="Success Rate (%)" />
                <Bar dataKey="avgComplexity" fill="#3b82f6" name="Avg Complexity (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {decisionMakerPerformance.map((maker, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Decision Maker</p>
                    <p className="font-semibold text-slate-900">{maker.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Total Decisions</p>
                    <p className="font-bold text-blue-600">{maker.total}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Successful</p>
                    <p className="font-bold text-green-600">{maker.successful}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Success Rate</p>
                    <p className={`font-bold ${maker.successRate > 70 ? 'text-green-600' : 'text-yellow-600'}`}>{maker.successRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Avg Complexity</p>
                    <p className="font-semibold text-slate-900">{maker.avgComplexity}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SCENARIO IMPACT */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">🎯 Scenario Impact on Risk Mitigation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scenarioImpact}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="scenario" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgRiskMitigated" fill="#10b981" name="Avg Risk Mitigated (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {scenarioImpact.map((scenario, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Scenario</p>
                    <p className="font-semibold text-slate-900">{scenario.scenario}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Occurrences</p>
                    <p className="font-bold text-blue-600">{scenario.count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Avg Cost Impact</p>
                    <p className={`font-semibold ${scenario.avgCostImpact < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {scenario.avgCostImpact < 0 ? '-' : '+'}₹{Math.abs(scenario.avgCostImpact)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Avg Time Impact</p>
                    <p className={`font-semibold ${scenario.avgTimeImpact < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {scenario.avgTimeImpact < 0 ? '-' : '+'}
                      {Math.abs(scenario.avgTimeImpact)}d
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Risk Mitigated</p>
                    <p className="font-bold text-green-600">{scenario.avgRiskMitigated}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Effectiveness</p>
                    <p className={`font-bold ${scenario.avgRiskMitigated > 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {scenario.avgRiskMitigated > 50 ? 'High' : 'Medium'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
