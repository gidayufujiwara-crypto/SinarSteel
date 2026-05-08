import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { financeApi } from '../../api/finance';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Plus } from 'lucide-react';
const CashPage = () => {
    const [cash, setCash] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ tanggal: new Date().toISOString().slice(0, 10), tipe: 'pemasukan', kategori: '', jumlah: 0, keterangan: '' });
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await financeApi.getCashList();
            setCash(res.data);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchData(); }, []);
    const handleSave = async () => {
        try {
            await financeApi.createCash(form);
            setShowForm(false);
            setForm({ tanggal: new Date().toISOString().slice(0, 10), tipe: 'pemasukan', kategori: '', jumlah: 0, keterangan: '' });
            fetchData();
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Gagal menyimpan');
        }
    };
    return (_jsxs(Card, { title: "KAS & BIAYA", glow: "cyan", children: [_jsx("div", { className: "flex justify-end mb-4", children: _jsxs(Button, { onClick: () => setShowForm(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), " CATAT TRANSAKSI"] }) }), _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Tanggal" }), _jsx("th", { children: "Tipe" }), _jsx("th", { children: "Kategori" }), _jsx("th", { children: "Jumlah" }), _jsx("th", { children: "Keterangan" })] }) }), _jsxs("tbody", { children: [loading && _jsx("tr", { children: _jsx("td", { colSpan: 5, className: "text-center py-4 text-text-dim", children: "MEMUAT..." }) }), !loading && cash.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 5, className: "text-center py-4 text-text-dim", children: "BELUM ADA DATA" }) }), cash.map(item => (_jsxs("tr", { children: [_jsx("td", { children: item.tanggal }), _jsx("td", { children: _jsx("span", { className: `tag ${item.tipe === 'pemasukan' ? 'tag-green' : 'tag-pink'}`, children: item.tipe }) }), _jsx("td", { children: item.kategori }), _jsxs("td", { className: "font-bold", children: ["Rp ", Number(item.jumlah).toLocaleString()] }), _jsx("td", { className: "text-text-dim", children: item.keterangan || '-' })] }, item.id)))] })] }), _jsx(Modal, { open: showForm, onClose: () => setShowForm(false), title: "CATAT TRANSAKSI KAS", onConfirm: handleSave, confirmText: "SIMPAN", children: _jsxs("div", { className: "space-y-3", children: [_jsx(Input, { label: "Tanggal", type: "date", value: form.tanggal, onChange: e => setForm({ ...form, tanggal: e.target.value }) }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold uppercase text-text-dim", children: "Tipe" }), _jsxs("select", { value: form.tipe, onChange: e => setForm({ ...form, tipe: e.target.value }), className: "input-neon w-full mt-1", children: [_jsx("option", { value: "pemasukan", children: "Pemasukan" }), _jsx("option", { value: "pengeluaran", children: "Pengeluaran" })] })] }), _jsx(Input, { label: "Kategori", value: form.kategori, onChange: e => setForm({ ...form, kategori: e.target.value }), placeholder: "Listrik, Gaji, Transport, dll." }), _jsx(Input, { label: "Jumlah", type: "number", value: form.jumlah, onChange: e => setForm({ ...form, jumlah: parseFloat(e.target.value) || 0 }) }), _jsx(Input, { label: "Keterangan", value: form.keterangan, onChange: e => setForm({ ...form, keterangan: e.target.value }) })] }) })] }));
};
export default CashPage;
