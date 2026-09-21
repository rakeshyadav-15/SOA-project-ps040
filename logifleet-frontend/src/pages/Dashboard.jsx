import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Truck, Map, Wrench, CheckCircle, AlertTriangle, Clock, TrendingUp } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/apiClient'

function StatCard({ icon, label, value, color, bgColor }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bgColor }}>
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-value" style={{ color }}>{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}

function VehicleStatusBadge({ status }) {
  const map = {
    AVAILABLE:         { cls: 'badge-green',  label: 'Available' },
    ON_TRIP:           { cls: 'badge-blue',   label: 'On Trip'   },
    UNDER_MAINTENANCE: { cls: 'badge-orange', label: 'Under Maintenance' },
  }
  const { cls, label } = map[status] ?? { cls: 'badge-muted', label: status }
  return <span className={`badge ${cls}`}>{label}</span>
}

export default function Dashboard() {
  const { user, isAdmin, isDispatcher } = useAuth()
  const [vehicles, setVehicles]         = useState([])
  const [trips, setTrips]               = useState([])
  const [maintenance, setMaintenance]   = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [v, t, m] = await Promise.all([
          apiClient.get('/api/vehicles'),
          (isAdmin || isDispatcher) ? apiClient.get('/api/trips') : Promise.resolve({ data: [] }),
          apiClient.get('/api/maintenance'),
        ])
        setVehicles(v.data)
        setTrips(t.data)
        setMaintenance(m.data)
      } catch { /* handled by interceptor */ }
      finally { setLoading(false) }
    }
    load()
  }, [isAdmin, isDispatcher])

  const available   = vehicles.filter((v) => v.status === 'AVAILABLE').length
  const onTrip      = vehicles.filter((v) => v.status === 'ON_TRIP').length
  const underMaint  = vehicles.filter((v) => v.status === 'UNDER_MAINTENANCE').length
  const activeTrips = trips.filter((t) => t.status === 'IN_PROGRESS').length
  const scheduled   = maintenance.filter((m) => m.status === 'SCHEDULED').length

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="loading-center"><div className="spinner" /><span>Loading fleet data…</span></div>
      </Layout>
    )
  }

  return (
    <Layout title="Dashboard">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <div className="welcome-title">Welcome back, {user?.username}! 👋</div>
          <div className="welcome-sub">Here's what's happening with your fleet today.</div>
        </div>
        <Truck size={64} className="welcome-truck" color="var(--accent)" />
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          icon={<Truck size={22} color="var(--accent)" />}
          label="Total Vehicles"
          value={vehicles.length}
          color="var(--accent)"
          bgColor="var(--orange-dim)"
        />
        <StatCard
          icon={<CheckCircle size={22} color="var(--green)" />}
          label="Available"
          value={available}
          color="var(--green)"
          bgColor="var(--green-dim)"
        />
        <StatCard
          icon={<Map size={22} color="var(--blue)" />}
          label="On Trip"
          value={onTrip}
          color="var(--blue)"
          bgColor="var(--blue-dim)"
        />
        <StatCard
          icon={<AlertTriangle size={22} color="var(--orange)" />}
          label="Under Maintenance"
          value={underMaint}
          color="var(--orange)"
          bgColor="var(--orange-dim)"
        />
        {(isAdmin || isDispatcher) && (
          <StatCard
            icon={<TrendingUp size={22} color="var(--blue)" />}
            label="Active Trips"
            value={activeTrips}
            color="var(--blue)"
            bgColor="var(--blue-dim)"
          />
        )}
        <StatCard
          icon={<Clock size={22} color="var(--yellow)" />}
          label="Maintenance Scheduled"
          value={scheduled}
          color="var(--yellow)"
          bgColor="var(--yellow-dim)"
        />
      </div>

      {/* Recent Vehicles Table */}
      <div className="table-card" style={{ marginBottom: 16 }}>
        <div className="table-header">
          <span className="table-title">Fleet Status Overview</span>
          <Link to="/vehicles" className="btn btn-outline btn-sm">View All</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Registration</th>
                <th>Model</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.slice(0, 6).map((v) => (
                <tr key={v.id}>
                  <td><span className="id-pill">#{v.id}</span></td>
                  <td style={{ fontWeight: 600 }}>{v.registrationNumber}</td>
                  <td>{v.model}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{v.location}</td>
                  <td><VehicleStatusBadge status={v.status} /></td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state" style={{ padding: '30px' }}>
                      <Truck size={32} />
                      <p>No vehicles registered yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Maintenance */}
      <div className="table-card">
        <div className="table-header">
          <span className="table-title">Recent Maintenance</span>
          <Link to="/maintenance" className="btn btn-outline btn-sm">View All</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {maintenance.slice(0, 5).map((m) => (
                <tr key={m.id}>
                  <td><span className="id-pill">#{m.id}</span></td>
                  <td><span className="id-pill">V#{m.vehicleId}</span></td>
                  <td>{m.maintenanceType}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{m.scheduledDate}</td>
                  <td>
                    <span className={`badge ${
                      m.status === 'COMPLETED' ? 'badge-green' :
                      m.status === 'SCHEDULED' ? 'badge-yellow' :
                      'badge-muted'
                    }`}>{m.status}</span>
                  </td>
                  <td style={{ color: 'var(--text-dim)' }}>
                    {m.cost != null ? `₹${m.cost.toLocaleString()}` : '—'}
                  </td>
                </tr>
              ))}
              {maintenance.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state" style={{ padding: '30px' }}>
                      <Wrench size={32} /><p>No maintenance records yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
