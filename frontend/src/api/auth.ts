import apiClient from './client'

interface LoginRequest {
  username: string
  password: string
}

interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

interface UserResponse {
  id: string
  username: string
  full_name: string
  role: string
  is_active: boolean
}

export const authApi = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post('/auth/login', data)
    return response.data
  },

  refreshToken: async (refresh_token: string): Promise<TokenResponse> => {
    const response = await apiClient.post('/auth/refresh', { refresh_token })
    return response.data
  },

  getMe: async (): Promise<UserResponse> => {
    const response = await apiClient.get('/auth/me')
    return response.data
  },
}