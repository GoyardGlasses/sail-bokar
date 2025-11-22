import React from 'react'

/**
 * Spinner - Loading indicator component
 * @param {string} size - Size variant (sm, md, lg)
 * @param {string} text - Optional loading text
 */
export default function Spinner({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-slate-200 border-t-blue-600`}></div>
      {text && <p className="text-sm text-slate-600">{text}</p>}
    </div>
  )
}
