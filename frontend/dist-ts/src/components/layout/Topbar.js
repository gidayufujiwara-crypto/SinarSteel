import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut } from 'lucide-react';
import NotificationDropdown from '../ui/NotificationDropdown';
const Topbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (_jsxs("header", { className: "h-16 border-b border-[rgba(0,245,255,0.1)] flex items-center px-7 gap-4 sticky top-0 z-10", style: {
            background: 'rgba(11,18,32,0.8)',
            backdropFilter: 'blur(12px)',
        }, children: [_jsxs("div", { className: "font-orbitron text-base font-black tracking-[3px] whitespace-nowrap select-none", style: {
                    color: 'var(--neon-cyan)',
                    textShadow: '0 0 20px rgba(0,245,255,0.6)',
                    animation: 'flicker 8s infinite',
                }, children: ["SINAR", _jsx("span", { style: { color: 'var(--neon-orange)', textShadow: '0 0 20px rgba(255,107,0,0.6)' }, children: "STEEL" })] }), _jsx("div", { className: "flex-1" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(NotificationDropdown, {}), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-9 h-9 rounded-lg flex items-center justify-center font-orbitron text-xs font-bold cursor-pointer border", style: {
                                    background: 'linear-gradient(135deg, #1a2a4a, #0e3a6a)',
                                    borderColor: 'rgba(0,245,255,0.4)',
                                    color: 'var(--neon-cyan)',
                                    boxShadow: '0 0 10px rgba(0,245,255,0.15)',
                                }, title: user?.full_name || 'User', children: user?.full_name?.charAt(0).toUpperCase() || 'U' }), _jsxs("div", { className: "hidden md:block", children: [_jsx("p", { className: "text-sm font-medium text-text-primary leading-tight", children: user?.full_name || 'User' }), _jsx("p", { className: "text-xs text-text-dim capitalize leading-tight", children: user?.role?.replace('_', ' ') || '-' })] }), _jsx("button", { onClick: handleLogout, className: "ml-1 p-2 text-text-dim hover:text-neon-pink transition-colors", title: "Keluar", children: _jsx(LogOut, { className: "w-4 h-4" }) })] })] }), _jsx("style", { children: `
        @keyframes flicker {
          0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% { opacity: 1; }
          20%, 21.999%, 63%, 63.999%, 65%, 69.999% { opacity: 0.6; }
        }
      ` })] }));
};
export default Topbar;
