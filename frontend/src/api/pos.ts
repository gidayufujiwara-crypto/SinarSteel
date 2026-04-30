import apiClient from './client'

export const posApi = {
  getCurrentShift: () => apiClient.get('/pos/shift/current'),
  openShift: (data: { saldo_awal: number }) => apiClient.post('/pos/shift/open', data),
  closeShift: (data: { total_setoran: number }) => apiClient.post('/pos/shift/close', data),
  createTransaksi: (data: any) => apiClient.post('/pos/transaksi', data),
  getTransaksiList: (limit = 50) => apiClient.get('/pos/transaksi', { params: { limit } }),
  getTransaksiById: (id: string) => apiClient.get(`/pos/transaksi/${id}`),
  voidTransaksi: (id: string, password: string) => apiClient.post(`/pos/transaksi/${id}/void`, { password }),
}

export const settingsApi = {
  getAll: () => apiClient.get('/settings'),
  update: (key: string, value: string) => apiClient.put(`/settings/${key}`, { value }),
}