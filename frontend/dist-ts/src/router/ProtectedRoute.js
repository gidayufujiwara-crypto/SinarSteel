import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
const ProtectedRoute = ({ children }) => {
    const { token, user, fetchCurrentUser, isLoading } = useAuthStore();
    const navigate = useNavigate();
    useEffect(() => {
        // Jika ada token tapi user belum di-fetch, ambil data user
        if (token && !user && !isLoading) {
            fetchCurrentUser().catch(() => {
                // Jika gagal, redirect ke login
                navigate('/login');
            });
        }
    }, [token, user, isLoading, fetchCurrentUser, navigate]);
    if (!token) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
export default ProtectedRoute;
