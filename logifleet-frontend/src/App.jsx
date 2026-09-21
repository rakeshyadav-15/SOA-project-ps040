import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login       from './pages/Login'
import Dashboard   from './pages/Dashboard'
import Vehicles    from './pages/Vehicles'
import Trips       from './pages/Trips'
import Maintenance from './pages/Maintenance'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected — all authenticated users */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          <Route path="/vehicles" element={
            <ProtectedRoute><Vehicles /></ProtectedRoute>
          } />

          <Route path="/maintenance" element={
            <ProtectedRoute><Maintenance /></ProtectedRoute>
          } />

          {/* Trips — ADMIN and DISPATCHER only */}
          <Route path="/trips" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'DISPATCHER']}>
              <Trips />
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
