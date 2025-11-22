import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function KPICard({ title, value, unit, trend, icon: Icon, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600 border-primary-200',
    success: 'bg-success-50 text-success-600 border-success-200',
    warning: 'bg-warning-50 text-warning-600 border-warning-200',
    danger: 'bg-danger-50 text-danger-600 border-danger-200',
  }

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]} bg-white shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {value}
            <span className="text-lg text-gray-500 ml-2">{unit}</span>
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend > 0 ? (
                <>
                  <TrendingUp size={16} className="text-green-500" />
                  <span className="text-sm text-green-600">+{trend}%</span>
                </>
              ) : (
                <>
                  <TrendingDown size={16} className="text-red-500" />
                  <span className="text-sm text-red-600">{trend}%</span>
                </>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  )
}
