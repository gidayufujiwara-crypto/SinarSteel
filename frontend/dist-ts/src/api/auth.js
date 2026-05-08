import apiClient from './client';
export const authApi = {
    login: async (data) => {
        const response = await apiClient.post('/auth/login', data);
        return response.data;
    },
    refreshToken: async (refresh_token) => {
        const response = await apiClient.post('/auth/refresh', { refresh_token });
        return response.data;
    },
    getMe: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },
};
