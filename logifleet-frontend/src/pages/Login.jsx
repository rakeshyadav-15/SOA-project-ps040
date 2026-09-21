import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Eye, EyeOff, AlertCircle, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/apiClient'

const DEMO_ACCOUNTS = [
  { role: 'ADMIN',       username: 'admin',       password: 'admin123', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  { role: 'DISPATCHER',  username: 'dispatcher1', password: 'disp123',  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  { role: 'MAINTENANCE', username: 'mechanic1',   password: 'mech123',  color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
]

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  function fillCredentials(acc) {
    setUsername(acc.username)
    setPassword(acc.password)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.')
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.post('/api/auth/login', { username, password })
      const token = response.data.token
      login(token)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data || 'Invalid username or password.'
      setError(typeof msg === 'string' ? msg : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg-grid" />
      <div className="login-bg-glow" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Truck size={32} color="white" />
          </div>
          <div className="login-logo-name">LogiFleet</div>
          <div className="login-logo-tagline">
            Commercial Fleet Telematics &amp; Maintenance Operations
          </div>
        </div>

        {/* Quick Login Panel */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Zap size={11} /> Quick login — click to fill credentials
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => fillCredentials(acc)}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: 8,
                  border: `1px solid ${acc.color}44`,
                  background: acc.bg,
                  color: acc.color,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  letterSpacing: 0.3,
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = acc.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = `${acc.color}44`}
              >
                {acc.role}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="login-error" style={{ marginBottom: 12 }}>
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              className="form-input"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 10, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: 'var(--text-muted)', display: 'flex',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Credentials hint */}
        <div style={{ marginTop: 16, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
          {DEMO_ACCOUNTS.map((acc) => (
            <div key={acc.role} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '2px 0', color: 'var(--text-muted)' }}>
              <span style={{ color: acc.color, fontWeight: 600, minWidth: 90 }}>{acc.role}</span>
              <span>{acc.username} / {acc.password}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
