import React, { createContext, useContext, useState, useEffect } from 'react'
import { login, register, logout, getCurrentUser, setAuthData, getToken } from '../api/authApi'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = getCurrentUser()
    const storedToken = getToken()
    if (storedUser && storedToken) {
      setUser(storedUser)
      setToken(storedToken)
    }
    setLoading(false)
  }, [])

  const handleLogin = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await login({ email, password })
      setAuthData(response.token, response.user)
      setUser(response.user)
      setToken(response.token)
      return response.user
    } catch (err) {
      const errorMsg = err.message || 'Login failed'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (email, password, name) => {
    setLoading(true)
    setError(null)
    try {
      const response = await register({ email, password, name })
      setAuthData(response.token, response.user)
      setUser(response.user)
      setToken(response.token)
      return response.user
    } catch (err) {
      const errorMsg = err.message || 'Registration failed'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    setToken(null)
    setError(null)
  }

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user && !!token,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
