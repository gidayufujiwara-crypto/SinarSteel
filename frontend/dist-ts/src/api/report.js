import apiClient from './client';
export const reportApi = {
    getDashboardMetrics: () => apiClient.get('/report/dashboard/metrics'),
    getDashboardCharts: () => apiClient.get('/report/dashboard/charts'),
    getNotifications: () => apiClient.get('/report/notifications'),
    getSalesReport: (params) => apiClient.get('/report/sales', { params }),
};
