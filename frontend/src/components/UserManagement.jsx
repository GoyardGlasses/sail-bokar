import React, { useState, useEffect } from 'react'
import { Users, Plus, Edit2, Trash2, Shield, Mail } from 'lucide-react'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ email: '', name: '', role: 'analyst' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // Mock data
      setUsers([
        { id: 1, email: 'admin@sail.com', name: 'Admin User', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' },
        { id: 2, email: 'analyst@sail.com', name: 'Analyst User', role: 'analyst', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=analyst' },
        { id: 3, email: 'viewer@sail.com', name: 'Viewer User', role: 'viewer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viewer' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (!formData.email || !formData.name) {
      alert('Please fill all fields')
      return
    }
    setUsers([...users, { id: users.length + 1, ...formData, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}` }])
    setFormData({ email: '', name: '', role: 'analyst' })
    setShowForm(false)
  }

  const handleDeleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id))
  }

  const roleColors = {
    admin: 'bg-red-100 text-red-800',
    analyst: 'bg-blue-100 text-blue-800',
    viewer: 'bg-gray-100 text-gray-800',
    manager: 'bg-green-100 text-green-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">User Management</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      {showForm && (
        <div className="card bg-blue-50 dark:bg-slate-700">
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-600 dark:text-slate-50"
            />
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-600 dark:text-slate-50"
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-600 dark:text-slate-50"
            >
              <option value="admin">Admin</option>
              <option value="analyst">Analyst</option>
              <option value="viewer">Viewer</option>
              <option value="manager">Manager</option>
            </select>
            <div className="flex gap-2">
              <button onClick={handleAddUser} className="flex-1 btn btn-primary">Add User</button>
              <button onClick={() => setShowForm(false)} className="flex-1 btn btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <div key={user.id} className="card">
            <div className="flex items-start gap-4">
              <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-slate-50">{user.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                <div className="mt-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${roleColors[user.role]}`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded">
                  <Edit2 size={16} className="text-blue-600" />
                </button>
                <button onClick={() => handleDeleteUser(user.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded">
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
