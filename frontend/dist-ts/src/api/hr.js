import apiClient from './client';
export const hrApi = {
    // Karyawan
    getKaryawan: () => apiClient.get('/hr/karyawan'),
    createKaryawan: (data) => apiClient.post('/hr/karyawan', data),
    updateKaryawan: (id, data) => apiClient.put(`/hr/karyawan/${id}`, data),
    deleteKaryawan: (id) => apiClient.delete(`/hr/karyawan/${id}`),
    // Jadwal Shift
    getJadwal: (karyawanID, startDate, endDate) => apiClient.get(`/hr/jadwal/${karyawanID}`, { params: { start_date: startDate, end_date: endDate } }),
    createJadwal: (data) => apiClient.post('/hr/jadwal', data),
    // Absensi
    getAbsensi: (karyawanID, bulan, tahun) => apiClient.get(`/hr/absensi/${karyawanID}`, { params: { bulan, tahun } }),
    // Gaji
    getUsers: () => apiClient.get('/hr/users'),
    createUser: (data) => apiClient.post('/hr/users', data),
    deleteUser: (id) => apiClient.delete(`/hr/users/${id}`),
    hitungGaji: (data) => apiClient.post('/hr/gaji/hitung', data),
    getGajiList: (bulan, tahun) => apiClient.get('/hr/gaji', { params: { bulan, tahun } }),
};
