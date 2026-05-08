import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { financeApi } from '../../api/finance';
import Card from '../../components/ui/Card';
const TrialBalancePage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await financeApi.getTrialBalance();
            setData(res.data);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchData(); }, []);
    return (_jsx(Card, { title: "NERACA SALDO", glow: "cyan", children: _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Kode" }), _jsx("th", { children: "Nama Akun" }), _jsx("th", { children: "Debit" }), _jsx("th", { children: "Kredit" }), _jsx("th", { children: "Saldo Debit" }), _jsx("th", { children: "Saldo Kredit" })] }) }), _jsxs("tbody", { children: [loading && _jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center py-4 text-text-dim", children: "MEMUAT..." }) }), !loading && data.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center py-4 text-text-dim", children: "BELUM ADA DATA" }) }), data.map(item => (_jsxs("tr", { children: [_jsx("td", { className: "font-mono", children: item.kode }), _jsx("td", { children: item.nama }), _jsxs("td", { children: ["Rp ", Number(item.debit).toLocaleString()] }), _jsxs("td", { children: ["Rp ", Number(item.kredit).toLocaleString()] }), _jsxs("td", { children: ["Rp ", Number(item.saldo_debit).toLocaleString()] }), _jsxs("td", { children: ["Rp ", Number(item.saldo_kredit).toLocaleString()] })] }, item.kode)))] })] }) }));
};
export default TrialBalancePage;
