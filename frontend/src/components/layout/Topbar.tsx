import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LogOut } from 'lucide-react'
import NotificationDropdown from '../ui/NotificationDropdown'

const Topbar: React.FC = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header
      className="h-16 border-b border-[rgba(0,245,255,0.1)] flex items-center px-7 gap-4 sticky top-0 z-10"
      style={{
        background: 'rgba(11,18,32,0.8)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Brand */}
      <div
        className="font-orbitron text-base font-black tracking-[3px] whitespace-nowrap select-none"
        style={{
          color: 'var(--neon-cyan)',
          textShadow: '0 0 20px rgba(0,245,255,0.6)',
          animation: 'flicker 8s infinite',
        }}
      >
        SINAR<span style={{ color: 'var(--neon-orange)', textShadow: '0 0 20px rgba(255,107,0,0.6)' }}>STEEL</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notification & User */}
      <div className="flex items-center gap-4">
        <NotificationDropdown />

        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-orbitron text-xs font-bold cursor-pointer border"
            style={{
              background: 'linear-gradient(135deg, #1a2a4a, #0e3a6a)',
              borderColor: 'rgba(0,245,255,0.4)',
              color: 'var(--neon-cyan)',
              boxShadow: '0 0 10px rgba(0,245,255,0.15)',
            }}
            title={user?.full_name || 'User'}
          >
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-text-primary leading-tight">
              {user?.full_name || 'User'}
            </p>
            <p className="text-xs text-text-dim capitalize leading-tight">
              {user?.role?.replace('_', ' ') || '-'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-1 p-2 text-text-dim hover:text-neon-pink transition-colors"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes flicker {
          0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% { opacity: 1; }
          20%, 21.999%, 63%, 63.999%, 65%, 69.999% { opacity: 0.6; }
        }
      `}</style>
    </header>
  )
}

export default Topbar