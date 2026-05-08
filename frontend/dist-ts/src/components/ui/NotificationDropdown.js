import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { reportApi } from '../../api/report';
import { Bell } from 'lucide-react';
const NotificationDropdown = () => {
    const [open, setOpen] = useState(false);
    const [notif, setNotif] = useState([]);
    const [loading, setLoading] = useState(false);
    const fetch = async () => {
        setLoading(true);
        try {
            const res = await reportApi.getNotifications();
            setNotif(res.data);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetch();
        const interval = setInterval(fetch, 60000); // refresh tiap 1 menit
        return () => clearInterval(interval);
    }, []);
    return (_jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setOpen(!open), className: "w-9 h-9 rounded-lg flex items-center justify-center relative cursor-pointer transition-all duration-200", style: {
                    background: 'rgba(255,45,120,0.1)',
                    border: '1px solid rgba(255,45,120,0.3)',
                    color: 'var(--neon-pink)',
                }, title: "Notifikasi", children: [_jsx(Bell, { className: "w-4 h-4" }), notif.length > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--neon-pink)] text-black text-[10px] font-bold flex items-center justify-center", style: { boxShadow: '0 0 8px var(--neon-pink)' }, children: notif.length }))] }), open && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-40", onClick: () => setOpen(false) }), _jsxs("div", { className: "absolute right-0 mt-2 w-80 max-h-80 overflow-y-auto rounded-lg border border-[rgba(0,245,255,0.2)] bg-bg-card shadow-lg z-50 p-2", children: [_jsx("h3", { className: "text-xs font-bold text-text-primary uppercase tracking-wider mb-2 px-2", children: "Notifikasi" }), loading && _jsx("p", { className: "text-text-dim text-sm p-2", children: "Memuat..." }), !loading && notif.length === 0 && (_jsx("p", { className: "text-text-dim text-sm p-2", children: "Tidak ada notifikasi" })), notif.map((item, idx) => (_jsxs("div", { className: `p-2 rounded mb-1 text-sm ${item.type === 'warning'
                                    ? 'bg-[rgba(255,45,120,0.1)] border-l-2 border-[var(--neon-pink)]'
                                    : 'bg-[rgba(0,245,255,0.05)] border-l-2 border-[var(--neon-cyan)]'}`, children: [_jsx("p", { className: "text-text-primary", children: item.message }), _jsx("p", { className: "text-text-dim text-xs mt-1", children: new Date(item.time).toLocaleTimeString('id-ID') })] }, idx)))] })] }))] }));
};
export default NotificationDropdown;
