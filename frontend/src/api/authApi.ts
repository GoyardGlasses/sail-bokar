import axios from 'axios'

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'analyst' | 'viewer'
  permissions: string[]
  avatar?: string
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

// Mock users for testing
const mockUsers: Record<string, { password: string; user: User }> = {
  'admin@example.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      permissions: ['*'],
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      createdAt: '2025-01-01',
    },
  },
  'manager@example.com': {
    password: 'manager123',
    user: {
      id: '2',
      email: 'manager@example.com',
      name: 'Manager User',
      role: 'manager',
      permissions: ['read:all', 'write:forecast', 'write:delay'],
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager',
      createdAt: '2025-01-02',
    },
  },
  'analyst@example.com': {
    password: 'analyst123',
    user: {
      id: '3',
      email: 'analyst@example.com',
      name: 'Analyst User',
      role: 'analyst',
      permissions: ['read:all', 'write:forecast'],
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Analyst',
      createdAt: '2025-01-03',
    },
  },
}

export const login = async (request: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, request)
    return response.data
  } catch (error) {
    console.warn('Login API error, using mock data:', error)
    const mockUser = mockUsers[request.email]
    if (mockUser && mockUser.password === request.password) {
      return {
        token: `mock_token_${Date.now()}`,
        user: mockUser.user,
      }
    }
    throw new Error('Invalid credentials')
  }
}

export const register = async (request: RegisterRequest): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, request)
    return response.data
  } catch (error) {
    console.warn('Register API error, using mock data:', error)
    const newUser: User = {
      id: `user_${Date.now()}`,
      email: request.email,
      name: request.name,
      role: 'analyst',
      permissions: ['read:all'],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.name}`,
      createdAt: new Date().toISOString(),
    }
    return {
      token: `mock_token_${Date.now()}`,
      user: newUser,
    }
  }
}

export const logout = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export const getToken = (): string | null => {
  return localStorage.getItem('token')
}

export const setAuthData = (token: string, user: User): void => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export const hasPermission = (permission: string): boolean => {
  const user = getCurrentUser()
  if (!user) return false
  if (user.permissions.includes('*')) return true
  return user.permissions.includes(permission)
}

export const hasRole = (role: string): boolean => {
  const user = getCurrentUser()
  return user?.role === role
}
