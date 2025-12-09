/**
 * Daily Plan Execution System
 * Handles automatic plan generation, approval, and execution
 */

export interface ExecutionSchedule {
  planGenerationTime: string // e.g., "02:00" (2 AM)
  planApprovalDeadline: string // e.g., "05:00" (5 AM)
  dispatchStartTime: string // e.g., "06:00" (6 AM)
  dispatchEndTime: string // e.g., "22:00" (10 PM)
  timezone: string // e.g., "Asia/Kolkata"
}

export interface ExecutionPlan {
  planId: string
  planDate: string
  status: 'draft' | 'pending_approval' | 'approved' | 'executing' | 'completed' | 'failed'
  rakes: any[]
  totalCost: number
  totalLoad: number
  totalUtilization: number
  createdAt: string
  approvedAt?: string
  approvedBy?: string
  executedAt?: string
  completedAt?: string
  failureReason?: string
}

export interface ExecutionTask {
  taskId: string
  planId: string
  rakeId: string
  taskType: 'load' | 'dispatch' | 'track' | 'deliver'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  scheduledTime: string
  actualStartTime?: string
  actualEndTime?: string
  result?: any
  errorMessage?: string
}

export interface ExecutionMetrics {
  totalPlansGenerated: number
  totalPlansApproved: number
  totalPlansExecuted: number
  successRate: number
  averageExecutionTime: number
  averageCost: number
  averageUtilization: number
  lastExecutionTime?: string
}

/**
 * Get next execution schedule
 */
export function getNextExecutionSchedule(
  schedule: ExecutionSchedule
): ExecutionSchedule & { nextGenerationTime: Date } {
  const now = new Date()
  const [genHour, genMin] = schedule.planGenerationTime.split(':').map(Number)

  // Create next generation time
  let nextGen = new Date(now)
  nextGen.setHours(genHour, genMin, 0, 0)

  // If time has passed today, schedule for tomorrow
  if (nextGen <= now) {
    nextGen.setDate(nextGen.getDate() + 1)
  }

  return {
    ...schedule,
    nextGenerationTime: nextGen,
  }
}

/**
 * Check if it's time to generate plan
 */
export function isTimeToGeneratePlan(schedule: ExecutionSchedule): boolean {
  const now = new Date()
  const [hour, min] = schedule.planGenerationTime.split(':').map(Number)

  return now.getHours() === hour && now.getMinutes() === min
}

/**
 * Check if it's time to execute plan
 */
export function isTimeToExecutePlan(schedule: ExecutionSchedule): boolean {
  const now = new Date()
  const [startHour, startMin] = schedule.dispatchStartTime.split(':').map(Number)
  const [endHour, endMin] = schedule.dispatchEndTime.split(':').map(Number)

  const startTime = new Date()
  startTime.setHours(startHour, startMin, 0, 0)

  const endTime = new Date()
  endTime.setHours(endHour, endMin, 0, 0)

  return now >= startTime && now <= endTime
}

/**
 * Generate daily plan
 */
