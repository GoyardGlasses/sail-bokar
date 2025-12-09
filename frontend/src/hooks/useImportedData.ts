/**
 * Hook to access imported data across all features
 * Automatically uses imported data if available, falls back to mock data
 */

import { useEffect, useState } from 'react'

export function useImportedData() {
  const [data, setData] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const imported = localStorage.getItem('imported_data')
      if (imported) {
        setData(JSON.parse(imported))
      }
      setIsLoaded(true)
    } catch (error) {
      console.error('Error loading imported data:', error)
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    const handler = (event: any) => {
      if (event && event.detail) {
        setData(event.detail)
        setIsLoaded(true)
      }
    }

    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('imported-data-updated', handler as EventListener)

      return () => {
        window.removeEventListener('imported-data-updated', handler as EventListener)
      }
    }
  }, [])

  return { data, isLoaded }
}
