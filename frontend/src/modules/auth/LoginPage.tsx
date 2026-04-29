import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Package, Eye, EyeOff } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, error } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(username, password)
      navigate('/')
    } catch {
      // Error sudah di-handle oleh store
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 mb-4">
            <Package className="w-8 h-8 text-neon-cyan" />
          </div>
          <h1 className="text-3xl font-bold text-neon-cyan" style={{ textShadow: '0 0 30px rgba(0, 245, 255, 0.5)' }}>
            SinarSteel
          </h1>
          <p className="text-text-secondary mt-2">
            Sistem Manajemen Toko Besi
          </p>
        </div>

        {/* Login Form */}
        <div className="card-neon p-8">
          <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">
            Masuk ke Sistem
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-text-secondary hover:text-neon-cyan"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-2">
              Masuk
            </Button>
          </form>
        </div>

        <p className="text-text-secondary text-xs text-center mt-6">
          © 2026 SinarSteel • v1.2.0
        </p>
      </div>
    </div>
  )
}

export default LoginPage