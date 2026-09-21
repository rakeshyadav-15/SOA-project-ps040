import { useEffect, useState } from 'react'
import { Truck, Plus, X, Pencil, Trash2, RefreshCw, Search } from 'lucide-react'
import Layout from '../components/Layout'
import { useToast } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/apiClient'

const STATUS_OPTIONS = ['AVAILABLE', 'ON_TRIP', 'UNDER_MAINTENANCE']

function StatusBadge({ status }) {
  const map = {
    AVAILABLE:         'badge-green',
    ON_TRIP:           'badge-blue',
    UNDER_MAINTENANCE: 'badge-orange',
  }
  return <span className={`badge ${map[status] ?? 'badge-muted'}`}>{status?.replace('_', ' ')}</span>
}

const EMPTY_FORM = { registrationNumber: '', model: '', status: 'AVAILABLE', location: '' }

export default function Vehicles() {
  const { isAdmin } = useAuth()
  const addToast = useToast()

  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  // Modal state
  const [showModal, setShowModal]   = useState(false)
  const [editVehicle, setEditVehicle] = useState(null) // null = create mode
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)

  // Status quick-update modal
  const [statusModal, setStatusModal] = useState(null) // { id, currentStatus }
  const [newStatus, setNewStatus]     = useState('')

  async function fetchVehicles() {
    setLoading(true)
    try {
      const res = await apiClient.get('/api/vehicles')
      setVehicles(res.data)
    } catch { addToast('Failed to load vehicles', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchVehicles() }, [])

  function openCreate() {
    setEditVehicle(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(v) {
    setEditVehicle(v)
    setForm({ registrationNumber: v.registrationNumber, model: v.model, status: v.status, location: v.location })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.registrationNumber || !form.model || !form.status || !form.location) {
      addToast('All fields are required', 'error')
      return
    }
    setSaving(true)
    try {
      if (editVehicle) {
        await apiClient.put(`/api/vehicles/${editVehicle.id}`, form)
        addToast('Vehicle updated successfully', 'success')
      } else {
        await apiClient.post('/api/vehicles', form)
        addToast('Vehicle created successfully', 'success')
      }
      setShowModal(false)
      fetchVehicles()
    } catch (err) {
      addToast(err.response?.data || 'Save failed', 'error')
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this vehicle?')) return
    try {
      await apiClient.delete(`/api/vehicles/${id}`)
      addToast('Vehicle deleted', 'success')
      fetchVehicles()
    } catch { addToast('Delete failed', 'error') }
  }

  function openStatusModal(v) {
    setStatusModal({ id: v.id, current: v.status })
    setNewStatus(v.status)
  }

  async function handleStatusUpdate() {
    try {
      await apiClient.put(`/api/vehicles/${statusModal.id}/status?status=${newStatus}`)
      addToast(`Status updated to ${newStatus}`, 'success')
      setStatusModal(null)
      fetchVehicles()
    } catch (err) {
      addToast(err.response?.data || 'Status update failed', 'error')
    }
  }

  const filtered = vehicles.filter((v) =>
    v.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase()) ||
    v.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout title="Vehicles">
      <div className="table-card">
        <div className="table-header">
          <span className="table-title">
            Fleet Registry
            <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
              {vehicles.length} vehicles
            </span>
          </span>
          <div className="table-actions">
            <div className="search-bar">
              <Search size={14} />
              <input
                className="search-input"
                placeholder="Search vehicles…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-outline btn-sm" onClick={fetchVehicles}>
              <RefreshCw size={13} /> Refresh
            </button>
            {isAdmin && (
              <button className="btn btn-primary btn-sm" onClick={openCreate}>
                <Plus size={14} /> Add Vehicle
              </button>
            )}
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
                  <th>Registration No.</th>
                  <th>Model</th>
                  <th>Location</th>
                  <th>Status</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id}>
                    <td><span className="id-pill">#{v.id}</span></td>
                    <td style={{ fontWeight: 600 }}>{v.registrationNumber}</td>
                    <td>{v.model}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{v.location}</td>
                    <td><StatusBadge status={v.status} /></td>
                    {isAdmin && (
                      <td>
                        <div className="td-actions">
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => openStatusModal(v)}
                            title="Update Status"
                          >
                            <RefreshCw size={12} /> Status
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => openEdit(v)}
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            className="btn-icon danger"
                            onClick={() => handleDelete(v.id)}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <Truck size={36} /><p>No vehicles found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Registration Number</label>
                <input className="form-input" placeholder="e.g. AP39AB1234"
                  value={form.registrationNumber}
                  onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Model</label>
                <input className="form-input" placeholder="e.g. Tata Prima"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" placeholder="e.g. Vijayawada"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editVehicle ? 'Update Vehicle' : 'Create Vehicle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Status Update Modal */}
      {statusModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setStatusModal(null)}>
          <div className="modal" style={{ maxWidth: 360 }}>
            <div className="modal-header">
              <span className="modal-title">Update Vehicle Status</span>
              <button className="modal-close" onClick={() => setStatusModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                Current: <StatusBadge status={statusModal.current} />
              </p>
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setStatusModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleStatusUpdate}>Update</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
