import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col" style={{ marginLeft: '72px' }}>
        <Topbar />
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ background: 'var(--bg-dark)' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout