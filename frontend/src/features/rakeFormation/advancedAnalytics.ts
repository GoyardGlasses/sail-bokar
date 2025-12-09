/**
 * Advanced Analytics System
 * Comprehensive analytics for rake formation and dispatch optimization
 */

export interface AnalyticsMetric {
  name: string
  value: number
  target: number
  variance: number
  trend: 'up' | 'down' | 'stable'
  unit: string
}

export interface PerformanceData {
  date: string
  rakes: number
  tonnage: number
  cost: number
  utilization: number
  onTimePercentage: number
  avgDelay: number
}

export interface RouteAnalytics {
  route: string
  totalShipments: number
  avgCost: number
  avgDelay: number
  onTimePercentage: number
  costVariance: number
  delayVariance: number
  riskScore: number
}

export interface MaterialAnalytics {
  material: string
  totalTonnage: number
  avgCostPerTonne: number
  qualityScore: number
  demandTrend: number
  utilizationRate: number
  wastePercentage: number
}

export interface CostAnalytics {
  period: string
  totalCost: number
  avgCostPerTonne: number
  costBreakdown: Record<string, number>
  costTrend: number
  savingsAchieved: number
  savingsPercentage: number
}

export interface KPIMetrics {
  onTimeDelivery: AnalyticsMetric
  costPerTonne: AnalyticsMetric
  rakeUtilization: AnalyticsMetric
  emptyRakes: AnalyticsMetric
  customerSatisfaction: AnalyticsMetric
  npsScore: AnalyticsMetric
  operationalEfficiency: AnalyticsMetric
  costSavings: AnalyticsMetric
}

/**
 * Generate KPI metrics
 */
export function generateKPIMetrics(): KPIMetrics {
  return {
    onTimeDelivery: {
      name: 'On-Time Delivery',
      value: 96.5,
      target: 95,
      variance: 1.5,
      trend: 'up',
      unit: '%',
    },
    costPerTonne: {
      name: 'Cost per Tonne',
      value: 78,
      target: 85,
      variance: -7,
      trend: 'down',
      unit: '₹',
    },
    rakeUtilization: {
      name: 'Rake Utilization',
      value: 91.2,
      target: 85,
      variance: 6.2,
      trend: 'up',
      unit: '%',
    },
    emptyRakes: {
      name: 'Empty Rakes',
      value: 2.1,
      target: 5,
      variance: -2.9,
      trend: 'down',
      unit: '%',
    },
    customerSatisfaction: {
      name: 'Customer Satisfaction',
      value: 4.7,
      target: 4.5,
      variance: 0.2,
      trend: 'up',
      unit: '/5',
    },
    npsScore: {
      name: 'NPS Score',
      value: 68,
      target: 60,
      variance: 8,
      trend: 'up',
      unit: 'points',
    },
    operationalEfficiency: {
      name: 'Operational Efficiency',
      value: 87.3,
      target: 80,
      variance: 7.3,
      trend: 'up',
      unit: '%',
    },
    costSavings: {
      name: 'Cost Savings',
      value: 15.2,
      target: 12,
      variance: 3.2,
      trend: 'up',
      unit: '%',
    },
  }
}

/**
 * Generate performance data for time period
 */
export function generatePerformanceData(days: number = 30): PerformanceData[] {
  const data: PerformanceData[] = []

  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - i - 1))

    data.push({
      date: date.toISOString().split('T')[0],
      rakes: Math.floor(Math.random() * 8) + 5,
      tonnage: Math.floor(Math.random() * 200) + 400,
      cost: Math.floor(Math.random() * 200000) + 300000,
      utilization: Math.floor(Math.random() * 20) + 75,
      onTimePercentage: Math.floor(Math.random() * 10) + 90,
      avgDelay: Math.random() * 2,
    })
  }

  return data
}

/**
 * Generate route analytics
 */
export function generateRouteAnalytics(): RouteAnalytics[] {
  const routes = [
    'Bokaro-Dhanbad',
    'Bokaro-Hatia',
    'Bokaro-Kolkata',
    'Bokaro-Patna',
    'Bokaro-Ranchi',
    'Bokaro-Durgapur',
    'Bokaro-Haldia',
  ]

  return routes.map((route) => ({
    route,
    totalShipments: Math.floor(Math.random() * 50) + 20,
    avgCost: Math.floor(Math.random() * 400) + 600,
    avgDelay: Math.random() * 3,
    onTimePercentage: Math.floor(Math.random() * 15) + 85,
    costVariance: Math.random() * 20,
    delayVariance: Math.random() * 2,
    riskScore: Math.floor(Math.random() * 40) + 10,
  }))
}

/**
 * Generate material analytics
 */
