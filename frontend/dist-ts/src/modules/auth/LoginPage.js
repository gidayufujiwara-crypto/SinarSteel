import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Package, Eye, EyeOff } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading, error } = useAuthStore();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
            navigate('/');
        }
        catch {
            // Error sudah di-handle oleh store
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-bg-primary p-4", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 mb-4", children: _jsx(Package, { className: "w-8 h-8 text-neon-cyan" }) }), _jsx("h1", { className: "text-3xl font-bold text-neon-cyan", style: { textShadow: '0 0 30px rgba(0, 245, 255, 0.5)' }, children: "SinarSteel" }), _jsx("p", { className: "text-text-secondary mt-2", children: "Sistem Manajemen Toko Besi" })] }), _jsxs("div", { className: "card-neon p-8", children: [_jsx("h2", { className: "text-xl font-semibold text-text-primary mb-6 text-center", children: "Masuk ke Sistem" }), error && (_jsx("div", { className: "mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx(Input, { label: "Username", type: "text", placeholder: "Masukkan username", value: username, onChange: (e) => setUsername(e.target.value), required: true, autoFocus: true }), _jsxs("div", { className: "relative", children: [_jsx(Input, { label: "Password", type: showPassword ? 'text' : 'password', placeholder: "Masukkan password", value: password, onChange: (e) => setPassword(e.target.value), required: true, className: "pr-10" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-[38px] text-text-secondary hover:text-neon-cyan", children: showPassword ? _jsx(EyeOff, { className: "w-5 h-5" }) : _jsx(Eye, { className: "w-5 h-5" }) })] }), _jsx(Button, { type: "submit", isLoading: isLoading, className: "w-full mt-2", children: "Masuk" })] })] }), _jsx("p", { className: "text-text-secondary text-xs text-center mt-6", children: "\u00A9 2026 SinarSteel \u2022 v1.2.0" })] }) }));
};
export default LoginPage;
