import React, { useState, useMemo, useEffect } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
} from 'recharts'
import { Calendar, Download, Settings, Play, TrendingUp, DollarSign, Zap, Target } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import ChartCard from '../components/ChartCard'
import DataTable from '../components/DataTable'
import { useMLPredictions } from '../context/MLPredictionsContext'
import { useImportedData } from '../hooks/useImportedData'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'
import InlineDecisionSummary from '../features/decisionSupport/components/InlineDecisionSummary'
import {
  runRakeOptimizer,
  getRakePlan,
  getRakePlanHistory,
  getRakePlanById,
  runMultiPeriodRakeOptimizer,
  getMultiPeriodRakePlan,
} from '../api/endpoints'

const RakePlanner = () => {
  const { dataImported, getPrediction, lastUpdated } = useMLPredictions()
  const [mlVehicleAllocation, setMlVehicleAllocation] = useState(null)
  const [mlMinLoadingTime, setMlMinLoadingTime] = useState(null)
  const [activeTab, setActiveTab] = useState('formation')
  const [dateRange, setDateRange] = useState('Oct 6, 2025')
  const [rakePlan, setRakePlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [baselinePlanId, setBaselinePlanId] = useState('')
  const [comparisonPlanId, setComparisonPlanId] = useState('')
  const [baselineSummary, setBaselineSummary] = useState(null)
  const [comparisonSummary, setComparisonSummary] = useState(null)
  const [multiPeriodPlan, setMultiPeriodPlan] = useState(null)
  const [multiLoading, setMultiLoading] = useState(false)
  const [multiError, setMultiError] = useState(null)
  const { data: importedData, isLoaded } = useImportedData()

  // Keep ML vehicle allocation prediction in sync with latest pipeline outputs
  useEffect(() => {
    if (!getPrediction) return
    const vehicleAlloc = getPrediction('vehicle_allocation')
    const minLoading = getPrediction('minimum_loading_time')
    setMlVehicleAllocation(vehicleAlloc)
    setMlMinLoadingTime(minLoading)
  }, [lastUpdated, getPrediction])

  // Try to load an existing rake plan when the page mounts
  useEffect(() => {
    const fetchExistingPlan = async () => {
      try {
        const res = await getRakePlan()
        if (res && res.rake_plan) {
          setRakePlan(res.rake_plan)
        }
      } catch (err) {
        // 400 here just means no plan yet; ignore silently
        if (err?.response?.status !== 400) {
          console.error('Failed to load existing rake plan', err)
        }
      }
    }

    fetchExistingPlan()
  }, [])

  // Try to load an existing multi-period rake plan when the page mounts
  useEffect(() => {
    const fetchExistingMultiPlan = async () => {
      try {
        const res = await getMultiPeriodRakePlan()
        if (res && res.multi_period_rake_plan) {
          setMultiPeriodPlan(res.multi_period_rake_plan)
        }
      } catch (err) {
        // 400 here just means no multi-period plan yet; ignore silently
        if (err?.response?.status !== 400) {
          console.error('Failed to load existing multi-period rake plan', err)
        }
      }
    }

    fetchExistingMultiPlan()
  }, [])

  // Load rake plan history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getRakePlanHistory(20)
        if (res && Array.isArray(res.plans)) {
          setHistory(res.plans)
        }
      } catch (err) {
        console.error('Failed to load rake plan history', err)
      }
    }

    fetchHistory()
  }, [])

  const handleRunOptimization = async () => {
    if (!dataImported) {
      setError('Please upload & analyze data using the import panel above or in the Data Import Center.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await runRakeOptimizer(1)
      if (res && res.rake_plan) {
        setRakePlan(res.rake_plan)
        // Refresh history after a successful run
        try {
          const historyRes = await getRakePlanHistory(20)
          if (historyRes && Array.isArray(historyRes.plans)) {
            setHistory(historyRes.plans)
          }
        } catch (historyErr) {
          console.error('Failed to refresh rake plan history', historyErr)
        }
      }
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || 'Failed to run optimizer'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleRunMultiPeriodOptimization = async () => {
    if (!dataImported) {
      setMultiError('Please upload & analyze data using the import panel above or in the Data Import Center.')
      return
    }

    setMultiLoading(true)
    setMultiError(null)

    try {
      const res = await runMultiPeriodRakeOptimizer(3)
      if (res && res.multi_period_rake_plan) {
        setMultiPeriodPlan(res.multi_period_rake_plan)
      }
    } catch (err) {
      const message =
        err?.response?.data?.detail || err.message || 'Failed to run multi-period optimizer'
      setMultiError(message)
    } finally {
      setMultiLoading(false)
    }
  }

  const handleExportPlan = () => {
    if (!rakePlan) {
      return
    }
    try {
      const blob = new Blob([JSON.stringify(rakePlan, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const planId = rakePlan.plan_id || 'rake-plan'
      link.href = url
      link.download = `${planId}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export rake plan', err)
    }
  }

  const optimizationMetrics = useMemo(() => {
    if (mlVehicleAllocation && typeof mlVehicleAllocation === 'object') {
      const alloc = mlVehicleAllocation
      const totalDemand = Number(alloc.total_demand || alloc.totalDemand || alloc.total_demand_tonnes || 0) || 0
      const availableCapacity = Number(alloc.available_capacity || alloc.availableCapacity || 0) || 0
      const util = Number(alloc.capacity_utilization || alloc.capacityUtilization || 0) || 0
      const availableRakes = Number(alloc.available_rakes || alloc.availableRakes || 0) || 0
      let confidence = typeof alloc.confidence === 'number' ? alloc.confidence : 0.9
      if (!Number.isFinite(confidence) || confidence <= 0) confidence = 0.9
      if (confidence > 1) confidence = confidence / 100
      return [
        {
          title: 'Total Demand (ML)',
          value: `${totalDemand.toFixed(0)} T`,
          unit: '',
          change: 'From vehicle_allocation model',
        },
        {
          title: 'Available Capacity',
          value: `${availableCapacity.toFixed(0)} T`,
          unit: '',
          change: `${availableRakes} rakes available`,
        },
        {
          title: 'Capacity Utilisation',
          value: `${util.toFixed(1)}%`,
          unit: '',
          change: alloc.recommendation || 'Utilisation guidance',
        },
        {
          title: 'ML Confidence',
          value: `${Math.round(confidence * 100)}%`,
          unit: '',
          change: 'Vehicle allocation model',
        },
      ]
    }
    return [
      { title: 'Demurrage Cost Reduction', value: '₹2.40 L', unit: '', change: 'Monthly Savings' },
      { title: 'Cost per Ton', value: '₹950', unit: '', change: 'Target: ₹950' },
      { title: 'Rake Utilization', value: '16.5%', unit: '', change: 'Improvement to 85%' },
      { title: 'On-Time Delivery', value: '+22.7%', unit: '', change: 'Improvement to 95%' },
    ]
  }, [mlVehicleAllocation])

  const rakePlanSummary = useMemo(() => {
    if (!rakePlan || !rakePlan.solution || !rakePlan.solution.summary) {
      return null
    }

    const summary = rakePlan.solution.summary || {}
    const totalCost = Number(summary.total_cost || 0)
    const totalTonnage = Number(summary.total_tonnage || 0)
    const totalRakes = Number(summary.total_rakes || 0)
    const totalTrucks = Number(summary.total_trucks || 0)
    const estimatedDays = Number(summary.estimated_completion_days || 0)
    const costPerTonne = totalTonnage > 0 ? totalCost / totalTonnage : 0

    const allocSource = Array.isArray(mlVehicleAllocation) ? mlVehicleAllocation[0] : mlVehicleAllocation
    const totalDemand =
      allocSource && typeof allocSource === 'object'
        ? Number(
            allocSource.total_demand ||
              allocSource.totalDemand ||
              allocSource.total_demand_tonnes ||
              0,
          ) || 0
        : 0
    const availableCapacity =
      allocSource && typeof allocSource === 'object'
        ? Number(allocSource.available_capacity || allocSource.availableCapacity || 0) || 0
        : 0
    const capacityUtil =
      allocSource && typeof allocSource === 'object'
        ? Number(allocSource.capacity_utilization || allocSource.capacityUtilization || 0) || 0
        : 0

    const minLoadSource = Array.isArray(mlMinLoadingTime) ? mlMinLoadingTime[0] : mlMinLoadingTime
    const fastestLoadingPoint =
      minLoadSource && typeof minLoadSource === 'object'
        ? minLoadSource.fastest_loading_point || null
        : null
    const fastestTimeHours =
      minLoadSource && typeof minLoadSource === 'object'
        ? Number(minLoadSource.fastest_time_hours || 0) || 0
        : 0
    const referenceRakeTonnage =
      minLoadSource && typeof minLoadSource === 'object'
        ? Number(minLoadSource.reference_rake_tonnage || 0) || 0
        : 0

    const importedOrders =
      isLoaded && importedData && Array.isArray(importedData.orders) ? importedData.orders.length : 0

    return {
      totalCost,
      totalTonnage,
      totalRakes,
      totalTrucks,
      estimatedDays,
      costPerTonne,
      totalDemand,
      availableCapacity,
      capacityUtil,
      fastestLoadingPoint,
      fastestTimeHours,
      referenceRakeTonnage,
      importedOrders,
    }
  }, [rakePlan, mlVehicleAllocation, mlMinLoadingTime, importedData, isLoaded])

  const defaultRakeFormationData = [
    {
      id: 'SAIL-R001',
      source: 'LPI_Bokaro',
      destination: 'Haldia_Port_User',
      wagons: '64 (BOXN)',
      load: 3800,
      utilization: '98.7%',
      delayRisk: '12%',
      cost: '9,21,500',
    },
    {
      id: 'SAIL-R002',
      source: 'LP2_Bokaro',
      destination: 'Jamshedpur_Manufacturing',
      wagons: '58 (BOXN)',
      load: 3500,
      utilization: '97.2%',
      delayRisk: '8%',
      cost: '8,75,000',
    },
    {
      id: 'SAIL-R003',
      source: 'LP3_Bokaro',
      destination: 'Siliguri_Supplier',
      wagons: '55 (BRN)',
      load: 3200,
      utilization: '92.3%',
      delayRisk: '21%',
      cost: '7,85,000',
    },
  ]

  const beforeAfterData = [
    { metric: 'Cost/Tonne (₹)', before: 1200, after: 950 },
    { metric: 'Utilization (%)', before: 72, after: 85 },
    { metric: 'On-Time Rate (%)', before: 85, after: 95 },
  ]

  const predictedRakesData = [
    { destination: 'Haldia_Port_User', rakes: 7, color: '#06b6d4' },
    { destination: 'Jamshedpur_Manufacturing', rakes: 5, color: '#06b6d4' },
    { destination: 'Siliguri_Supplier', rakes: 4, color: '#06b6d4' },
    { destination: 'Gaya_Trader', rakes: 3, color: '#06b6d4' },
  ]

  // Cost-benefit analysis
  const rakeFormationData = useMemo(() => {
    if (rakePlan && rakePlan.solution && Array.isArray(rakePlan.solution.rakes) && rakePlan.solution.rakes.length > 0) {
      return rakePlan.solution.rakes.map((r) => {
        const wagons = Number(r.wagons || 0)
        const tonnes = Number(r.tonnes || 0)
        const capacityTonnes = wagons * 63
        const utilizationPct = capacityTonnes > 0 ? Math.round((tonnes / capacityTonnes) * 100) : 0

        return {
          id: r.rake_id || 'RAKE',
          source: 'Bokaro',
          destination: r.destination || 'N/A',
          wagons: `${wagons || 0} (BOXN)`,
          load: tonnes,
          utilization: `${utilizationPct}%`,
          delayRisk: `${Math.round(((r.estimated_delay_hours || 0) / 24) * 100) || 0}%`,
          cost: (Number(r.estimated_cost || 0)).toLocaleString('en-IN'),
        }
      })
    }

    return defaultRakeFormationData
  }, [rakePlan])

  const costBenefitData = useMemo(() => {
    return rakeFormationData.map((rake) => ({
      rakeId: rake.id,
      cost: parseInt(rake.cost.replace(/,/g, '')),
      revenue: parseInt(rake.cost.replace(/,/g, '')) * 1.3,
      profit: parseInt(rake.cost.replace(/,/g, '')) * 0.3,
      utilization: parseInt(rake.utilization),
      efficiency: parseInt(rake.utilization) > 95 ? 'Excellent' : 'Good',
    }))
  }, [rakeFormationData])

  // Destination analysis
  const destinationAnalysis = useMemo(() => {
    return [
      { destination: 'Haldia_Port_User', rakes: 7, avgCost: 921500, avgUtilization: 98.7, efficiency: 'High' },
      { destination: 'Jamshedpur_Manufacturing', rakes: 5, avgCost: 875000, avgUtilization: 97.2, efficiency: 'High' },
      { destination: 'Siliguri_Supplier', rakes: 4, avgCost: 785000, avgUtilization: 92.3, efficiency: 'Medium' },
    ]
  }, [])

  const columns = [
    { key: 'id', label: 'Rake ID', sortable: true },
    { key: 'source', label: 'Source', sortable: true },
    { key: 'destination', label: 'Destination', sortable: true },
    { key: 'wagons', label: 'Wagons (Type)', sortable: false },
    { key: 'load', label: 'Load (T)', sortable: true },
    { key: 'utilization', label: 'Utilization', sortable: true },
    {
      key: 'delayRisk',
      label: 'Delay Risk',
      render: (value) => (
        <span className={value === '12%' || value === '8%' ? 'text-green-400' : 'text-yellow-400'}>
          {value}
        </span>
      ),
    },
    { key: 'cost', label: 'Cost (₹)', sortable: true },
  ]

  const activeTabLabel =
    activeTab === 'formation'
      ? 'Daily Rake Plan & Dispatch'
      : activeTab === 'multi'
        ? 'Multi-Period Plan'
        : activeTab === 'comparison'
          ? 'Before vs. After Optimization'
          : activeTab === 'prediction'
            ? 'Predicted Rakes Required'
            : activeTab === 'costbenefit'
              ? 'Cost-Benefit Analysis'
              : undefined

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Daily Rake Plan & Dispatch</h1>
        <p className="text-slate-600">
          Generate an AI-powered daily rake formation and dispatch plan that matches today&apos;s orders, inventory,
          rake availability, and loading constraints while minimizing logistics cost and delays.
        </p>
      </div>

      <InlineDataImport templateId="rake" />

      {/* Configuration Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Optimization Parameters</h3>
        <p className="text-sm text-slate-400 mb-6">Provide operational inputs to generate the dispatch plan.</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Dispatch Date</label>
            <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-4 py-2">
              <Calendar size={18} className="text-slate-400" />
              <input
                type="text"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent text-white outline-none flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Material Availability (Tons)</label>
            <input
              type="text"
              defaultValue="15000"
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Wagon Availability (BOXN)</label>
            <input
              type="text"
              defaultValue="190"
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Max Cost per Ton (₹)</label>
            <input
              type="text"
              defaultValue="500"
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {history && history.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Load Previous Plan</label>
            <select
              value={selectedPlanId}
              onChange={async (e) => {
                const value = e.target.value
                setSelectedPlanId(value)
                if (!value) return
                try {
                  const res = await getRakePlanById(value)
                  if (res && res.rake_plan) {
                    setRakePlan(res.rake_plan)
                  }
                } catch (err) {
                  console.error('Failed to load selected rake plan', err)
                }
              }}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">Select a previous plan</option>
              {history
                .slice()
                .reverse()
                .map((h) => (
                  <option key={h.plan_id} value={h.plan_id}>
                    {h.plan_id} — ₹{Number(h.total_cost || 0).toLocaleString('en-IN')} for{' '}
                    {Number(h.total_tonnage || 0).toFixed(0)}T
                  </option>
                ))}
            </select>
          </div>
        )}

        <button
          onClick={handleRunOptimization}
          disabled={loading}
          className={`bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-8 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          <Play size={18} />
          {loading ? 'Running Optimizer...' : 'Run Optimization'}
        </button>

        <button
          onClick={handleRunMultiPeriodOptimization}
          disabled={multiLoading}
          className={`mt-3 bg-slate-700 hover:bg-slate-600 text-white font-medium px-8 py-2 rounded-lg border border-cyan-500 transition-colors flex items-center gap-2 ${
            multiLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          <Play size={18} />
          {multiLoading ? 'Running Multi-Period (3-day)...' : 'Run Multi-Period (3-day) Plan'}
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}

        {multiError && (
          <p className="mt-2 text-sm text-red-400">
            {multiError}
          </p>
        )}

        {rakePlan && rakePlan.solution && rakePlan.solution.summary && (
          <p className="mt-4 text-sm text-slate-300">
            Latest plan: total cost ₹
            {Number(rakePlan.solution.summary.total_cost || 0).toLocaleString('en-IN')} for
            {' '}
            {Number(rakePlan.solution.summary.total_tonnage || 0).toFixed(0)} T dispatched.
          </p>
        )}

        {multiPeriodPlan && multiPeriodPlan.summary && (
          <p className="mt-2 text-sm text-slate-300">
            Multi-period plan: {multiPeriodPlan.planning_horizon_days || 0}-day horizon starting
            {' '}
            {multiPeriodPlan.planning_start_date || 'N/A'} with total cost ₹
            {Number(multiPeriodPlan.summary.total_cost || 0).toLocaleString('en-IN')} for
            {' '}
            {Number(multiPeriodPlan.summary.total_tonnage || 0).toFixed(0)} T dispatched.
          </p>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {optimizationMetrics.map((metric, idx) => (
          <div key={idx} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <p className="text-slate-400 text-sm font-medium mb-2">{metric.title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-cyan-400">{metric.value}</span>
              {metric.unit && <span className="text-green-400 text-lg">{metric.unit}</span>}
            </div>
            <p className="text-xs text-slate-500 mt-2">{metric.change}</p>
          </div>
        ))}
      </div>

      {rakePlanSummary && (
        <div className="bg-slate-900 border border-cyan-500 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">AI explanation of today&apos;s rake plan</h3>
          <p className="text-sm text-slate-200 mb-3">
            The optimizer distributes{' '}
            {Math.round(rakePlanSummary.totalTonnage || 0).toLocaleString('en-IN')}
            T across{' '}
            {Math.round(rakePlanSummary.totalRakes || 0).toLocaleString('en-IN')}
            {' '}
            rakes and{' '}
            {Math.round(rakePlanSummary.totalTrucks || 0).toLocaleString('en-IN')}
            {' '}
            trucks for a total transport cost of ₹
            {Math.round(rakePlanSummary.totalCost || 0).toLocaleString('en-IN')}
            , which works out to roughly ₹
            {rakePlanSummary.costPerTonne > 0
              ? Math.round(rakePlanSummary.costPerTonne).toLocaleString('en-IN')
              : 0}
            {' '}
            per tonne.
          </p>
          <p className="text-xs text-slate-300 mb-3">
            Based on about{' '}
            {Math.round(
              rakePlanSummary.totalDemand || rakePlanSummary.totalTonnage || 0,
            ).toLocaleString('en-IN')}
            T of demand and{' '}
            {Math.round(rakePlanSummary.availableCapacity || 0).toLocaleString('en-IN')}
            T of available rake capacity, the model targets a capacity utilisation of around{' '}
            {rakePlanSummary.capacityUtil.toFixed(1)}
            % so you avoid dispatching underfilled rakes while still covering urgent orders.
            {rakePlanSummary.fastestLoadingPoint && rakePlanSummary.fastestTimeHours > 0 && (
              <>
                {' '}
                The minimum-loading-time model recommends loading roughly{' '}
                {Math.round(rakePlanSummary.referenceRakeTonnage || 0).toLocaleString('en-IN')}
                T per rake at {rakePlanSummary.fastestLoadingPoint}, which can be turned around in about{' '}
                {rakePlanSummary.fastestTimeHours.toFixed(1)}
                {' '}
                hours and keeps overall completion near{' '}
                {rakePlanSummary.estimatedDays.toFixed(1)}
                {' '}
                day(s).
              </>
            )}
          </p>
          <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-200">
            <li>
              Cost objective: minimise total cost while keeping cost per tonne close to target by pushing
              long-distance, heavy lanes to rail and reserving trucks only for spillover or small,
              time-sensitive lots.
            </li>
            <li>
              Utilisation objective: drive each rake towards high fill (capacity utilisation ≈{' '}
              {rakePlanSummary.capacityUtil.toFixed(1)}
              %) so you do not waste wagons or pay demurrage on underfilled rakes.
            </li>
            {rakePlanSummary.importedOrders > 0 && (
              <li>
                Service objective: cover{' '}
                {rakePlanSummary.importedOrders.toLocaleString('en-IN')}
                {' '}
                orders from the uploaded dataset over roughly{' '}
                {rakePlanSummary.estimatedDays.toFixed(1)}
                {' '}
                day(s) of operations, prioritising high-priority export and SLA-critical movements.
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 overflow-x-auto">
        {['formation', 'multi', 'comparison', 'prediction', 'costbenefit'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab === 'formation' && 'Daily Rake Plan'}
            {tab === 'multi' && 'Multi-Period Plan'}
            {tab === 'comparison' && 'Before vs. After Optimization'}
            {tab === 'prediction' && 'Predicted Rakes Required'}
            {tab === 'costbenefit' && 'Cost-Benefit Analysis'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'formation' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Recommended rake formations and assignments.</h3>
            <button
              onClick={handleExportPlan}
              disabled={!rakePlan}
              className={`flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors ${
                !rakePlan ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <Download size={18} />
              Export Plan
            </button>
          </div>
          <DataTable columns={columns} data={rakeFormationData} />
        </div>
      )}

      {activeTab === 'multi' && (
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Multi-Period Optimization Summary</h3>
            {multiPeriodPlan && multiPeriodPlan.summary ? (
              <>
                <p className="text-sm text-slate-300 mb-4">
                  {multiPeriodPlan.planning_horizon_days || 0}-day horizon starting{' '}
                  {multiPeriodPlan.planning_start_date || 'N/A'}.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-slate-200">
                  <div>
                    <p className="text-slate-400">Total Cost</p>
                    <p className="text-lg font-semibold">
                      ₹
                      {Number(multiPeriodPlan.summary.total_cost || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Total Tonnage</p>
                    <p className="text-lg font-semibold">
                      {Number(multiPeriodPlan.summary.total_tonnage || 0).toFixed(0)}T
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Total Rakes</p>
                    <p className="text-lg font-semibold">
                      {Number(multiPeriodPlan.summary.total_rakes || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Total Trucks</p>
                    <p className="text-lg font-semibold">
                      {Number(multiPeriodPlan.summary.total_trucks || 0)}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">
                No multi-period plan available yet. Run the multi-period optimizer above to generate one.
              </p>
            )}
          </div>

          {multiPeriodPlan && Array.isArray(multiPeriodPlan.daily_plans) &&
            multiPeriodPlan.daily_plans.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Per-Day Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-700">
                        <th className="px-3 py-2">Day</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Has Plan</th>
                        <th className="px-3 py-2">Cost</th>
                        <th className="px-3 py-2">Tonnage</th>
                        <th className="px-3 py-2">Rakes</th>
                        <th className="px-3 py-2">Trucks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {multiPeriodPlan.daily_plans.map((day) => {
                        const daySummary = day?.rake_plan?.solution?.summary || {}
                        return (
                          <tr
                            key={day.day_index}
                            className="border-b border-slate-800 text-slate-200"
                          >
                            <td className="px-3 py-2">{(day.day_index ?? 0) + 1}</td>
                            <td className="px-3 py-2">{day.date || 'N/A'}</td>
                            <td className="px-3 py-2">{day.has_plan ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-2">
                              {day.has_plan
                                ? `₹${Number(daySummary.total_cost || 0).toLocaleString('en-IN')}`
                                : '—'}
                            </td>
                            <td className="px-3 py-2">
                              {day.has_plan
                                ? `${Number(daySummary.total_tonnage || 0).toFixed(0)}T`
                                : '—'}
                            </td>
                            <td className="px-3 py-2">
                              {day.has_plan ? Number(daySummary.total_rakes || 0) : '—'}
                            </td>
                            <td className="px-3 py-2">
                              {day.has_plan ? Number(daySummary.total_trucks || 0) : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <ChartCard title="Before vs. After Optimization" subtitle="Comparison of key performance indicators.">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={beforeAfterData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="metric" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="before" fill="#475569" name="Before Optimization" />
                <Bar dataKey="after" fill="#06b6d4" name="After Optimization" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {history && history.length > 1 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Scenario Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Baseline Plan</label>
                  <select
                    value={baselinePlanId}
                    onChange={async (e) => {
                      const value = e.target.value
                      setBaselinePlanId(value)
                      if (!value) {
                        setBaselineSummary(null)
                        return
                      }
                      try {
                        const res = await getRakePlanById(value)
                        const summary = res?.rake_plan?.solution?.summary
                        setBaselineSummary(summary || null)
                      } catch (err) {
                        console.error('Failed to load baseline plan', err)
                      }
                    }}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select baseline plan</option>
                    {history
                      .slice()
                      .reverse()
                      .map((h) => (
                        <option key={h.plan_id} value={h.plan_id}>
                          {h.plan_id} — ₹{Number(h.total_cost || 0).toLocaleString('en-IN')} for{' '}
                          {Number(h.total_tonnage || 0).toFixed(0)}T
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Comparison Plan</label>
                  <select
                    value={comparisonPlanId}
                    onChange={async (e) => {
                      const value = e.target.value
                      setComparisonPlanId(value)
                      if (!value) {
                        setComparisonSummary(null)
                        return
                      }
                      try {
                        const res = await getRakePlanById(value)
                        const summary = res?.rake_plan?.solution?.summary
                        setComparisonSummary(summary || null)
                      } catch (err) {
                        console.error('Failed to load comparison plan', err)
                      }
                    }}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select comparison plan</option>
                    {history
                      .slice()
                      .reverse()
                      .map((h) => (
                        <option key={h.plan_id} value={h.plan_id}>
                          {h.plan_id} — ₹{Number(h.total_cost || 0).toLocaleString('en-IN')} for{' '}
                          {Number(h.total_tonnage || 0).toFixed(0)}T
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {baselineSummary && comparisonSummary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-200 text-sm">
                  <div>
                    <p className="font-semibold mb-1">Baseline</p>
                    <p>
                      Cost: ₹
                      {Number(baselineSummary.total_cost || 0).toLocaleString('en-IN')}
                    </p>
                    <p>
                      Tonnage: {Number(baselineSummary.total_tonnage || 0).toFixed(0)}T
                    </p>
                    <p>
                      Cost/T: ₹
                      {Math.round(
                        Number(baselineSummary.total_cost || 0) /
                          Math.max(Number(baselineSummary.total_tonnage || 0) || 1, 1),
                      ).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold mb-1">Comparison</p>
                    <p>
                      Cost: ₹
                      {Number(comparisonSummary.total_cost || 0).toLocaleString('en-IN')}
                    </p>
                    <p>
                      Tonnage: {Number(comparisonSummary.total_tonnage || 0).toFixed(0)}T
                    </p>
                    <p>
                      Cost/T: ₹
                      {Math.round(
                        Number(comparisonSummary.total_cost || 0) /
                          Math.max(Number(comparisonSummary.total_tonnage || 0) || 1, 1),
                      ).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold mb-1">Delta (Comparison - Baseline)</p>
                    <p>
                      Δ Cost: ₹
                      {(
                        Number(comparisonSummary.total_cost || 0) -
                        Number(baselineSummary.total_cost || 0)
                      ).toLocaleString('en-IN')}
                    </p>
                    <p>
                      Δ Tonnage: {(
                        Number(comparisonSummary.total_tonnage || 0) -
                        Number(baselineSummary.total_tonnage || 0)
                      ).toFixed(0)}
                      T
                    </p>
                    <p>
                      Δ Cost/T: ₹
                      {(
                        Number(comparisonSummary.total_cost || 0) /
                          Math.max(Number(comparisonSummary.total_tonnage || 0) || 1, 1) -
                        Number(baselineSummary.total_cost || 0) /
                          Math.max(Number(baselineSummary.total_tonnage || 0) || 1, 1)
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'prediction' && (
        <ChartCard
          title="Predicted Rakes Required"
          subtitle="Forecasted rake demand by destination for the selected period."
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={predictedRakesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="destination" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="rakes" fill="#06b6d4" name="Rakes Required" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {activeTab === 'costbenefit' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="Cost vs Revenue by Rake" subtitle="Financial analysis of each rake formation.">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costBenefitData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="rakeId" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="cost" fill="#ef4444" name="Cost (₹)" />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Destination Efficiency" subtitle="Average cost and utilization by destination.">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={destinationAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="destination" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="avgUtilization" fill="#06b6d4" name="Avg Utilization (%)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4"> Rake Profitability Summary</h3>
            <div className="space-y-3">
              {costBenefitData.map((rake, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
                >
                  <div>
                    <p className="font-semibold text-white">{rake.rakeId}</p>
                    <p className="text-sm text-slate-400">
                      Utilization: {rake.utilization}%  Efficiency: {rake.efficiency}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">₹{(rake.profit / 100000).toFixed(1)}L Profit</p>
                    <p className="text-sm text-slate-400">Cost: ₹{(rake.cost / 100000).toFixed(1)}L</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <InlineDecisionSummary
        context="rake"
        pageTitle="Daily Rake Plan & Dispatch"
        activeView={activeTabLabel}
      />
    </div>
  )
}

export default RakePlanner
