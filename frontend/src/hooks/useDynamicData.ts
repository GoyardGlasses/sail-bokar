/**
 * Custom hook for managing dynamic data with localStorage persistence
 */

import { useState, useEffect } from 'react'

export function useDynamicData<T>(key: string, initialData: T[]) {
  const [data, setData] = useState<T[]>(initialData)
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`dynamic_${key}`)
      if (stored) {
        setData(JSON.parse(stored))
      }
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error)
    } finally {
      setIsLoading(false)
    }
  }, [key])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(`dynamic_${key}`, JSON.stringify(data))
      } catch (error) {
        console.error(`Failed to save ${key} to localStorage:`, error)
      }
    }
  }, [data, key, isLoading])

  const addItem = (item: T) => {
    setData([...data, item])
  }

  const updateItem = (index: number, item: T) => {
    const newData = [...data]
    newData[index] = item
    setData(newData)
  }

  const deleteItem = (index: number) => {
    setData(data.filter((_, i) => i !== index))
  }

  const resetData = () => {
    setData(initialData)
    localStorage.removeItem(`dynamic_${key}`)
  }

  return {
    data,
    setData,
    addItem,
    updateItem,
    deleteItem,
    resetData,
    isLoading,
  }
}
