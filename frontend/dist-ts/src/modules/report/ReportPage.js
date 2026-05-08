import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { reportApi } from '../../api/report';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
const ReportPage = () => {
    const [sales, setSales] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedTrx, setSelectedTrx] = useState(null);
    const fetchSales = async () => {
        setLoading(true);
        try {
            const res = await reportApi.getSalesReport({
                start_date: startDate || undefined,
                end_date: endDate || undefined,
            });
            setSales(res.data);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchSales(); }, []);
    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(sales.map((item) => ({
            'No Transaksi': item.no_transaksi,
            'Tanggal': new Date(item.tanggal).toLocaleDateString('id-ID'),
            'Kasir': item.kasir,
            'Pelanggan': item.pelanggan,
            'Total': Number(item.total),
            'Pembayaran': item.jenis_pembayaran,
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Penjualan');
        XLSX.writeFile(workbook, `laporan_penjualan_${startDate}_${endDate}.xlsx`);
    };
    return (_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-text-primary font-orbitron tracking-[2px] uppercase mb-6", children: "LAPORAN PENJUALAN" }), _jsxs(Card, { glow: "cyan", children: [_jsxs("div", { className: "flex flex-wrap gap-4 mb-6 items-end", children: [_jsx(Input, { label: "Tanggal Mulai", type: "date", value: startDate, onChange: e => setStartDate(e.target.value) }), _jsx(Input, { label: "Tanggal Akhir", type: "date", value: endDate, onChange: e => setEndDate(e.target.value) }), _jsx(Button, { onClick: fetchSales, children: "FILTER" }), _jsxs(Button, { variant: "secondary", onClick: exportExcel, disabled: sales.length === 0, children: [_jsx(Download, { className: "w-4 h-4 mr-1" }), " EXPORT EXCEL"] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "No Transaksi" }), _jsx("th", { children: "Tanggal" }), _jsx("th", { children: "Kasir" }), _jsx("th", { children: "Pelanggan" }), _jsx("th", { children: "Total" }), _jsx("th", { children: "Pembayaran" })] }) }), _jsx("tbody", { children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center py-4 text-text-dim", children: "MEMUAT..." }) })) : sales.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center py-4 text-text-dim", children: "TIDAK ADA DATA" }) })) : (sales.map((item, idx) => (_jsxs("tr", { children: [_jsx("td", { className: "font-mono cursor-pointer text-neon-cyan hover:text-neon-cyan/80", onClick: () => setSelectedTrx(item), children: item.no_transaksi }), _jsx("td", { children: new Date(item.tanggal).toLocaleDateString('id-ID') }), _jsx("td", { className: "text-text-dim", children: item.kasir }), _jsx("td", { children: item.pelanggan }), _jsxs("td", { children: ["Rp ", Number(item.total).toLocaleString()] }), _jsx("td", { children: item.jenis_pembayaran })] }, idx)))) })] }) })] })] }));
};
export default ReportPage;
