import apiClient from './client';
export const wmsApi = {
    // PO
    getPOList: (status) => apiClient.get('/wms/po', { params: { status } }),
    getPOById: (id) => apiClient.get(`/wms/po/${id}`),
    createPO: (data) => apiClient.post('/wms/po', data),
    updatePOStatus: (id, status) => apiClient.put(`/wms/po/${id}/status`, null, { params: { status } }),
    receivePO: (id, data) => apiClient.post(`/wms/po/${id}/receive`, data),
    // Stock Opname
    getOpnameList: () => apiClient.get('/wms/opname'),
    createOpname: (data) => apiClient.post('/wms/opname', data),
    // Mutation
    getMutations: (produkId) => apiClient.get('/wms/mutation', { params: { produk_id: produkId } }),
    // Inventory
    getInventory: (search) => apiClient.get('/wms/inventory', { params: { search } }),
};
