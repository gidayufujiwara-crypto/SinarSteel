import apiClient from './client';
export const kategoriApi = {
    getAll: () => apiClient.get('/master/kategori'),
    create: (data) => apiClient.post('/master/kategori', data),
    update: (id, data) => apiClient.put(`/master/kategori/${id}`, data),
    delete: (id) => apiClient.delete(`/master/kategori/${id}`),
};
export const supplierApi = {
    getAll: (search) => apiClient.get('/master/supplier', { params: { search } }),
    create: (data) => apiClient.post('/master/supplier', data),
    update: (id, data) => apiClient.put(`/master/supplier/${id}`, data),
    delete: (id) => apiClient.delete(`/master/supplier/${id}`),
};
export const pelangganApi = {
    getAll: (search) => apiClient.get('/master/pelanggan', { params: { search } }),
    create: (data) => apiClient.post('/master/pelanggan', data),
    update: (id, data) => apiClient.put(`/master/pelanggan/${id}`, data),
    delete: (id) => apiClient.delete(`/master/pelanggan/${id}`),
};
export const satuanApi = {
    getAll: () => apiClient.get('/master/satuan'),
    create: (data) => apiClient.post('/master/satuan', data),
    update: (id, data) => apiClient.put(`/master/satuan/${id}`, data),
    delete: (id) => apiClient.delete(`/master/satuan/${id}`),
};
export const produkApi = {
    getAll: (search) => apiClient.get('/master/produk', { params: { search } }),
    getById: (id) => apiClient.get(`/master/produk/${id}`),
    create: (data) => apiClient.post('/master/produk', data),
    update: (id, data) => apiClient.put(`/master/produk/${id}`, data),
    delete: (id) => apiClient.delete(`/master/produk/${id}`),
    updateStok: (id, tambahStok, hargaBeli, markupPersen) => apiClient.put(`/master/produk/${id}/stok`, null, {
        params: { tambah_stok: tambahStok, harga_beli: hargaBeli, markup_persen: markupPersen }
    }),
};
