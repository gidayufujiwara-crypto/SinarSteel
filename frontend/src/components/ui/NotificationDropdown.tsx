import React, { useEffect, useState } from 'react'
import { reportApi } from '../../api/report'
import { Bell } from 'lucide-react'

interface Notification {
  type: string
  message: string
  time: string
}

const NotificationDropdown: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [notif, setNotif] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await reportApi.getNotifications()
      setNotif(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
    const interval = setInterval(fetch, 60000) // refresh tiap 1 menit
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-lg flex items-center justify-center relative cursor-pointer transition-all duration-200"
        style={{
          background: 'rgba(255,45,120,0.1)',
          border: '1px solid rgba(255,45,120,0.3)',
          color: 'var(--neon-pink)',
        }}
        title="Notifikasi"
      >
        <Bell className="w-4 h-4" />
        {notif.length > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--neon-pink)] text-black text-[10px] font-bold flex items-center justify-center"
            style={{ boxShadow: '0 0 8px var(--neon-pink)' }}
          >
            {notif.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 mt-2 w-80 max-h-80 overflow-y-auto rounded-lg border border-[rgba(0,245,255,0.2)] bg-bg-card shadow-lg z-50 p-2"
          >
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2 px-2">
              Notifikasi
            </h3>
            {loading && <p className="text-text-dim text-sm p-2">Memuat...</p>}
            {!loading && notif.length === 0 && (
              <p className="text-text-dim text-sm p-2">Tidak ada notifikasi</p>
            )}
            {notif.map((item, idx) => (
              <div
                key={idx}
                className={`p-2 rounded mb-1 text-sm ${
                  item.type === 'warning'
                    ? 'bg-[rgba(255,45,120,0.1)] border-l-2 border-[var(--neon-pink)]'
                    : 'bg-[rgba(0,245,255,0.05)] border-l-2 border-[var(--neon-cyan)]'
                }`}
              >
                <p className="text-text-primary">{item.message}</p>
                <p className="text-text-dim text-xs mt-1">
                  {new Date(item.time).toLocaleTimeString('id-ID')}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationDropdown