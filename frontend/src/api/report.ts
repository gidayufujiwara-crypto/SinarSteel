import apiClient from './client'

export const reportApi = {
  getDashboardMetrics: () => apiClient.get('/report/dashboard/metrics'),
  getDashboardCharts: () => apiClient.get('/report/dashboard/charts'),
  getNotifications: () => apiClient.get('/report/notifications'),
  getSalesReport: (params?: { start_date?: string; end_date?: string }) =>
    apiClient.get('/report/sales', { params }),
}