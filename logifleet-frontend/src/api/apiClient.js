import axios from 'axios'

// Use relative baseURL — Vite dev server proxies /api/* → http://localhost:8080
// This avoids CORS issues entirely during development.
const apiClient = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token automatically to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('logifleet_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 — but NOT for the login endpoint itself.
// If we redirect on a login 401, the error message never shows on screen.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/api/auth/login')

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('logifleet_token')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default apiClient
