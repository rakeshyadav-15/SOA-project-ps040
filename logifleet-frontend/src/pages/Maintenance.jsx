import { useEffect, useState } from 'react'
import { Wrench, Plus, X, CheckCircle, RefreshCw, Search, History } from 'lucide-react'
import Layout from '../components/Layout'
import { useToast } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/apiClient'

function MaintenanceBadge({ status }) {
  const map = {
    SCHEDULED:   { cls: 'badge-yellow', label: 'Scheduled'   },
    IN_PROGRESS: { cls: 'badge-blue',   label: 'In Progress'  },
    COMPLETED:   { cls: 'badge-green',  label: 'Completed'    },
    CANCELLED:   { cls: 'badge-red',    label: 'Cancelled'    },
  }
  const { cls, label } = map[status] ?? { cls: 'badge-muted', label: status }
  return <span className={`badge ${cls}`}>{label}</span>
}

const MAINT_TYPES = ['PREVENTIVE', 'CORRECTIVE', 'INSPECTION', 'REPAIR']

const EMPTY_FORM = {
  vehicleId: '', maintenanceType: 'PREVENTIVE', description: '',
  scheduledDate: '', status: 'SCHEDULED', cost: '',
}

export default function Maintenance() {
  const { isAdmin, isMaintenance } = useAuth()
  const canWrite = isAdmin || isMaintenance
  const addToast = useToast()

  const [records, setRecords]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filterStatus, setFilter] = useState('ALL')

  // Create modal
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)

  // History modal
  const [historyModal, setHistoryModal] = useState(false)
  const [historyVehicleId, setHistoryVehicleId] = useState('')
  const [historyRecords, setHistoryRecords]     = useState([])
  const [historyLoading, setHistoryLoading]     = useState(false)

  async function fetchAll() {
    setLoading(true)
    try {
      const res = await apiClient.get('/api/maintenance')
      setRecords(res.data)
    } catch { addToast('Failed to load maintenance records', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  async function handleCreate() {
    if (!form.vehicleId || !form.maintenanceType || !form.scheduledDate || !form.status) {
      addToast('Required fields are missing', 'error')
      return
    }
    setSaving(true)
    try {
      await apiClient.post('/api/maintenance', {
        vehicleId:       Number(form.vehicleId),
        maintenanceType: form.maintenanceType,
        description:     form.description,
        scheduledDate:   form.scheduledDate,
        status:          form.status,
        cost:            form.cost ? Number(form.cost) : null,
      })
      addToast('Maintenance scheduled. Vehicle is now UNDER_MAINTENANCE.', 'success')
      setShowModal(false)
      setForm(EMPTY_FORM)
      fetchAll()
    } catch (err) {
      addToast(err.response?.data || 'Failed to create record', 'error')
    } finally { setSaving(false) }
  }

  async function handleComplete(id) {
    try {
      await apiClient.put(`/api/maintenance/${id}/complete`)
      addToast('Maintenance completed. Vehicle is now AVAILABLE.', 'success')
      fetchAll()
    } catch (err) {
      addToast(err.response?.data || 'Complete failed', 'error')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this maintenance record?')) return
    try {
      await apiClient.delete(`/api/maintenance/${id}`)
      addToast('Record deleted', 'success')
      fetchAll()
    } catch { addToast('Delete failed', 'error') }
  }

  async function loadHistory() {
    if (!historyVehicleId) { addToast('Enter a vehicle ID', 'error'); return }
    setHistoryLoading(true)
    try {
      const res = await apiClient.get(`/api/maintenance/vehicle/${historyVehicleId}`)
      setHistoryRecords(res.data)
    } catch { addToast('No records found', 'error'); setHistoryRecords([]) }
    finally { setHistoryLoading(false) }
  }

  const statusOptions = ['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

  const filtered = records
    .filter((r) => filterStatus === 'ALL' || r.status === filterStatus)
    .filter((r) =>
      String(r.vehicleId).includes(search) ||
      r.maintenanceType?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <Layout title="Maintenance">
      <div className="table-card">
        <div className="table-header">
          <span className="table-title">
            Maintenance Records
            <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
              {records.length} total
            </span>
          </span>
          <div className="table-actions" style={{ flexWrap: 'wrap' }}>
            <select className="form-select" style={{ width: 'auto', fontSize: 13, padding: '6px 10px' }}
              value={filterStatus} onChange={(e) => setFilter(e.target.value)}>
              {statusOptions.map((s) => <option key={s}>{s}</option>)}
            </select>
            <div className="search-bar">
              <Search size={14} />
              <input className="search-input" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setHistoryModal(true)}>
              <History size={13} /> Vehicle History
            </button>
            <button className="btn btn-outline btn-sm" onClick={fetchAll}>
              <RefreshCw size={13} /> Refresh
            </button>
            {canWrite && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                <Plus size={14} /> Schedule Maintenance
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
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Scheduled</th>
                  <th>Completed</th>
                  <th>Cost</th>
                  <th>Status</th>
                  {canWrite && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td><span className="id-pill">#{r.id}</span></td>
                    <td><span className="id-pill">V#{r.vehicleId}</span></td>
                    <td style={{ fontWeight: 600 }}>{r.maintenanceType}</td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: 200 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.description || '—'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-dim)' }}>{r.scheduledDate}</td>
                    <td style={{ color: r.completedDate ? 'var(--green)' : 'var(--text-muted)' }}>
                      {r.completedDate ?? '—'}
                    </td>
                    <td style={{ color: 'var(--text-dim)' }}>
                      {r.cost != null ? `₹${Number(r.cost).toLocaleString()}` : '—'}
                    </td>
                    <td><MaintenanceBadge status={r.status} /></td>
                    {canWrite && (
                      <td>
                        <div className="td-actions">
                          {r.status !== 'COMPLETED' && r.status !== 'CANCELLED' && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleComplete(r.id)}
                              title="Mark Complete"
                            >
                              <CheckCircle size={12} /> Complete
                            </button>
                          )}
                          {isAdmin && (
                            <button className="btn-icon danger" onClick={() => handleDelete(r.id)} title="Delete">
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty-state">
                        <Wrench size={36} /><p>No maintenance records found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Maintenance Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Schedule Maintenance</span>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'var(--orange-dim)', border: '1px solid #f9731633', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 12, color: 'var(--orange)', marginBottom: 4 }}>
                Vehicle will be set to <strong>UNDER_MAINTENANCE</strong> automatically.
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle ID *</label>
                <input className="form-input" type="number" placeholder="e.g. 1"
                  value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Maintenance Type *</label>
                <select className="form-select" value={form.maintenanceType} onChange={(e) => setForm({ ...form, maintenanceType: e.target.value })}>
                  {MAINT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="Optional description"
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Scheduled Date *</label>
                <input className="form-input" type="date"
                  value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status *</label>
                <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option>SCHEDULED</option>
                  <option>IN_PROGRESS</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Cost (₹)</label>
                <input className="form-input" type="number" min="0" placeholder="e.g. 5000"
                  value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                {saving ? 'Saving…' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Maintenance History Modal */}
      {historyModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setHistoryModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <span className="modal-title">Vehicle Maintenance History</span>
              <button className="modal-close" onClick={() => setHistoryModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" type="number" placeholder="Enter Vehicle ID" style={{ flex: 1 }}
                  value={historyVehicleId} onChange={(e) => setHistoryVehicleId(e.target.value)}
                />
                <button className="btn btn-primary" onClick={loadHistory}>
                  <Search size={14} /> Search
                </button>
              </div>

              {historyLoading && <div className="loading-center" style={{ padding: 20 }}><div className="spinner" /></div>}

              {!historyLoading && historyRecords.length > 0 && (
                <div style={{ marginTop: 8, maxHeight: 300, overflowY: 'auto' }}>
                  <table>
                    <thead><tr><th>ID</th><th>Type</th><th>Scheduled</th><th>Completed</th><th>Cost</th><th>Status</th></tr></thead>
                    <tbody>
                      {historyRecords.map((r) => (
                        <tr key={r.id}>
                          <td><span className="id-pill">#{r.id}</span></td>
                          <td style={{ fontWeight: 600 }}>{r.maintenanceType}</td>
                          <td>{r.scheduledDate}</td>
                          <td style={{ color: r.completedDate ? 'var(--green)' : 'var(--text-muted)' }}>{r.completedDate ?? '—'}</td>
                          <td>{r.cost != null ? `₹${Number(r.cost).toLocaleString()}` : '—'}</td>
                          <td><MaintenanceBadge status={r.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!historyLoading && historyRecords.length === 0 && historyVehicleId && (
                <div className="empty-state" style={{ padding: 20 }}>
                  <Wrench size={28} /><p>No history found for Vehicle #{historyVehicleId}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setHistoryModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
