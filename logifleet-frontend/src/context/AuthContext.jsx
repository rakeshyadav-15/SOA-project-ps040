import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Decode JWT payload without a library (base64 decode)
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Re-hydrate user from localStorage on page refresh
  useEffect(() => {
    const token = localStorage.getItem('logifleet_token')
    if (token) {
      const payload = parseJwt(token)
      if (payload && payload.exp * 1000 > Date.now()) {
        setUser({ username: payload.sub, role: payload.role, token })
      } else {
        localStorage.removeItem('logifleet_token')
      }
    }
    setLoading(false)
  }, [])

  function login(token) {
    const payload = parseJwt(token)
    if (payload) {
      const userData = { username: payload.sub, role: payload.role, token }
      localStorage.setItem('logifleet_token', token)
      setUser(userData)
      return userData
    }
    return null
  }

  function logout() {
    localStorage.removeItem('logifleet_token')
    setUser(null)
  }

  // Role helper functions
  const isAdmin       = user?.role === 'ADMIN'
  const isDispatcher  = user?.role === 'DISPATCHER'
  const isMaintenance = user?.role === 'MAINTENANCE'

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isDispatcher, isMaintenance }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
