import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import clsx from 'clsx'

const MetricCard = ({ title, value, unit = '', change = null, icon: Icon = null, trend = 'up' }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-cyan-400">{value}</span>
            {unit && <span className="text-slate-400 text-sm">{unit}</span>}
          </div>
        </div>
        {Icon && (
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
            <Icon size={24} className="text-cyan-400" />
          </div>
        )}
      </div>

      {change !== null && (
        <div className="flex items-center gap-2">
          {trend === 'up' ? (
            <TrendingUp size={16} className="text-green-400" />
          ) : (
            <TrendingDown size={16} className="text-red-400" />
          )}
          <span
            className={clsx(
              'text-sm font-medium',
              trend === 'up' ? 'text-green-400' : 'text-red-400'
            )}
          >
            {change}% {trend === 'up' ? 'increase' : 'decrease'}
          </span>
        </div>
      )}
    </div>
  )
}

export default MetricCard
