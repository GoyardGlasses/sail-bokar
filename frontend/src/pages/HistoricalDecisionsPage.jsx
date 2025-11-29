import React, { useState, useMemo } from 'react'
import { Search, Filter, TrendingUp, AlertCircle, CheckCircle, Clock, DollarSign, BarChart3, Calendar, Zap } from 'lucide-react'

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
  const materials = ['cr_coils', 'hr_coils', 'plates', 'wire_rods', 'tmt_bars', 'pig_iron', 'billets']

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
  const [decisionData] = useState(generateDecisionData())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterScenario, setFilterScenario] = useState('all')
  const [filterOutcome, setFilterOutcome] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [currentPage, setCurrentPage] = useState(1)

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
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Historical Decisions Repository</h1>
        <p className="text-slate-600">Record of all strategic decisions made during complex scenarios and their outcomes</p>
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
    </div>
  )
}
