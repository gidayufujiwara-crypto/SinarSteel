import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Truck, Plus } from 'lucide-react';
const tabs = [
    { to: '/delivery/orders', label: 'Daftar Pengiriman', icon: Truck },
    { to: '/delivery/orders/tambah', label: 'Buat Order', icon: Plus },
];
const DeliveryPage = () => {
    const location = useLocation();
    return (_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-text-primary font-orbitron tracking-[2px] uppercase mb-4", children: "MANAJEMEN PENGIRIMAN" }), _jsx("div", { className: "flex gap-2 mb-6 border-b border-[rgba(0,245,255,0.15)] pb-2 overflow-x-auto", children: tabs.map(tab => {
                    const isActive = location.pathname.startsWith(tab.to);
                    const Icon = tab.icon;
                    return (_jsxs(NavLink, { to: tab.to, className: `flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors text-sm font-semibold tracking-wide whitespace-nowrap ${isActive
                            ? 'bg-bg-card text-neon-cyan border border-[rgba(0,245,255,0.3)] border-b-transparent shadow-[0_0_10px_rgba(0,245,255,0.1)]'
                            : 'text-text-dim hover:text-neon-cyan hover:bg-[rgba(0,245,255,0.04)]'}`, children: [_jsx(Icon, { className: "w-4 h-4" }), _jsx("span", { children: tab.label })] }, tab.to));
                }) }), _jsx(Outlet, {})] }));
};
export default DeliveryPage;
