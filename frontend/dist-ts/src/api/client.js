import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));
apiClient.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            try {
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refresh_token: refreshToken,
                });
                const { access_token, refresh_token } = response.data;
                localStorage.setItem('token', access_token);
                localStorage.setItem('refreshToken', refresh_token);
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return apiClient(originalRequest);
            }
            catch {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
            }
        }
        else {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});
export default apiClient;