export function generateMaterialAnalytics(): MaterialAnalytics[] {
  const materials = ['Coal', 'Ore', 'Steel', 'Cement', 'Limestone']

  return materials.map((material) => ({
    material,
    totalTonnage: Math.floor(Math.random() * 5000) + 2000,
    avgCostPerTonne: Math.floor(Math.random() * 200) + 500,
    qualityScore: Math.floor(Math.random() * 20) + 80,
    demandTrend: Math.random() * 0.3 - 0.15,
    utilizationRate: Math.floor(Math.random() * 20) + 75,
    wastePercentage: Math.random() * 5,
  }))
}

/**
 * Generate cost analytics
 */
export function generateCostAnalytics(period: string = 'monthly'): CostAnalytics {
  const totalCost = Math.floor(Math.random() * 500000) + 1000000
  const avgCostPerTonne = Math.floor(Math.random() * 100) + 75

  return {
    period,
    totalCost,
    avgCostPerTonne,
    costBreakdown: {
      loading: totalCost * 0.15,
      transport: totalCost * 0.55,
      demurrage: totalCost * 0.1,
      toll: totalCost * 0.08,
      insurance: totalCost * 0.05,
      handling: totalCost * 0.07,
    },
    costTrend: -0.12, // -12% (decreasing)
    savingsAchieved: Math.floor(totalCost * 0.15),
    savingsPercentage: 15,
  }
}

/**
 * Calculate efficiency metrics
 */
export function calculateEfficiencyMetrics(
  rakes: number,
  totalLoad: number,
  totalCost: number,
  onTimeCount: number,
  totalShipments: number
): Record<string, number> {
  const avgLoadPerRake = totalLoad / rakes
  const costPerTonne = totalCost / totalLoad
  const utilizationRate = (avgLoadPerRake / 100) * 100 // assuming 100 tonne capacity
  const onTimePercentage = (onTimeCount / totalShipments) * 100

  return {
    avgLoadPerRake: Math.round(avgLoadPerRake),
    costPerTonne: Math.round(costPerTonne),
    utilizationRate: Math.round(utilizationRate),
    onTimePercentage: Math.round(onTimePercentage),
    emptyRakePercentage: Math.round(100 - utilizationRate),
    operationalEfficiency: Math.round(
      (utilizationRate * 0.4 + onTimePercentage * 0.4 + (100 - (100 - utilizationRate)) * 0.2)
    ),
  }
}

/**
 * Generate trend analysis
 */
export function generateTrendAnalysis(
  data: PerformanceData[]
): Record<string, { trend: number; direction: string }> {
  if (data.length < 2) {
    return {
      cost: { trend: 0, direction: 'stable' },
      utilization: { trend: 0, direction: 'stable' },
      onTime: { trend: 0, direction: 'stable' },
    }
  }

  const firstHalf = data.slice(0, Math.floor(data.length / 2))
  const secondHalf = data.slice(Math.floor(data.length / 2))

  const avgCostFirst = firstHalf.reduce((sum, d) => sum + d.cost, 0) / firstHalf.length
  const avgCostSecond = secondHalf.reduce((sum, d) => sum + d.cost, 0) / secondHalf.length
  const costTrend = ((avgCostSecond - avgCostFirst) / avgCostFirst) * 100

  const avgUtilFirst =
    firstHalf.reduce((sum, d) => sum + d.utilization, 0) / firstHalf.length
  const avgUtilSecond =
    secondHalf.reduce((sum, d) => sum + d.utilization, 0) / secondHalf.length
  const utilTrend = ((avgUtilSecond - avgUtilFirst) / avgUtilFirst) * 100

  const avgOnTimeFirst =
    firstHalf.reduce((sum, d) => sum + d.onTimePercentage, 0) / firstHalf.length
  const avgOnTimeSecond =
    secondHalf.reduce((sum, d) => sum + d.onTimePercentage, 0) / secondHalf.length
  const onTimeTrend = ((avgOnTimeSecond - avgOnTimeFirst) / avgOnTimeFirst) * 100

  return {
    cost: {
      trend: Math.round(costTrend * 100) / 100,
      direction: costTrend < 0 ? 'down' : costTrend > 0 ? 'up' : 'stable',
    },
    utilization: {
      trend: Math.round(utilTrend * 100) / 100,
      direction: utilTrend > 0 ? 'up' : utilTrend < 0 ? 'down' : 'stable',
    },
    onTime: {
      trend: Math.round(onTimeTrend * 100) / 100,
      direction: onTimeTrend > 0 ? 'up' : onTimeTrend < 0 ? 'down' : 'stable',
    },
  }
}

/**
 * Generate anomaly detection
 */
