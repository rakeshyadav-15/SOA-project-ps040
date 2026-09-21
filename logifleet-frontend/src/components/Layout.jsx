import { useState, useCallback, createContext, useContext } from 'react'
import Sidebar from './Sidebar'
import { CheckCircle, XCircle, Info } from 'lucide-react'

// Toast context so any page can fire toasts
const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' && <CheckCircle size={16} color="var(--green)" />}
          {t.type === 'error'   && <XCircle     size={16} color="var(--red)"   />}
          {t.type === 'info'    && <Info         size={16} color="var(--blue)"  />}
          {t.message}
        </div>
      ))}
    </div>
  )
}

export default function Layout({ children, title }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      <div className="app-layout">
        <Sidebar />
        <div className="main-area">
          {title && (
            <div className="top-header">
              <h1 className="page-title">{title}</h1>
            </div>
          )}
          <div className="page-content">
            {children}
          </div>
        </div>
        <ToastContainer toasts={toasts} />
      </div>
    </ToastContext.Provider>
  )
}
