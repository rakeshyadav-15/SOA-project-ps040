import { NavLink, useNavigate } from 'react-router-dom'
import {
  Truck, Map, Wrench, LayoutDashboard, LogOut, Gauge
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { user, logout, isAdmin, isDispatcher, isMaintenance } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const roleBadgeClass =
    isAdmin ? 'role-admin' :
    isDispatcher ? 'role-dispatcher' :
    'role-maintenance'

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Truck size={22} color="white" />
        </div>
        <div className="brand-text">
          <div className="brand-name">LogiFleet</div>
          <div className="brand-sub">Fleet Operations</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Overview</div>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </NavLink>

        {/* VEHICLES — all roles can view */}
        <div className="nav-section-label" style={{ marginTop: 4 }}>Fleet</div>

        <NavLink
          to="/vehicles"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          <Truck size={16} />
          Vehicles
        </NavLink>

        {/* TRIPS — ADMIN and DISPATCHER */}
        {(isAdmin || isDispatcher) && (
          <NavLink
            to="/trips"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Map size={16} />
            Trips
          </NavLink>
        )}

        {/* MAINTENANCE — all roles can view */}
        <NavLink
          to="/maintenance"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          <Wrench size={16} />
          Maintenance
        </NavLink>

        {/* ANALYTICS placeholder */}
        <div className="nav-section-label" style={{ marginTop: 4 }}>System</div>
        <NavLink
          to="/dashboard"
          className="nav-link"
          style={{ opacity: 0.45, pointerEvents: 'none' }}
        >
          <Gauge size={16} />
          Analytics
          <span style={{ marginLeft: 'auto', fontSize: 10, background: '#1e3a5f', padding: '2px 6px', borderRadius: 99 }}>Soon</span>
        </NavLink>
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">
            {user?.username?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.username}</div>
            <div className="user-role">
              <span className={`badge ${roleBadgeClass}`} style={{ fontSize: 10, padding: '1px 7px' }}>
                {user?.role}
              </span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
