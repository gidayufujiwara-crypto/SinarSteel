import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard, Database, ShoppingCart, Warehouse,
  Users, Truck, BarChart3, Settings, DollarSign
} from 'lucide-react'

// Definisi menu lengkap dengan role yang diizinkan
const allMenuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'kasir'] },
  { path: '/master/produk', label: 'Data Master', icon: Database, roles: ['super_admin'] },
  { path: '/pos', label: 'POS Kasir', icon: ShoppingCart, roles: ['super_admin', 'kasir'] },
  { path: '/wms', label: 'Gudang', icon: Warehouse, roles: ['super_admin', 'checker', 'gudang'] },
  { path: '/delivery/orders', label: 'Pengiriman', icon: Truck, roles: ['super_admin', 'kasir'] },
  { path: '/report', label: 'Laporan', icon: BarChart3, roles: ['super_admin', 'kasir'] },  
  { path: '/hr/karyawan', label: 'HR', icon: Users, roles: ['super_admin'] },
  { path: '/finance', label: 'Keuangan', icon: DollarSign, roles: ['super_admin'] },
  { path: '/settings', label: 'Pengaturan', icon: Settings, roles: ['super_admin'] },
]

const Sidebar: React.FC = () => {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)

  // Filter berdasarkan role
  const menuItems = allMenuItems.filter(
    (item) => user && item.roles.includes(user.role)
  )

  return (
    <aside
      className="fixed left-0 top-0 h-full bg-bg-panel border-r border-[rgba(0,245,255,0.15)] z-40 flex flex-col items-center py-5 gap-2"
      style={{ width: '72px' }}
    >
      {/* Logo hexagon beranimasi */}
      <NavLink to="/" className="no-underline">
        <div
          className="w-10 h-10 flex items-center justify-center cursor-pointer mb-5 font-orbitron text-sm font-black text-black"
          style={{
            background: 'var(--neon-cyan)',
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            boxShadow: '0 0 20px var(--neon-cyan), 0 0 40px rgba(0,245,255,0.3)',
            animation: 'pulse-logo 3s ease-in-out infinite',
          }}
        >
          B
        </div>
      </NavLink>

      {menuItems.map((item) => {
        const isActive =
          item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path)
        const Icon = item.icon

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`w-11 h-11 flex items-center justify-center rounded-lg transition-all duration-200 relative ${
              isActive
                ? 'bg-[rgba(0,245,255,0.1)] text-neon-cyan border border-[rgba(0,245,255,0.3)] shadow-[0_0_12px_rgba(0,245,255,0.2),inset_0_0_12px_rgba(0,245,255,0.05)]'
                : 'text-text-dim hover:bg-[rgba(255,255,255,0.05)] hover:text-text-primary'
            }`}
            title={item.label}
          >
            {isActive && (
              <div
                className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r-md"
                style={{
                  background: 'var(--neon-cyan)',
                  boxShadow: '0 0 8px var(--neon-cyan)',
                }}
              />
            )}
            <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_6px_rgba(0,245,255,0.5)]' : ''}`} />
          </NavLink>
        )
      })}

      <div className="flex-1" />
    </aside>
  )
}

export default Sidebar