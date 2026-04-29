import apiClient from './client'

export const deliveryApi = {
  getOrders: (params?: { status?: string; driver_id?: string }) =>
    apiClient.get('/delivery/orders', { params }),
  getOrderById: (id: string) => apiClient.get(`/delivery/orders/${id}`),
  createOrder: (data: any) => apiClient.post('/delivery/orders', data),
  assignDriver: (id: string, driverId: string) =>
    apiClient.put(`/delivery/orders/${id}/assign`, null, { params: { driver_id: driverId } }),
  updateStatus: (id: string, data: any) => apiClient.put(`/delivery/orders/${id}/status`, data),
  getDriverToday: (driverId: string) => apiClient.get('/delivery/driver/today', { params: { driver_id: driverId } }),
}