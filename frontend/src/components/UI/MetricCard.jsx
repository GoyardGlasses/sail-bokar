import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

/**
 * MetricCard - KPI display component
 * @param {string} title - Card title
 * @param {number|string} value - Main metric value
 * @param {string} unit - Unit of measurement
 * @param {number} trend - Trend percentage (positive/negative)
 * @param {React.Component} icon - Icon component
 * @param {string} color - Color variant (primary, success, warning, danger)
 */
export default function MetricCard({ title, value, unit, trend, icon: Icon, color = 'primary' }) {
  const colorClasses = {
    primary: 'border-blue-200 bg-blue-50',
    success: 'border-green-200 bg-green-50',
    warning: 'border-amber-200 bg-amber-50',
    danger: 'border-red-200 bg-red-50',
  }

  const iconColorClasses = {
    primary: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
  }

  return (
    <div className={`card ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {value}
            {unit && <span className="text-lg text-slate-500 ml-2">{unit}</span>}
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend > 0 ? (
                <>
                  <TrendingUp size={16} className="text-green-600" />
                  <span className="text-sm text-green-600 font-medium">+{trend}%</span>
                </>
              ) : trend < 0 ? (
                <>
                  <TrendingDown size={16} className="text-red-600" />
                  <span className="text-sm text-red-600 font-medium">{trend}%</span>
                </>
              ) : null}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${iconColorClasses[color]}`}>
            <Icon size={28} />
          </div>
        )}
      </div>
    </div>
  )
}
