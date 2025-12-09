/**
 * Live Optimizer Progress Dashboard - Phase 1 Feature 5
 */

import React, { useState, useEffect } from 'react'
import { Play, CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react'
import { useMLPredictions } from '../context/MLPredictionsContext'
import { useImportedData } from '../hooks/useImportedData'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'
import InlineDecisionSummary from '../features/decisionSupport/components/InlineDecisionSummary'

export default function LiveProgressPage() {
  const { dataImported, getPrediction } = useMLPredictions()
  const [mlPredictions, setMlPredictions] = useState({})
  const [status, setStatus] = useState(null)
  const [activeTasks, setActiveTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)

  const { data: importedData } = useImportedData()

  // Get ML predictions when data is imported
  useEffect(() => {
    if (dataImported) {
      const predictions = {
        delay: getPrediction('delay_prediction'),
        fuel: getPrediction('fuel_consumption'),
      }
      setMlPredictions(predictions)
    }
  }, [dataImported, getPrediction])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    // Mock data
    const mockActiveTasks = [
      { task_id: 'TASK-001', plan_id: 'PLAN-001', orders_count: 5, status: 'running', overall_progress: 65, current_stage: 'optimization', start_time: new Date().toISOString(), updates: [{ stage: 'initialization', progress: 10, message: 'Initializing...' }] },
    ]

    const mockCompletedTasks = [
      { task_id: 'TASK-002', plan_id: 'PLAN-002', orders_count: 6, status: 'completed', overall_progress: 100, current_stage: 'completion', duration_seconds: 28, start_time: new Date().toISOString(), end_time: new Date().toISOString(), updates: [] },
    ]

    const mockStats = {
      total_tasks: 2,
      completed_tasks: 1,
      failed_tasks: 0,
      active_tasks: 1,
      avg_duration_seconds: 28,
      success_rate: 1.0,
      timestamp: new Date().toISOString()
    }

    const mockStatus = { status: 'running', active_tasks: 1, completed_tasks: 1, total_tasks: 2, timestamp: new Date().toISOString() }

    try {
      const [statusRes, activeRes, completedRes, statsRes] = await Promise.all([
        fetch('/api/live-progress/status').catch(() => null),
        fetch('/api/live-progress/tasks').catch(() => null),
        fetch('/api/live-progress/tasks/completed').catch(() => null),
        fetch('/api/live-progress/statistics').catch(() => null),
      ])

      try {
        const statusData = statusRes ? await statusRes.json() : mockStatus
        const activeData = activeRes ? await activeRes.json() : { tasks: mockActiveTasks }
        const completedData = completedRes ? await completedRes.json() : { tasks: mockCompletedTasks }
        const statsData = statsRes ? await statsRes.json() : mockStats

        setStatus(statusData || mockStatus)
        setActiveTasks((prevTasks) => {
          const apiTasks = (activeData?.tasks) || mockActiveTasks
          if (!prevTasks || prevTasks.length === 0) return apiTasks
          const existingIds = new Set(apiTasks.map((t) => t.task_id))
          const extra = prevTasks.filter((t) => t && !existingIds.has(t.task_id))
          return [...apiTasks, ...extra]
        })
        setCompletedTasks((completedData?.tasks) || mockCompletedTasks)
        setStats(statsData || mockStats)
      } catch {
        setStatus(mockStatus)
        setActiveTasks((prevTasks) => {
          if (!prevTasks || prevTasks.length === 0) return mockActiveTasks
          const existingIds = new Set(mockActiveTasks.map((t) => t.task_id))
          const extra = prevTasks.filter((t) => t && !existingIds.has(t.task_id))
          return [...mockActiveTasks, ...extra]
        })
        setCompletedTasks(mockCompletedTasks)
        setStats(mockStats)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setStatus(mockStatus)
      setActiveTasks((prevTasks) => {
        if (!prevTasks || prevTasks.length === 0) return mockActiveTasks
        const existingIds = new Set(mockActiveTasks.map((t) => t.task_id))
        const extra = prevTasks.filter((t) => t && !existingIds.has(t.task_id))
        return [...mockActiveTasks, ...extra]
      })
      setCompletedTasks(mockCompletedTasks)
      setStats(mockStats)
      setLoading(false)
    }
  }

  const simulateTask = async () => {
    try {
      setSimulating(true)
      
      // Try API first, fallback to mock
      try {
        const res = await fetch(`/api/live-progress/tasks/TASK-${Date.now()}/simulate?plan_id=PLAN-${Date.now()}&orders_count=5`, {
          method: 'POST'
        })
        if (res.ok) {
          const data = await res.json()
          if (data.task_id) {
            alert(`✓ Simulation started!\nTask: ${data.task_id}`)
            await fetchData()
            return
          }
        }
      } catch (err) {
        // API failed, use mock
      }
      
      // Mock success
      const taskId = `TASK-${Date.now()}`
      const now = new Date().toISOString()

      const pickRandom = (arr) => {
        if (!arr || !Array.isArray(arr) || arr.length === 0) return null
        return arr[Math.floor(Math.random() * arr.length)]
      }

      const orders = importedData?.orders
      const routes = importedData?.routes
      const stockyards = importedData?.stockyards
      const rakes = importedData?.rakes

      const order = pickRandom(orders)
      const route = pickRandom(routes)
      const stockyard = pickRandom(stockyards)
      const rake = pickRandom(rakes)

      const planId = order?.id
        ? `PLAN-${String(order.id).toUpperCase()}`
        : route?.id
          ? `PLAN-${route.id}`
          : `PLAN-${Date.now()}`

      const ordersCount = order ? 1 : 5

      const descriptionParts = []
      if (order) {
        descriptionParts.push(
          `Order ${order.id} (${order.product} → ${order.destination})`
        )
      }
      if (stockyard) {
        descriptionParts.push(`from ${stockyard.name}`)
      }
      if (rake) {
        descriptionParts.push(`using rake ${rake.name}`)
      }
      if (route) {
        descriptionParts.push(`via route ${route.origin} → ${route.destination}`)
      }

      const description =
        descriptionParts.length > 0
          ? `Initializing optimization for ${descriptionParts.join(', ')}`
          : 'Initializing optimization task based on imported data'

      alert(`✓ Simulation started!\nTask: ${taskId}`)
      const newTask = {
        task_id: taskId,
        plan_id: planId,
        orders_count: ordersCount,
        status: 'running',
        overall_progress: 10,
        current_stage: 'initialization',
        start_time: now,
        updates: [
          {
            stage: 'initialization',
            progress: 10,
            message: description,
          },
        ],
      }
      setActiveTasks((prevTasks) => [...(prevTasks || []), newTask])
    } catch (error) {
      console.error('Error:', error)
      alert('Error starting simulation')
    } finally {
      setSimulating(false)
    }
  }

  // Map numeric progress to a logical optimizer stage
  const getStageForProgress = (progress) => {
    if (progress < 15) return 'initialization'
    if (progress < 35) return 'data_validation'
    if (progress < 55) return 'predictions'
    if (progress < 80) return 'optimization'
    if (progress < 95) return 'risk_assessment'
    if (progress < 100) return 'plan_generation'
    return 'completion'
  }

  // Local simulation loop: advance running tasks and complete them over time
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTasks((prevTasks) => {
        if (!prevTasks || prevTasks.length === 0) return prevTasks

        const now = new Date()
        const updatedTasks = []
        const completedNow = []

        prevTasks.forEach((task) => {
          if (!task || task.status !== 'running') {
            updatedTasks.push(task)
            return
          }

          const currentProgress =
            typeof task.overall_progress === 'number'
              ? task.overall_progress
              : 0

          // Already at or above 100%: make sure it's treated as completed
          if (currentProgress >= 100) {
            const duration_seconds =
              task.duration_seconds ||
              Math.max(
                5,
                Math.round(
                  (now.getTime() - new Date(task.start_time).getTime()) /
                    1000
                )
              )

            completedNow.push({
              ...task,
              status: 'completed',
              current_stage: 'completion',
              overall_progress: 100,
              duration_seconds,
              end_time: task.end_time || now.toISOString(),
            })
            return
          }

          // Advance progress by a small random step
          const increment = Math.max(1, Math.round(5 + Math.random() * 15))
          const nextProgress = Math.min(100, currentProgress + increment)
          const nextStage = getStageForProgress(nextProgress)

          let updates = task.updates || []
          if (nextStage !== task.current_stage) {
            updates = [
              ...updates,
              {
                stage: nextStage,
                progress: nextProgress,
                message: `Stage changed to ${nextStage.replace(/_/g, ' ')} (${nextProgress}%)`,
              },
            ]
          }

          if (nextProgress >= 100) {
            const duration_seconds = Math.max(
              5,
              Math.round(
                (now.getTime() - new Date(task.start_time).getTime()) / 1000
              )
            )

            completedNow.push({
              ...task,
              overall_progress: 100,
              status: 'completed',
              current_stage: 'completion',
              duration_seconds,
              end_time: now.toISOString(),
              updates,
            })
          } else {
            updatedTasks.push({
              ...task,
              overall_progress: nextProgress,
              current_stage: nextStage,
              updates,
            })
          }
        })

        if (completedNow.length > 0) {
          setCompletedTasks((prevCompleted) => [
            ...(prevCompleted || []),
            ...completedNow,
          ])
        }

        return updatedTasks
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStageColor = (stage) => {
    const stages = {
      'initialization': 'bg-blue-100 text-blue-700',
      'data_validation': 'bg-blue-100 text-blue-700',
      'predictions': 'bg-purple-100 text-purple-700',
      'optimization': 'bg-indigo-100 text-indigo-700',
      'risk_assessment': 'bg-orange-100 text-orange-700',
      'plan_generation': 'bg-green-100 text-green-700',
      'completion': 'bg-green-100 text-green-700',
    }
    return stages[stage] || 'bg-slate-100 text-slate-700'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-600" size={20} />
      case 'failed':
        return <AlertCircle className="text-red-600" size={20} />
      case 'running':
        return <Zap className="text-blue-600 animate-spin" size={20} />
      default:
        return <Clock className="text-slate-600" size={20} />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Zap className="mx-auto text-blue-600 mb-4 animate-spin" size={48} />
          <p className="text-slate-600 dark:text-slate-400">Loading progress...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Live Optimizer Progress
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Real-time tracking of optimization tasks
          </p>
        </div>
        <button
          onClick={simulateTask}
          disabled={simulating}
          className="btn btn-primary flex items-center gap-2"
        >
          <Play size={18} />
          {simulating ? 'Simulating...' : 'Simulate Task'}
        </button>
      </div>

      <InlineDataImport templateId="operations" />

      {/* Status Cards */}
      {status && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Active Tasks</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {status.active_tasks}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {stats.completed_tasks}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Success Rate</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              {(stats.success_rate * 100).toFixed(0)}%
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Avg Duration</p>
            <p className="text-2xl font-bold text-orange-600 mt-2">
              {stats.avg_duration_seconds}s
            </p>
          </div>
        </div>
      )}

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
            Active Tasks ({activeTasks.length})
          </h3>
          <div className="space-y-4">
            {activeTasks.map((task) => (
              <div
                key={task.task_id}
                className="border border-slate-200 dark:border-slate-700 rounded p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {task.task_id}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Plan: {task.plan_id} • Orders: {task.orders_count}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {task.overall_progress}%
                    </p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${getStageColor(task.current_stage)}`}>
                      {task.current_stage.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all"
                    style={{ width: `${task.overall_progress}%` }}
                  />
                </div>

                {/* Latest Update */}
                {task.updates && task.updates.length > 0 && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {task.updates[task.updates.length - 1].message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
            Completed Tasks ({completedTasks.length})
          </h3>
          <div className="space-y-3">
            {completedTasks.slice(-5).reverse().map((task) => (
              <div
                key={task.task_id}
                className="border border-slate-200 dark:border-slate-700 rounded p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {task.task_id}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {task.duration_seconds}s • {task.orders_count} orders
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                  Task Details: {selectedTask.task_id}
                </h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Status</p>
                    <p className="text-slate-900 dark:text-slate-50 mt-1">{selectedTask.status}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Progress</p>
                    <p className="text-slate-900 dark:text-slate-50 mt-1">{selectedTask.overall_progress}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Duration</p>
                    <p className="text-slate-900 dark:text-slate-50 mt-1">{selectedTask.duration_seconds}s</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Orders</p>
                    <p className="text-slate-900 dark:text-slate-50 mt-1">{selectedTask.orders_count}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Updates</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedTask.updates && selectedTask.updates.map((update, idx) => (
                      <div key={idx} className="border-l-2 border-blue-600 pl-3 py-1">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">
                          {update.stage.replace(/_/g, ' ')} - {update.progress}%
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {update.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <InlineDecisionSummary
        context="operations"
        pageTitle="Live Optimizer Progress"
      />
    </div>
  )
}
