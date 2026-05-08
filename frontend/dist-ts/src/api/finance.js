import apiClient from './client';
export const financeApi = {
    // Journal
    getJournals: (params) => apiClient.get('/finance/journals', { params }),
    createJournal: (data) => apiClient.post('/finance/journals', data),
    // COA
    getCOA: () => apiClient.get('/finance/coa'),
    createCOA: (data) => apiClient.post('/finance/coa', data),
    // Profit Loss
    getProfitLoss: (bulan, tahun) => apiClient.get('/finance/profit-loss', { params: { bulan, tahun } }),
    // Cash
    getCashList: (params) => apiClient.get('/finance/cash', { params }),
    createCash: (data) => apiClient.post('/finance/cash', data),
    getLedger: (accountId, params) => apiClient.get(`/finance/ledger/${accountId}`, { params }),
    getTrialBalance: () => apiClient.get('/finance/trial-balance'),
};
