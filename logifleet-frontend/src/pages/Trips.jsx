import { useEffect, useState } from 'react'
import { Map, Plus, X, Play, CheckCircle, XCircle, RefreshCw, Search } from 'lucide-react'
import Layout from '../components/Layout'
import { useToast } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/apiClient'

function TripStatusBadge({ status }) {
  const map = {
    ASSIGNED:    { cls: 'badge-yellow', label: 'Assigned' },
    IN_PROGRESS: { cls: 'badge-blue',   label: 'In Progress' },
    COMPLETED:   { cls: 'badge-green',  label: 'Completed' },
    CANCELLED:   { cls: 'badge-red',    label: 'Cancelled' },
  }
  const { cls, label } = map[status] ?? { cls: 'badge-muted', label: status }
  return <span className={`badge ${cls}`}>{label}</span>
}

const EMPTY_FORM = { vehicleId: '', driverId: '', source: '', destination: '' }

export default function Trips() {
  const { isAdmin } = useAuth()
  const addToast = useToast()

  const [trips, setTrips]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)

  async function fetchTrips() {
    setLoading(true)
    try {
      const res = await apiClient.get('/api/trips')
      setTrips(res.data)
    } catch { addToast('Failed to load trips', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTrips() }, [])

  async function handleCreate() {
    if (!form.vehicleId || !form.driverId || !form.source || !form.destination) {
      addToast('All fields are required', 'error')
      return
    }
    setSaving(true)
    try {
      await apiClient.post('/api/trips', {
        vehicleId:   Number(form.vehicleId),
        driverId:    Number(form.driverId),
        source:      form.source,
        destination: form.destination,
      })
      addToast('Trip assigned successfully', 'success')
      setShowModal(false)
      setForm(EMPTY_FORM)
      fetchTrips()
    } catch (err) {
      addToast(err.response?.data || 'Failed to create trip', 'error')
    } finally { setSaving(false) }
  }

  async function tripAction(id, action) {
    try {
      await apiClient.put(`/api/trips/${id}/${action}`)
      const labels = { start: 'started', complete: 'completed', cancel: 'cancelled' }
      addToast(`Trip ${labels[action]}`, 'success')
      fetchTrips()
    } catch (err) {
      addToast(err.response?.data || `Action '${action}' failed`, 'error')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this trip record?')) return
    try {
      await apiClient.delete(`/api/trips/${id}`)
      addToast('Trip deleted', 'success')
      fetchTrips()
    } catch { addToast('Delete failed', 'error') }
  }

  const statusOptions = ['ALL', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

  const filtered = trips
    .filter((t) => filterStatus === 'ALL' || t.status === filterStatus)
    .filter((t) =>
      String(t.vehicleId).includes(search) ||
      String(t.driverId).includes(search)  ||
      t.source?.toLowerCase().includes(search.toLowerCase()) ||
      t.destination?.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <Layout title="Trips">
      <div className="table-card">
        <div className="table-header">
          <span className="table-title">
            Trip Management
            <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
              {trips.length} total
            </span>
          </span>
          <div className="table-actions" style={{ flexWrap: 'wrap' }}>
            {/* Status filter */}
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: 13, padding: '6px 10px' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {statusOptions.map((s) => <option key={s}>{s}</option>)}
            </select>
            <div className="search-bar">
              <Search size={14} />
              <input className="search-input" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="btn btn-outline btn-sm" onClick={fetchTrips}>
              <RefreshCw size={13} /> Refresh
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <Plus size={14} /> Assign Trip
            </button>
          </div>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="loading-center"><div className="spinner" /><span>Loading…</span></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td><span className="id-pill">#{t.id}</span></td>
                    <td><span className="id-pill">V#{t.vehicleId}</span></td>
                    <td><span className="id-pill">D#{t.driverId}</span></td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{t.source}</span>
                      <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>→</span>
                      <span>{t.destination}</span>
                    </td>
                    <td><TripStatusBadge status={t.status} /></td>
                    <td>
                      <div className="td-actions">
                        {t.status === 'ASSIGNED' && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => tripAction(t.id, 'start')}
                            title="Start Trip"
                          >
                            <Play size={12} /> Start
                          </button>
                        )}
                        {t.status === 'IN_PROGRESS' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => tripAction(t.id, 'complete')}
                            title="Complete Trip"
                          >
                            <CheckCircle size={12} /> Complete
                          </button>
                        )}
                        {(t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS') && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => tripAction(t.id, 'cancel')}
                            title="Cancel Trip"
                          >
                            <XCircle size={12} /> Cancel
                          </button>
                        )}
                        {isAdmin && (t.status === 'COMPLETED' || t.status === 'CANCELLED') && (
                          <button className="btn-icon danger" onClick={() => handleDelete(t.id)} title="Delete">
                            <XCircle size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <Map size={36} /><p>No trips found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Assign Trip Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Assign New Trip</span>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'var(--blue-dim)', border: '1px solid #3b82f633', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 12, color: 'var(--blue)', marginBottom: 4 }}>
                Vehicle must be AVAILABLE. Trip will start in ASSIGNED status.
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle ID</label>
                <input className="form-input" type="number" placeholder="e.g. 1"
                  value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Driver ID</label>
                <input className="form-input" type="number" placeholder="e.g. 101"
                  value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Source</label>
                <input className="form-input" placeholder="e.g. Vijayawada"
                  value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Destination</label>
                <input className="form-input" placeholder="e.g. Hyderabad"
                  value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                {saving ? 'Creating…' : 'Assign Trip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
