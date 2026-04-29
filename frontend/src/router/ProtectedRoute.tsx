import React, { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token, user, fetchCurrentUser, isLoading } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    // Jika ada token tapi user belum di-fetch, ambil data user
    if (token && !user && !isLoading) {
      fetchCurrentUser().catch(() => {
        // Jika gagal, redirect ke login
        navigate('/login')
      })
    }
  }, [token, user, isLoading, fetchCurrentUser, navigate])

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute