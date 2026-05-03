import apiClient from './client'

export const financeApi = {
  // Journal
  getJournals: (params?: { start_date?: string; end_date?: string }) =>
    apiClient.get('/finance/journals', { params }),
  createJournal: (data: any) => apiClient.post('/finance/journals', data),

  // COA
  getCOA: () => apiClient.get('/finance/coa'),
  createCOA: (data: any) => apiClient.post('/finance/coa', data),

  // Profit Loss
  getProfitLoss: (bulan: number, tahun: number) =>
    apiClient.get('/finance/profit-loss', { params: { bulan, tahun } }),

  // Cash
  getCashList: (params?: { start_date?: string; end_date?: string }) =>
    apiClient.get('/finance/cash', { params }),
  createCash: (data: any) => apiClient.post('/finance/cash', data),
}