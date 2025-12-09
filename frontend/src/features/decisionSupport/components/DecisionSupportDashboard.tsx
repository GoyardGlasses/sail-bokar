import React, { useState, useEffect } from 'react'
import { useMLPredictions } from '../../../context/MLPredictionsContext'
import {
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Target,
  Clock,
  DollarSign,
  Users,
  Truck,
  Package,
  MapPin,
  Calendar,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react'

interface ScenarioAnalysis {
  scenario: string
  probability: number
  impact: string
  recommendation: string
  reasoning: string[]
  metrics: {
    cost: number
    time: number
    risk: number
    efficiency: number
  }
}

interface DecisionRecommendation {
  id: string
  title: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  confidence: number
  decision: string
  reasoning: string[]
  scenarios: ScenarioAnalysis[]
  historicalData: {
    successRate: number
    averageOutcome: string
    pastInstances: number
    trend: 'improving' | 'stable' | 'declining'
  }
  affectedAspects: {
    operations: string
    finance: string
    customer: string
    sustainability: string
  }
  alternatives: {
    option: string
    pros: string[]
    cons: string[]
    score: number
  }[]
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical'
    factors: string[]
    mitigation: string[]
  }
  expectedOutcome: {
    bestCase: string
    worstCase: string
    mostLikely: string
  }
}

