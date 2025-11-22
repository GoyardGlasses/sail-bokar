/**
 * Formatting utilities
 */

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(value)
}

export const formatNumber = (value) => {
  return new Intl.NumberFormat('en-IN').format(value)
}

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export const formatTime = (seconds) => {
  if (seconds < 60) return `${Math.round(seconds)}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  return `${Math.round(seconds / 3600)}h`
}

export const formatTonnes = (value) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return `${value}`
}

export const getPriorityColor = (priority) => {
  const colors = {
    HIGH: 'bg-red-100 text-red-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    LOW: 'bg-green-100 text-green-700',
  }
  return colors[priority] || 'bg-gray-100 text-gray-700'
}

export const getStatusColor = (status) => {
  const colors = {
    OPTIMAL: 'bg-green-100 text-green-700',
    FEASIBLE: 'bg-blue-100 text-blue-700',
    INFEASIBLE: 'bg-red-100 text-red-700',
    MODEL_INVALID: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}
