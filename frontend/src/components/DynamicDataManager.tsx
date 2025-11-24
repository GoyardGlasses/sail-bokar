/**
 * Dynamic Data Manager Component
 * Allows judges to add, edit, and delete data items
 */

import React, { useState } from 'react'
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react'

interface DynamicDataManagerProps {
  title: string
  items: any[]
  onAdd: (item: any) => void
  onDelete: (index: number) => void
  onUpdate: (index: number, item: any) => void
  onReset: () => void
  fields: {
    name: string
    label: string
    type: 'text' | 'number' | 'select'
    options?: string[]
  }[]
  renderItem: (item: any) => React.ReactNode
}

export function DynamicDataManager({
  title,
  items,
  onAdd,
  onDelete,
  onUpdate,
  onReset,
  fields,
  renderItem,
}: DynamicDataManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<any>({})

  const handleAddClick = () => {
    setFormData({})
    setEditingIndex(null)
    setShowForm(true)
  }

  const handleEditClick = (index: number) => {
    setFormData({ ...items[index] })
    setEditingIndex(index)
    setShowForm(true)
  }

  const handleSubmit = () => {
    if (editingIndex !== null) {
      onUpdate(editingIndex, formData)
    } else {
      onAdd(formData)
    }
    setShowForm(false)
    setFormData({})
    setEditingIndex(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setFormData({})
    setEditingIndex(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            <Plus size={16} />
            Add
          </button>
          <button
            onClick={onReset}
            className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition text-sm"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card border-2 border-blue-500 p-4">
          <div className="space-y-3">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [field.name]:
                          field.type === 'number' ? parseFloat(e.target.value) : e.target.value,
                      })
                    }
                    placeholder={field.label}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                )}
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Check size={16} />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-slate-50 rounded-lg hover:bg-slate-400 dark:hover:bg-slate-700 transition"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400 text-center py-4">No items yet</p>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              className="card flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              <div className="flex-1">{renderItem(item)}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(index)}
                  className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(index)}
                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