const mockDecisions: DecisionRecommendation[] = [
  {
    id: 'dec-001',
    title: 'Optimal Rake Formation for Next 48 Hours',
    priority: 'critical',
    confidence: 94,
    decision: 'Form 3 rakes immediately: BOKARO-001 (1200T), BOKARO-002 (1100T), BOKARO-003 (950T)',
    reasoning: [
      'Current inventory analysis shows 3,250T of material ready for dispatch',
      'Pending orders total 3,200T with 48-hour deadline',
      'Weather forecast indicates optimal conditions for next 36 hours',
      'Rail capacity availability is at 95% for next 48 hours',
      'Fuel prices are stable, no surge expected',
      'Historical data shows 96% success rate for similar formations',
    ],
    scenarios: [
      {
        scenario: 'Form 3 rakes now (Recommended)',
        probability: 85,
        impact: 'Positive',
        recommendation: 'Execute immediately',
        reasoning: [
          'Meets all customer deadlines',
          'Maximizes rake utilization (94%)',
          'Minimizes demurrage costs',
          'Aligns with weather window',
        ],
        metrics: {
          cost: 385000,
          time: 48,
          risk: 8,
          efficiency: 94,
        },
      },
      {
        scenario: 'Wait for more orders (Alternative)',
        probability: 10,
        impact: 'Neutral',
        recommendation: 'Not recommended',
        reasoning: [
          'Risk of missing SLAs',
          'Potential demurrage charges',
          'Weather deterioration expected',
          'Customer dissatisfaction risk',
        ],
        metrics: {
          cost: 425000,
          time: 72,
          risk: 35,
          efficiency: 78,
        },
      },
      {
        scenario: 'Form 4 smaller rakes (Alternative)',
        probability: 5,
        impact: 'Negative',
        recommendation: 'Not recommended',
        reasoning: [
          'Underutilizes capacity',
          'Increases per-unit cost',
          'Requires more coordination',
          'Higher operational complexity',
        ],
        metrics: {
          cost: 465000,
          time: 48,
          risk: 22,
          efficiency: 72,
        },
      },
    ],
    historicalData: {
      successRate: 96,
      averageOutcome: 'On-time delivery with 92% utilization',
      pastInstances: 47,
      trend: 'improving',
    },
    affectedAspects: {
      operations: 'Dispatch 3,200T material, 48-hour turnaround',
      finance: 'Cost: ₹3.85L, Revenue: ₹12.8L, Margin: 67%',
      customer: 'Meet SLA for Tata Steel, JSW Steel, SAIL Durgapur',
      sustainability: 'CO2: 8.2T, Fuel: 1,950L, Efficiency: 1.64T/L',
    },
    alternatives: [
      {
        option: 'Option A: Form 3 rakes now (Recommended)',
        pros: [
          'Meets all deadlines',
          'Maximizes utilization',
          'Optimal cost efficiency',
          'Historical success: 96%',
        ],
        cons: [
          'Requires immediate action',
          'No flexibility for new orders',
        ],
        score: 94,
      },
      {
        option: 'Option B: Wait for more orders',
        pros: [
          'Potential for better consolidation',
          'Flexibility for new orders',
        ],
        cons: [
          'Risk of missing SLAs',
          'Demurrage charges likely',
          'Weather deterioration',
          'Customer dissatisfaction',
        ],
        score: 42,
      },
      {
        option: 'Option C: Form 4 smaller rakes',
        pros: [
          'Faster dispatch',
          'More flexibility',
        ],
        cons: [
          'Lower utilization (72%)',
          'Higher per-unit cost',
          'Operational complexity',
          'Margin reduction',
        ],
        score: 38,
      },
    ],
    riskAssessment: {
      level: 'low',
      factors: [
        'Weather: Favorable for 36 hours',
        'Capacity: 95% available',
        'Demand: Confirmed orders',
        'Resources: All available',
      ],
      mitigation: [
        'Monitor weather updates hourly',
        'Maintain backup rake availability',
        'Confirm customer deadlines',
        'Have contingency routes ready',
      ],
    },
    expectedOutcome: {
      bestCase: 'All orders delivered on-time, 96% utilization, ₹12.8L revenue',
      worstCase: 'Minor delay (2-4 hours), 90% utilization, ₹11.5L revenue',
      mostLikely: 'On-time delivery, 94% utilization, ₹12.5L revenue',
    },
  },
  {
    id: 'dec-002',
    title: 'Dynamic Pricing Strategy for Next Week',
    priority: 'high',
    confidence: 88,
    decision: 'Increase prices by 12% for Jamshedpur route, maintain for Durgapur, reduce by 5% for Bellary',
    reasoning: [
      'Jamshedpur demand is 40% above average',
      'Competitor prices are 15% higher',
      'Fuel prices stable, no surge expected',
      'Historical data shows 88% success rate for similar pricing',
      'Customer demand elasticity analysis supports increase',
      'Market conditions favor premium pricing',
    ],
    scenarios: [
      {
        scenario: 'Increase prices 12% (Recommended)',
        probability: 75,
        impact: 'Positive',
        recommendation: 'Execute immediately',
        reasoning: [
          'Captures market demand',
          'Improves margin by 8%',
          'Maintains competitiveness',
          'Customer retention: 92%',
        ],
        metrics: {
          cost: 0,
          time: 0,
          risk: 12,
          efficiency: 88,
        },
      },
      {
        scenario: 'Maintain current prices',
        probability: 20,
        impact: 'Neutral',
        recommendation: 'Not recommended',
        reasoning: [
          'Leaves money on table',
          'Margin opportunity lost',
          'Competitors gaining share',
        ],
        metrics: {
          cost: 0,
          time: 0,
          risk: 5,
          efficiency: 72,
        },
      },
      {
        scenario: 'Increase prices 20%',
        probability: 5,
        impact: 'Negative',
        recommendation: 'Not recommended',
        reasoning: [
          'Risk of customer loss',
          'May trigger competition',
          'Demand elasticity concerns',
        ],
        metrics: {
          cost: 0,
          time: 0,
          risk: 35,
          efficiency: 65,
        },
      },
    ],
    historicalData: {
      successRate: 88,
      averageOutcome: 'Revenue increase 8-12%, customer retention 90%+',
      pastInstances: 23,
      trend: 'improving',
    },
    affectedAspects: {
      operations: 'No operational changes required',
      finance: 'Revenue increase: ₹1.2-1.5L/week, Margin: +8%',
      customer: 'Jamshedpur: +12%, Durgapur: Stable, Bellary: -5%',
      sustainability: 'No impact on CO2 emissions',
    },
    alternatives: [
      {
        option: 'Option A: Increase 12% (Recommended)',
        pros: [
          'Captures demand surge',
          'Improves margins',
          'Market-aligned pricing',
          '88% historical success',
        ],
        cons: [
          'Potential customer pushback',
          'Competitor response risk',
        ],
        score: 88,
      },
      {
        option: 'Option B: Maintain current prices',
        pros: [
          'No customer friction',
          'Stable relationships',
        ],
        cons: [
          'Leaves revenue on table',
          'Margin opportunity lost',
          'Competitors gaining advantage',
        ],
        score: 62,
      },
      {
        option: 'Option C: Increase 20%',
        pros: [
          'Maximum revenue capture',
        ],
        cons: [
          'High churn risk',
          'Competitor response',
          'Demand elasticity concerns',
        ],
        score: 35,
      },
    ],
    riskAssessment: {
      level: 'medium',
      factors: [
        'Competitor response risk',
        'Customer churn risk',
        'Market volatility',
        'Demand elasticity',
      ],
      mitigation: [
        'Monitor competitor pricing daily',
        'Track customer response metrics',
        'Prepare rollback plan',
        'Communicate value proposition',
      ],
    },
    expectedOutcome: {
      bestCase: 'Revenue +15%, Margin +10%, Retention 95%',
      worstCase: 'Revenue +5%, Margin +3%, Retention 85%',
      mostLikely: 'Revenue +10%, Margin +8%, Retention 92%',
    },
  },
  {
    id: 'dec-003',
    title: 'Fleet Maintenance Schedule Optimization',
    priority: 'high',
    confidence: 91,
    decision: 'Schedule maintenance for BOKARO-001, BOKARO-004, BOKARO-005 in next 72 hours',
    reasoning: [
      'Predictive analysis shows 85% failure risk for BOKARO-001',
      'BOKARO-004 fuel efficiency declining 8%',
      'BOKARO-005 brake pads at 40% remaining',
      'Historical data: 91% success rate for preventive maintenance',
      'Maintenance window available: 72 hours',
      'Spare parts inventory: Adequate',
    ],
    scenarios: [
      {
        scenario: 'Schedule maintenance now (Recommended)',
        probability: 88,
        impact: 'Positive',
        recommendation: 'Execute immediately',
        reasoning: [
          'Prevents breakdowns',
          'Improves efficiency',
          'Reduces emergency costs',
          'Maintains SLA compliance',
        ],
        metrics: {
          cost: 125000,
          time: 72,
          risk: 5,
          efficiency: 91,
        },
      },
      {
        scenario: 'Delay maintenance 1 week',
        probability: 10,
        impact: 'Negative',
        recommendation: 'Not recommended',
        reasoning: [
          'High breakdown risk',
          'Emergency repair costs',
          'SLA violation risk',
          'Customer dissatisfaction',
        ],
        metrics: {
          cost: 280000,
          time: 168,
          risk: 75,
          efficiency: 65,
        },
      },
      {
        scenario: 'Emergency maintenance only',
        probability: 2,
        impact: 'Negative',
        recommendation: 'Not recommended',
        reasoning: [
          'Reactive approach',
          '3x higher costs',
          'Operational disruption',
          'Safety concerns',
        ],
        metrics: {
          cost: 350000,
          time: 48,
          risk: 85,
          efficiency: 45,
        },
      },
    ],
    historicalData: {
      successRate: 91,
      averageOutcome: 'Prevents 2-3 breakdowns, saves ₹150K+',
      pastInstances: 34,
      trend: 'improving',
    },
    affectedAspects: {
      operations: 'Downtime: 72 hours, Fleet availability: 83% (temporary)',
      finance: 'Cost: ₹1.25L, Savings: ₹1.5-2L (prevented breakdowns)',
      customer: 'Temporary: 2 rakes unavailable, Backup rakes available',
      sustainability: 'Improved efficiency: +8%, Fuel savings: 150L/month',
    },
    alternatives: [
      {
        option: 'Option A: Schedule now (Recommended)',
        pros: [
          'Prevents breakdowns',
          'Improves efficiency',
          'Reduces costs',
          '91% historical success',
        ],
        cons: [
          'Temporary capacity reduction',
          'Upfront maintenance cost',
        ],
        score: 91,
      },
      {
        option: 'Option B: Delay 1 week',
        pros: [
          'Maintains full capacity',
          'Defers costs',
        ],
        cons: [
          'High breakdown risk',
          'Emergency repair costs',
          'SLA violation risk',
          'Customer dissatisfaction',
        ],
        score: 28,
      },
      {
        option: 'Option C: Emergency maintenance only',
        pros: [
          'Minimal planning',
        ],
        cons: [
          '3x higher costs',
          'Operational disruption',
          'Safety concerns',
          'Reactive approach',
        ],
        score: 15,
      },
    ],
    riskAssessment: {
      level: 'medium',
      factors: [
        'Temporary capacity reduction',
        'Maintenance execution risk',
        'Spare parts availability',
        'Technician availability',
      ],
      mitigation: [
        'Confirm spare parts availability',
        'Schedule backup rakes',
        'Notify customers in advance',
        'Have contingency routes ready',
      ],
    },
    expectedOutcome: {
      bestCase: 'All maintenance completed, 0 breakdowns, +10% efficiency',
      worstCase: 'Partial maintenance, 1 breakdown, +5% efficiency',
      mostLikely: 'All maintenance completed, 0 breakdowns, +8% efficiency',
    },
  },
]

