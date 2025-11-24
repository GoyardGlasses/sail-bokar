import React, { useState, useEffect } from 'react'
import { Bell, X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showPanel, setShowPanel] = useState(false)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    // Mock notifications
    const mockNotifications = [
      {
        id: 1,
        title: 'Forecast Complete',
        message: 'Your demand forecast has been generated successfully',
        type: 'success',
        is_read: false,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Optimization Ready',
        message: 'Optimization results are ready for review',
        type: 'info',
        is_read: false,
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 3,
        title: 'Warning: High Delay Risk',
        message: 'Route Bokaro->Kolkata has high delay risk',
        type: 'warning',
        is_read: false,
        created_at: new Date(Date.now() - 7200000).toISOString()
      }
    ]
    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.is_read).length)
  }

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(Math.max(0, unreadCount - 1))
  }

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-600" size={20} />
      case 'warning':
        return <AlertTriangle className="text-yellow-600" size={20} />
      case 'error':
        return <AlertCircle className="text-red-600" size={20} />
      default:
        return <Info className="text-blue-600" size={20} />
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
      >
        <Bell size={24} className="text-slate-700 dark:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-slate-700 p-4 border-b border-gray-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-50">Notifications</h3>
              <button onClick={() => setShowPanel(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-slate-600">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-slate-400">
                No notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-600 transition cursor-pointer ${
                    !notif.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex gap-3">
                    {getIcon(notif.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-50">{notif.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notif.id)
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
