import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth';
export const useAuthStore = create()(persist((set, get) => ({
    token: null,
    refreshToken: null,
    user: null,
    isLoading: false,
    error: null,
    login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authApi.login({ username, password });
            const { access_token, refresh_token } = response;
            // Set token dulu, lalu fetch user
            localStorage.setItem('token', access_token);
            localStorage.setItem('refreshToken', refresh_token);
            set({
                token: access_token,
                refreshToken: refresh_token,
            });
            // Fetch user data
            const user = await authApi.getMe();
            set({ user, isLoading: false, error: null });
        }
        catch (err) {
            const message = err.response?.data?.detail || 'Login gagal';
            set({ isLoading: false, error: message });
            throw new Error(message);
        }
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        set({ token: null, refreshToken: null, user: null });
    },
    fetchCurrentUser: async () => {
        const token = get().token;
        if (!token)
            return;
        try {
            const user = await authApi.getMe();
            set({ user });
        }
        catch {
            // Token expired atau invalid, logout
            get().logout();
        }
    },
    setTokens: (access, refresh) => {
        localStorage.setItem('token', access);
        localStorage.setItem('refreshToken', refresh);
        set({ token: access, refreshToken: refresh });
    },
}), {
    name: 'sinarsteel-auth',
    partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
    }),
}));