export function detectAnomalies(
  data: PerformanceData[]
): { date: string; metric: string; value: number; severity: 'low' | 'medium' | 'high' }[] {
  const anomalies: { date: string; metric: string; value: number; severity: 'low' | 'medium' | 'high' }[] = []

  // Calculate averages and standard deviations
  const avgCost = data.reduce((sum, d) => sum + d.cost, 0) / data.length
  const costStdDev = Math.sqrt(
    data.reduce((sum, d) => sum + Math.pow(d.cost - avgCost, 2), 0) / data.length
  )

  const avgUtil = data.reduce((sum, d) => sum + d.utilization, 0) / data.length
  const utilStdDev = Math.sqrt(
    data.reduce((sum, d) => sum + Math.pow(d.utilization - avgUtil, 2), 0) / data.length
  )

  // Detect anomalies (values > 2 standard deviations)
  data.forEach((d) => {
    if (Math.abs(d.cost - avgCost) > 2 * costStdDev) {
      anomalies.push({
        date: d.date,
        metric: 'Cost',
        value: d.cost,
        severity: Math.abs(d.cost - avgCost) > 3 * costStdDev ? 'high' : 'medium',
      })
    }

    if (Math.abs(d.utilization - avgUtil) > 2 * utilStdDev) {
      anomalies.push({
        date: d.date,
        metric: 'Utilization',
        value: d.utilization,
        severity: Math.abs(d.utilization - avgUtil) > 3 * utilStdDev ? 'high' : 'medium',
      })
    }

    if (d.onTimePercentage < 85) {
      anomalies.push({
        date: d.date,
        metric: 'On-Time %',
        value: d.onTimePercentage,
        severity: d.onTimePercentage < 75 ? 'high' : 'low',
      })
    }
  })

  return anomalies
}

/**
 * Generate recommendations based on analytics
 */
export function generateRecommendations(
  metrics: KPIMetrics,
  routeAnalytics: RouteAnalytics[],
  costAnalytics: CostAnalytics
): { title: string; description: string; impact: string; priority: 'high' | 'medium' | 'low' }[] {
  const recommendations: { title: string; description: string; impact: string; priority: 'high' | 'medium' | 'low' }[] = []

  // Cost optimization
  if (metrics.costPerTonne.variance < -10) {
    recommendations.push({
      title: 'Expand Cost Optimization',
      description: 'Current cost per tonne is 7% below target. Consider expanding optimization to more routes.',
      impact: 'Potential 5-8% additional savings',
      priority: 'high',
    })
  }

  // Utilization improvement
  if (metrics.rakeUtilization.value > 90) {
    recommendations.push({
      title: 'Increase Rake Capacity',
      description: 'Rake utilization is above 90%. Consider increasing rake sizes or frequency.',
      impact: '10-15% more throughput',
      priority: 'medium',
    })
  }

  // Route optimization
  const lowPerformingRoutes = routeAnalytics.filter((r) => r.onTimePercentage < 90)
  if (lowPerformingRoutes.length > 0) {
    recommendations.push({
      title: 'Optimize Low-Performing Routes',
      description: `Routes ${lowPerformingRoutes.map((r) => r.route).join(', ')} have on-time % below 90%.`,
      impact: '5-10% improvement in on-time delivery',
      priority: 'high',
    })
  }

  // Empty rake reduction
  if (metrics.emptyRakes.value > 3) {
    recommendations.push({
      title: 'Reduce Empty Rakes',
      description: 'Empty rakes are above 3%. Implement better load consolidation.',
      impact: '₹50-100L annual savings',
      priority: 'high',
    })
  }

  // Customer satisfaction
  if (metrics.customerSatisfaction.value < 4.5) {
    recommendations.push({
      title: 'Improve Customer Experience',
      description: 'Customer satisfaction is below target. Focus on delivery reliability and communication.',
      impact: 'Increase NPS by 10-15 points',
      priority: 'medium',
    })
  }

  return recommendations
}

/**
 * Calculate ROI metrics
 */
export function calculateROI(
  baselineCost: number,
  optimizedCost: number,
  implementationCost: number,
  timeframe: number = 12 // months
): Record<string, number> {
  const monthlySavings = (baselineCost - optimizedCost) / timeframe
  const totalSavings = monthlySavings * timeframe
  const roi = ((totalSavings - implementationCost) / implementationCost) * 100
  const paybackPeriod = implementationCost / monthlySavings

  return {
    monthlySavings: Math.round(monthlySavings),
    totalSavings: Math.round(totalSavings),
    implementationCost: Math.round(implementationCost),
    roi: Math.round(roi),
    paybackPeriodMonths: Math.round(paybackPeriod * 10) / 10,
    costReduction: Math.round(((baselineCost - optimizedCost) / baselineCost) * 100),
  }
}

/**
 * Generate comparison report
 */
export function generateComparisonReport(
  scenario1: string,
  scenario2: string,
  metrics1: Record<string, number>,
  metrics2: Record<string, number>
): Record<string, { scenario1: number; scenario2: number; difference: number; winner: string }> {
  const comparison: Record<string, { scenario1: number; scenario2: number; difference: number; winner: string }> = {}

  for (const key in metrics1) {
    const val1 = metrics1[key]
    const val2 = metrics2[key]
    const diff = val2 - val1
    const winner = diff > 0 ? scenario2 : scenario1

    comparison[key] = {
      scenario1: Math.round(val1 * 100) / 100,
      scenario2: Math.round(val2 * 100) / 100,
      difference: Math.round(diff * 100) / 100,
      winner,
    }
  }

  return comparison
}