export default function DecisionSupportDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'decisions' | 'scenarios' | 'analysis'>('overview')
  const [selectedDecision, setSelectedDecision] = useState<DecisionRecommendation | null>(mockDecisions[0] ?? null)
  const [filterPriority, setFilterPriority] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all')
  const [sortBy, setSortBy] = useState<'confidence' | 'priority' | 'impact'>('confidence')

  const { dataImported, getPrediction } = useMLPredictions()

  // Runtime decisions: start from mock decisions and enrich with ML-driven ones when available
  let runtimeDecisions: DecisionRecommendation[] = mockDecisions

  if (dataImported) {
    try {
      const raw: any = getPrediction('decision_support')
      const items: any[] = Array.isArray(raw) ? raw : raw ? [raw] : []

      if (items.length > 0) {
        const base = mockDecisions[0]

        const mlDecisions: DecisionRecommendation[] = items.map((item, index) => {
          const confSource: number | undefined =
            typeof item?.confidence === 'number'
              ? item.confidence
              : typeof item?.confidence_score === 'number'
                ? item.confidence_score
                : typeof item?.probability === 'number'
                  ? item.probability
                  : undefined

          const confidence = confSource !== undefined
            ? (confSource <= 1 ? Math.round(confSource * 100) : Math.round(confSource))
            : base.confidence

          const priorityMap: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
            critical: 'critical',
            high: 'high',
            medium: 'medium',
            low: 'low',
          }

          const prioritySource = (item?.priority || item?.severity || base.priority).toString().toLowerCase()
          const mappedPriority = priorityMap[prioritySource] ?? base.priority

          const decisionText =
            item?.recommended_action ||
            item?.decision ||
            item?.action ||
            base.decision

          let reasoningLines: string[]
          if (Array.isArray(item?.reasoning)) {
            reasoningLines = item.reasoning.map((r: any) => String(r))
          } else if (Array.isArray(item?.factors)) {
            reasoningLines = item.factors.map((f: any) => String(f))
          } else if (item?.rationale) {
            reasoningLines = [String(item.rationale)]
          } else {
            reasoningLines = base.reasoning
          }

          return {
            ...base,
            id: item?.id || item?.decisionId || `ml-dec-${index + 1}`,
            title: item?.title || item?.decision_title || base.title,
            priority: mappedPriority,
            confidence,
            decision: decisionText,
            reasoning: reasoningLines,
          }
        })

        if (mlDecisions.length > 0) {
          runtimeDecisions = [...mlDecisions, ...mockDecisions]
        }
      }
    } catch (e) {
      runtimeDecisions = mockDecisions
    }
  }

  const filteredDecisions = runtimeDecisions.filter(d => filterPriority === 'all' || d.priority === filterPriority)

  const sortedDecisions = [...filteredDecisions].sort((a, b) => {
    if (sortBy === 'confidence') return b.confidence - a.confidence
    if (sortBy === 'priority') {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return 0
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-green-100 text-green-800 border-green-300'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600'
    if (confidence >= 80) return 'text-blue-600'
    if (confidence >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Decision Support System</h1>
            <p className="text-gray-600 text-sm">Intelligent recommendations based on all data & historical analysis</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Decisions</p>
              <p className="text-3xl font-bold text-gray-900">{runtimeDecisions.length}</p>
              <p className="text-xs text-gray-500 mt-2">Requiring action</p>
            </div>
            <Brain className="w-12 h-12 text-purple-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Critical Priority</p>
              <p className="text-3xl font-bold text-gray-900">{runtimeDecisions.filter(d => d.priority === 'critical').length}</p>
              <p className="text-xs text-red-600 mt-2">Immediate action needed</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Confidence</p>
              <p className="text-3xl font-bold text-gray-900">{Math.round(runtimeDecisions.reduce((sum, d) => sum + d.confidence, 0) / (runtimeDecisions.length || 1))}%</p>
              <p className="text-xs text-green-600 mt-2">High reliability</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Potential Impact</p>
              <p className="text-3xl font-bold text-gray-900">₹4.2L</p>
              <p className="text-xs text-blue-600 mt-2">Weekly revenue opportunity</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-100" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 bg-white rounded-t-lg p-4">
        {(['overview', 'decisions', 'scenarios', 'analysis'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">System Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Data Sources Analyzed</p>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-900">Inventory & Material Availability</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-900">Customer Orders & Deadlines</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-900">Fleet Status & Maintenance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-900">Market Conditions & Pricing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-900">Weather & Traffic Conditions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-900">Historical Performance Data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-900">Financial & Cost Analysis</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Analysis Methodology</p>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-900">Multi-scenario analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-900">Historical pattern matching</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-900">Risk assessment & mitigation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-900">Cost-benefit analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-900">Confidence scoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-900">Alternative comparison</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-900">Outcome prediction</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Recommendations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Recommendations</h2>
            <div className="space-y-4">
              {sortedDecisions.slice(0, 3).map(decision => (
                <div
                  key={decision.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedDecision(decision)
                    setActiveTab('decisions')
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{decision.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{decision.decision}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(decision.priority)}`}>
                      {decision.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className={`font-bold ${getConfidenceColor(decision.confidence)}`}>{decision.confidence}%</span>
                      <span className="text-gray-600">Confidence</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-gray-900">{decision.historicalData.successRate}%</span>
                      <span className="text-gray-600">Historical Success</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Decisions Tab */}
      {activeTab === 'decisions' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 flex gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Priority</label>
              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value as any)}
                className="mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Sort By</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="confidence">Confidence</option>
                <option value="priority">Priority</option>
                <option value="impact">Impact</option>
              </select>
            </div>
          </div>

          {/* Decisions List */}
          <div className="space-y-4">
            {sortedDecisions.map(decision => (
              <div
                key={decision.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedDecision(decision)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{decision.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(decision.priority)}`}>
                        {decision.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-700 font-semibold">{decision.decision}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getConfidenceColor(decision.confidence)}`}>{decision.confidence}%</p>
                    <p className="text-xs text-gray-600">Confidence</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 rounded p-3">
                    <p className="text-xs text-gray-600">Historical Success</p>
                    <p className="text-lg font-bold text-blue-600">{decision.historicalData.successRate}%</p>
                  </div>
                  <div className="bg-green-50 rounded p-3">
                    <p className="text-xs text-gray-600">Past Instances</p>
                    <p className="text-lg font-bold text-green-600">{decision.historicalData.pastInstances}</p>
                  </div>
                  <div className="bg-purple-50 rounded p-3">
                    <p className="text-xs text-gray-600">Trend</p>
                    <p className="text-lg font-bold text-purple-600 capitalize">{decision.historicalData.trend}</p>
                  </div>
                  <div className="bg-orange-50 rounded p-3">
                    <p className="text-xs text-gray-600">Risk Level</p>
                    <p className="text-lg font-bold text-orange-600 capitalize">{decision.riskAssessment.level}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Key Reasoning:</p>
                  <ul className="space-y-1">
                    {decision.reasoning.slice(0, 3).map((reason, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <button className="text-purple-600 font-semibold text-sm hover:text-purple-700">
                  View Full Analysis →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scenarios Tab */}
      {activeTab === 'scenarios' && selectedDecision && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedDecision.title}</h2>

            <div className="space-y-6">
              {selectedDecision.scenarios.map((scenario, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{scenario.scenario}</h3>
                      <p className="text-sm text-gray-600 mt-1">{scenario.recommendation}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{scenario.probability}%</p>
                      <p className="text-xs text-gray-600">Probability</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600">Cost</p>
                      <p className="text-lg font-bold text-gray-900">₹{(scenario.metrics.cost / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600">Time</p>
                      <p className="text-lg font-bold text-gray-900">{scenario.metrics.time}h</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600">Risk</p>
                      <p className="text-lg font-bold text-gray-900">{scenario.metrics.risk}%</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600">Efficiency</p>
                      <p className="text-lg font-bold text-gray-900">{scenario.metrics.efficiency}%</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">Reasoning:</p>
                    <ul className="space-y-1">
                      {scenario.reasoning.map((reason, ridx) => (
                        <li key={ridx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analysis Tab */}
      {activeTab === 'analysis' && selectedDecision && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedDecision.title} - Detailed Analysis</h2>

            {/* Affected Aspects */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Affected Aspects</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900">Operations</p>
                  <p className="text-gray-700 mt-2">{selectedDecision.affectedAspects.operations}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm font-semibold text-green-900">Finance</p>
                  <p className="text-gray-700 mt-2">{selectedDecision.affectedAspects.finance}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm font-semibold text-purple-900">Customer</p>
                  <p className="text-gray-700 mt-2">{selectedDecision.affectedAspects.customer}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <p className="text-sm font-semibold text-orange-900">Sustainability</p>
                  <p className="text-gray-700 mt-2">{selectedDecision.affectedAspects.sustainability}</p>
                </div>
              </div>
            </div>

            {/* Alternatives */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Alternative Options</h3>
              <div className="space-y-4">
                {selectedDecision.alternatives.map((alt, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-gray-900">{alt.option}</h4>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{alt.score}</p>
                        <p className="text-xs text-gray-600">/100</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-green-700 mb-2">Pros:</p>
                        <ul className="space-y-1">
                          {alt.pros.map((pro, pidx) => (
                            <li key={pidx} className="text-sm text-gray-700 flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-red-700 mb-2">Cons:</p>
                        <ul className="space-y-1">
                          {alt.cons.map((con, cidx) => (
                            <li key={cidx} className="text-sm text-gray-700 flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Risk Assessment</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Risk Level: <span className={`font-bold ${selectedDecision.riskAssessment.level === 'critical' ? 'text-red-600' : selectedDecision.riskAssessment.level === 'high' ? 'text-orange-600' : selectedDecision.riskAssessment.level === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {selectedDecision.riskAssessment.level.toUpperCase()}
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Risk Factors:</p>
                  <ul className="space-y-1">
                    {selectedDecision.riskAssessment.factors.map((factor, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Mitigation Strategies:</p>
                  <ul className="space-y-1">
                    {selectedDecision.riskAssessment.mitigation.map((mit, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {mit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Expected Outcomes */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Expected Outcomes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm font-semibold text-green-900">Best Case</p>
                  <p className="text-gray-700 mt-2">{selectedDecision.expectedOutcome.bestCase}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <p className="text-sm font-semibold text-yellow-900">Most Likely</p>
                  <p className="text-gray-700 mt-2">{selectedDecision.expectedOutcome.mostLikely}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm font-semibold text-red-900">Worst Case</p>
                  <p className="text-gray-700 mt-2">{selectedDecision.expectedOutcome.worstCase}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
