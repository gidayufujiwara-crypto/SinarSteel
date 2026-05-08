import apiClient from './client';
export const deliveryApi = {
    getOrders: (params) => apiClient.get('/delivery/orders', { params }),
    getOrderById: (id) => apiClient.get(`/delivery/orders/${id}`),
    createOrder: (data) => apiClient.post('/delivery/orders', data),
    assignDriver: (id, driverId) => apiClient.put(`/delivery/orders/${id}/assign`, null, { params: { driver_id: driverId } }),
    updateStatus: (id, data) => apiClient.put(`/delivery/orders/${id}/status`, data),
    getDriverToday: (driverId) => apiClient.get('/delivery/driver/today', { params: { driver_id: driverId } }),
};
