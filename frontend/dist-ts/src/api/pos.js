import apiClient from './client';
export const posApi = {
    getCurrentShift: () => apiClient.get('/pos/shift/current'),
    openShift: (data) => apiClient.post('/pos/shift/open', data),
    closeShift: (data) => apiClient.post('/pos/shift/close', data),
    createTransaksi: (data) => apiClient.post('/pos/transaksi', data),
    getTransaksiList: (limit = 100) => apiClient.get('/pos/transaksi', { params: { limit } }),
    getTransaksiById: (id) => apiClient.get(`/pos/transaksi/${id}`),
    voidTransaksi: (id, password) => apiClient.post(`/pos/transaksi/${id}/void`, { password }),
    requestVoidPin: (transaksiId) => apiClient.post(`/pos/transaksi/${transaksiId}/request-void`),
    verifyVoidPin: (transaksiId, pin) => apiClient.post(`/pos/transaksi/${transaksiId}/void`, { pin }),
    returTransaksi: (data) => apiClient.post('/pos/retur', data),
    switchPayment: (transaksiId, jenis) => apiClient.put(`/pos/transaksi/${transaksiId}/switch-payment`, { jenis_pembayaran: jenis }),
    getShiftCollection: () => apiClient.get('/pos/shift/collection'),
    createPickup: (data) => apiClient.post('/pos/shift/pickup', data),
};
export const settingsApi = {
    getAll: () => apiClient.get('/settings'),
    update: (key, value) => apiClient.put(`/settings/${key}`, { value }),
};