export async function generateDailyPlan(
  orders: any[],
  stockyards: any[],
  loadingPoints: any[],
  routes: any[],
  constraints: any,
  objectives: any
): Promise<ExecutionPlan> {
  try {
    // Call decision support API
    const response = await fetch('/api/decision-support/generate-decision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orders,
        stockyards,
        loadingPoints,
        routes,
        constraints,
        objectives,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const decision = await response.json()

    const plan: ExecutionPlan = {
      planId: decision.planId,
      planDate: new Date().toISOString().split('T')[0],
      status: 'draft',
      rakes: decision.rakes,
      totalCost: decision.totalCost,
      totalLoad: decision.totalLoad,
      totalUtilization: decision.totalUtilization,
      createdAt: new Date().toISOString(),
    }

    return plan
  } catch (error) {
    throw new Error(`Failed to generate daily plan: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Submit plan for approval
 */
export function submitPlanForApproval(plan: ExecutionPlan): ExecutionPlan {
  return {
    ...plan,
    status: 'pending_approval',
  }
}

/**
 * Approve plan
 */
export function approvePlan(plan: ExecutionPlan, approvedBy: string): ExecutionPlan {
  return {
    ...plan,
    status: 'approved',
    approvedAt: new Date().toISOString(),
    approvedBy,
  }
}

/**
 * Reject plan
 */
export function rejectPlan(plan: ExecutionPlan, reason: string): ExecutionPlan {
  return {
    ...plan,
    status: 'draft',
    failureReason: reason,
  }
}

/**
 * Start plan execution
 */
export function startPlanExecution(plan: ExecutionPlan): ExecutionPlan {
  return {
    ...plan,
    status: 'executing',
    executedAt: new Date().toISOString(),
  }
}

/**
 * Complete plan execution
 */
export function completePlanExecution(plan: ExecutionPlan): ExecutionPlan {
  return {
    ...plan,
    status: 'completed',
    completedAt: new Date().toISOString(),
  }
}

/**
 * Mark plan as failed
 */
export function failPlanExecution(plan: ExecutionPlan, reason: string): ExecutionPlan {
  return {
    ...plan,
    status: 'failed',
    failureReason: reason,
  }
}

/**
 * Create execution tasks from plan
 */
export function createExecutionTasks(plan: ExecutionPlan): ExecutionTask[] {
  const tasks: ExecutionTask[] = []
  const [hour, min] = '06:00'.split(':').map(Number) // Start at 6 AM

  for (let i = 0; i < plan.rakes.length; i++) {
    const rake = plan.rakes[i]

    // Loading task
    const loadTime = new Date()
    loadTime.setHours(hour + Math.floor(i / 2), (i % 2) * 30, 0, 0)

    tasks.push({
      taskId: `TASK-${plan.planId}-LOAD-${i}`,
      planId: plan.planId,
      rakeId: rake.rakeId,
      taskType: 'load',
      status: 'pending',
      scheduledTime: loadTime.toISOString(),
    })

    // Dispatch task (30 minutes after loading)
    const dispatchTime = new Date(loadTime)
    dispatchTime.setMinutes(dispatchTime.getMinutes() + 30)

    tasks.push({
      taskId: `TASK-${plan.planId}-DISPATCH-${i}`,
      planId: plan.planId,
      rakeId: rake.rakeId,
      taskType: 'dispatch',
      status: 'pending',
      scheduledTime: dispatchTime.toISOString(),
    })

    // Track task (1 hour after dispatch)
    const trackTime = new Date(dispatchTime)
    trackTime.setHours(trackTime.getHours() + 1)

    tasks.push({
      taskId: `TASK-${plan.planId}-TRACK-${i}`,
      planId: plan.planId,
      rakeId: rake.rakeId,
      taskType: 'track',
      status: 'pending',
      scheduledTime: trackTime.toISOString(),
    })
  }

  return tasks
}

/**
 * Execute task
 */
export async function executeTask(task: ExecutionTask): Promise<ExecutionTask> {
  try {
    const updatedTask: ExecutionTask = {
      ...task,
      status: 'in_progress',
      actualStartTime: new Date().toISOString(),
    }

    // Simulate task execution
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      ...updatedTask,
      status: 'completed',
      actualEndTime: new Date().toISOString(),
      result: {
        success: true,
        message: `${task.taskType} completed successfully for rake ${task.rakeId}`,
      },
    }
  } catch (error) {
    return {
      ...task,
      status: 'failed',
      actualStartTime: new Date().toISOString(),
      actualEndTime: new Date().toISOString(),
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get execution metrics
 */
export function getExecutionMetrics(plans: ExecutionPlan[]): ExecutionMetrics {
  const approvedPlans = plans.filter((p) => p.status === 'approved' || p.status === 'executing' || p.status === 'completed')
  const executedPlans = plans.filter((p) => p.status === 'executing' || p.status === 'completed')
  const completedPlans = plans.filter((p) => p.status === 'completed')

  const successRate = executedPlans.length > 0 ? (completedPlans.length / executedPlans.length) * 100 : 0

  const executionTimes = completedPlans
    .map((p) => {
      if (p.executedAt && p.completedAt) {
        return new Date(p.completedAt).getTime() - new Date(p.executedAt).getTime()
      }
      return 0
    })
    .filter((t) => t > 0)

  const averageExecutionTime =
    executionTimes.length > 0
      ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length / 1000 / 60
      : 0 // in minutes

  const averageCost =
    completedPlans.length > 0
      ? completedPlans.reduce((sum, p) => sum + p.totalCost, 0) / completedPlans.length
      : 0

  const averageUtilization =
    completedPlans.length > 0
      ? completedPlans.reduce((sum, p) => sum + p.totalUtilization, 0) / completedPlans.length
      : 0

  return {
    totalPlansGenerated: plans.length,
    totalPlansApproved: approvedPlans.length,
    totalPlansExecuted: executedPlans.length,
    successRate,
    averageExecutionTime,
    averageCost,
    averageUtilization,
    lastExecutionTime: completedPlans[0]?.completedAt,
  }
}

/**
 * Get plan status summary
 */
export function getPlanStatusSummary(plans: ExecutionPlan[]): Record<string, number> {
  const summary: Record<string, number> = {
    draft: 0,
    pending_approval: 0,
    approved: 0,
    executing: 0,
    completed: 0,
    failed: 0,
  }

  for (const plan of plans) {
    summary[plan.status]++
  }

  return summary
}

/**
 * Get execution timeline
 */
export function getExecutionTimeline(
  plan: ExecutionPlan,
  schedule: ExecutionSchedule
): { event: string; time: string; status: string }[] {
  const timeline: { event: string; time: string; status: string }[] = []

  const planDate = new Date(plan.planDate)

  // Plan generation
  const genTime = new Date(planDate)
  const [genHour, genMin] = schedule.planGenerationTime.split(':').map(Number)
  genTime.setHours(genHour, genMin, 0, 0)
  timeline.push({
    event: 'Plan Generation',
    time: genTime.toLocaleTimeString(),
    status: plan.status !== 'draft' ? 'completed' : 'pending',
  })

  // Plan approval
  const approvalTime = new Date(planDate)
  const [approvalHour, approvalMin] = schedule.planApprovalDeadline.split(':').map(Number)
  approvalTime.setHours(approvalHour, approvalMin, 0, 0)
  timeline.push({
    event: 'Plan Approval Deadline',
    time: approvalTime.toLocaleTimeString(),
    status: plan.status !== 'draft' && plan.status !== 'pending_approval' ? 'completed' : 'pending',
  })

  // Dispatch start
  const dispatchStartTime = new Date(planDate)
  const [dispatchHour, dispatchMin] = schedule.dispatchStartTime.split(':').map(Number)
  dispatchStartTime.setHours(dispatchHour, dispatchMin, 0, 0)
  timeline.push({
    event: 'Dispatch Start',
    time: dispatchStartTime.toLocaleTimeString(),
    status: plan.status === 'executing' || plan.status === 'completed' ? 'in_progress' : 'pending',
  })

  // Dispatch end
  const dispatchEndTime = new Date(planDate)
  const [endHour, endMin] = schedule.dispatchEndTime.split(':').map(Number)
  dispatchEndTime.setHours(endHour, endMin, 0, 0)
  timeline.push({
    event: 'Dispatch End',
    time: dispatchEndTime.toLocaleTimeString(),
    status: plan.status === 'completed' ? 'completed' : 'pending',
  })

  return timeline
}
