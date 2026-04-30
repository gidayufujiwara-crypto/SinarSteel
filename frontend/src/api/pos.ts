import apiClient from './client'

export const posApi = {
  getCurrentShift: () => apiClient.get('/pos/shift/current'),
  openShift: (data: { saldo_awal: number }) => apiClient.post('/pos/shift/open', data),
  closeShift: (data: { total_setoran: number }) => apiClient.post('/pos/shift/close', data),
  createTransaksi: (data: any) => apiClient.post('/pos/transaksi', data),
  getTransaksiList: (limit = 100) => apiClient.get('/pos/transaksi', { params: { limit } }),
  getTransaksiById: (id: string) => apiClient.get(`/pos/transaksi/${id}`),
  voidTransaksi: (id: string, password: string) => apiClient.post(`/pos/transaksi/${id}/void`, { password }),
  requestVoidPin: (transaksiId: string) => apiClient.post(`/pos/transaksi/${transaksiId}/request-void`),
  verifyVoidPin: (transaksiId: string, pin: string) => apiClient.post(`/pos/transaksi/${transaksiId}/void`, { pin }),
  returTransaksi: (data: any) => apiClient.post('/pos/retur', data),
}

export const settingsApi = {
  getAll: () => apiClient.get('/settings'),
  update: (key: string, value: string) => apiClient.put(`/settings/${key}`, { value }),
}