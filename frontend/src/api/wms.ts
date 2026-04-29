import apiClient from './client'

export const wmsApi = {
  // PO
  getPOList: (status?: string) => apiClient.get('/wms/po', { params: { status } }),
  getPOById: (id: string) => apiClient.get(`/wms/po/${id}`),
  createPO: (data: any) => apiClient.post('/wms/po', data),
  updatePOStatus: (id: string, status: string) => apiClient.put(`/wms/po/${id}/status`, null, { params: { status } }),
  receivePO: (id: string, data: any) => apiClient.post(`/wms/po/${id}/receive`, data),

  // Stock Opname
  getOpnameList: () => apiClient.get('/wms/opname'),
  createOpname: (data: any) => apiClient.post('/wms/opname', data),

  // Mutation
  getMutations: (produkId?: string) => apiClient.get('/wms/mutation', { params: { produk_id: produkId } }),

  // Inventory
  getInventory: (search?: string) => apiClient.get('/wms/inventory', { params: { search } }),
}