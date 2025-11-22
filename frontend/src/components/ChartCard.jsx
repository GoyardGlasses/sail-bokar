import React from 'react'
import { Download } from 'lucide-react'

const ChartCard = ({ title, subtitle = '', children, onDownload = null }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all duration-200">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
        {onDownload && (
          <button
            onClick={onDownload}
            className="text-slate-400 hover:text-cyan-400 transition-colors p-2 hover:bg-slate-700 rounded-lg"
            title="Download chart"
          >
            <Download size={18} />
          </button>
        )}
      </div>
      <div className="w-full overflow-x-auto">{children}</div>
    </div>
  )
}

export default ChartCard
