import React from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { BookOpen, FileText, Banknote, BarChart3 } from 'lucide-react'

const tabs = [
  { to: '/finance/journals', label: 'Jurnal Umum', icon: BookOpen },
  { to: '/finance/ledger', label: 'Buku Besar', icon: FileText },
  { to: '/finance/cash', label: 'Kas & Biaya', icon: Banknote },
  { to: '/finance/reports', label: 'Laba Rugi', icon: BarChart3 },
  { to: '/finance/trial-balance', label: 'Neraca Saldo', icon: BarChart3 },
]

const FinancePage: React.FC = () => {
  const location = useLocation()

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary font-orbitron tracking-[2px] uppercase mb-4">KEUANGAN</h1>
      <div className="flex gap-2 mb-6 border-b border-[rgba(0,245,255,0.15)] pb-2 overflow-x-auto">
        {tabs.map(tab => {
          const isActive = location.pathname.startsWith(tab.to)
          const Icon = tab.icon
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors text-sm font-semibold tracking-wide whitespace-nowrap ${
                isActive
                  ? 'bg-bg-card text-neon-cyan border border-[rgba(0,245,255,0.3)] border-b-transparent shadow-[0_0_10px_rgba(0,245,255,0.1)]'
                  : 'text-text-dim hover:text-neon-cyan hover:bg-[rgba(0,245,255,0.04)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </NavLink>
          )
        })}
      </div>
      <Outlet />
    </div>
  )
}

export default FinancePage