import apiClient from './client'

export const hrApi = {
  // Karyawan
  getKaryawan: () => apiClient.get('/hr/karyawan'),
  createKaryawan: (data: any) => apiClient.post('/hr/karyawan', data),
  updateKaryawan: (id: string, data: any) => apiClient.put(`/hr/karyawan/${id}`, data),
  deleteKaryawan: (id: string) => apiClient.delete(`/hr/karyawan/${id}`),

  // Jadwal Shift
  getJadwal: (karyawanID: string, startDate: string, endDate: string) =>
    apiClient.get(`/hr/jadwal/${karyawanID}`, { params: { start_date: startDate, end_date: endDate } }),
  createJadwal: (data: any) => apiClient.post('/hr/jadwal', data),

  // Absensi
  getAbsensi: (karyawanID: string, bulan?: number, tahun?: number) =>
    apiClient.get(`/hr/absensi/${karyawanID}`, { params: { bulan, tahun } }),

  // Gaji
  getUsers: () => apiClient.get('/hr/users'),
  createUser: (data: any) => apiClient.post('/hr/users', data),
  deleteUser: (id: string) => apiClient.delete(`/hr/users/${id}`),
  hitungGaji: (data: any) => apiClient.post('/hr/gaji/hitung', data),
  getGajiList: (bulan?: number, tahun?: number) => apiClient.get('/hr/gaji', { params: { bulan, tahun } }),
}