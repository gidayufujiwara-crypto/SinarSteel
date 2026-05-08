import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { financeApi } from '../../api/finance';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
const ReportPage = () => {
    const now = new Date();
    const [bulan, setBulan] = useState(now.getMonth() + 1);
    const [tahun, setTahun] = useState(now.getFullYear());
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await financeApi.getProfitLoss(bulan, tahun);
            setData(res.data);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchData(); }, []);
    return (_jsxs(Card, { title: "LAPORAN LABA RUGI PER PRODUK", glow: "cyan", children: [_jsxs("div", { className: "flex gap-4 mb-4 items-center", children: [_jsx("select", { value: bulan, onChange: e => setBulan(parseInt(e.target.value)), className: "input-neon w-24", children: Array.from({ length: 12 }, (_, i) => i + 1).map(m => _jsx("option", { value: m, children: m }, m)) }), _jsx(Input, { type: "number", value: tahun, onChange: e => setTahun(parseInt(e.target.value)), className: "w-24" }), _jsx(Button, { onClick: fetchData, children: "TAMPILKAN" })] }), _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Produk" }), _jsx("th", { children: "Pendapatan" }), _jsx("th", { children: "HPP" }), _jsx("th", { children: "Laba Kotor" })] }) }), _jsxs("tbody", { children: [loading && _jsx("tr", { children: _jsx("td", { colSpan: 4, className: "text-center py-4 text-text-dim", children: "MEMUAT..." }) }), !loading && data.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 4, className: "text-center py-4 text-text-dim", children: "BELUM ADA DATA" }) }), data.map((item, idx) => (_jsxs("tr", { children: [_jsx("td", { children: item.nama_produk || '-' }), _jsxs("td", { children: ["Rp ", Number(item.total_pendapatan || 0).toLocaleString()] }), _jsxs("td", { children: ["Rp ", Number(item.total_hpp || 0).toLocaleString()] }), _jsxs("td", { className: `font-bold ${Number(item.laba_kotor) >= 0 ? 'text-neon-green' : 'text-neon-pink'}`, children: ["Rp ", Number(item.laba_kotor || 0).toLocaleString()] })] }, idx)))] })] })] }));
};
export default ReportPage;
