import apiClient from './client'

export const kategoriApi = {
  getAll: () => apiClient.get('/master/kategori'),
  create: (data: any) => apiClient.post('/master/kategori', data),
  update: (id: string, data: any) => apiClient.put(`/master/kategori/${id}`, data),
  delete: (id: string) => apiClient.delete(`/master/kategori/${id}`),
}

export const supplierApi = {
  getAll: (search?: string) => apiClient.get('/master/supplier', { params: { search } }),
  create: (data: any) => apiClient.post('/master/supplier', data),
  update: (id: string, data: any) => apiClient.put(`/master/supplier/${id}`, data),
  delete: (id: string) => apiClient.delete(`/master/supplier/${id}`),
}

export const pelangganApi = {
  getAll: (search?: string) => apiClient.get('/master/pelanggan', { params: { search } }),
  create: (data: any) => apiClient.post('/master/pelanggan', data),
  update: (id: string, data: any) => apiClient.put(`/master/pelanggan/${id}`, data),
  delete: (id: string) => apiClient.delete(`/master/pelanggan/${id}`),
}

export const satuanApi = {
  getAll: () => apiClient.get('/master/satuan'),
  create: (data: any) => apiClient.post('/master/satuan', data),
  update: (id: string, data: any) => apiClient.put(`/master/satuan/${id}`, data),
  delete: (id: string) => apiClient.delete(`/master/satuan/${id}`),
}

export const produkApi = {
  getAll: (search?: string) => apiClient.get('/master/produk', { params: { search } }),
  getById: (id: string) => apiClient.get(`/master/produk/${id}`),
  create: (data: any) => apiClient.post('/master/produk', data),
  update: (id: string, data: any) => apiClient.put(`/master/produk/${id}`, data),
  delete: (id: string) => apiClient.delete(`/master/produk/${id}`),
  updateStok: (id: string, tambahStok: number, hargaBeli: number, markupPersen: number) =>
    apiClient.put(`/master/produk/${id}/stok`, null, {
      params: { tambah_stok: tambahStok, harga_beli: hargaBeli, markup_persen: markupPersen }
    }),
}