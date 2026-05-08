import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { financeApi } from '../../api/finance';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Plus } from 'lucide-react';
const COAList = () => {
    const [coa, setCOA] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ kode: '', nama: '', tipe: 'aset', saldo_normal: 'debit' });
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await financeApi.getCOA();
            setCOA(res.data);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchData(); }, []);
    const handleSave = async () => {
        try {
            await financeApi.createCOA(form);
            setShowForm(false);
            setForm({ kode: '', nama: '', tipe: 'aset', saldo_normal: 'debit' });
            fetchData();
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Gagal menyimpan');
        }
    };
    return (_jsxs(Card, { title: "CHART OF ACCOUNTS", glow: "cyan", children: [_jsx("div", { className: "flex justify-end mb-4", children: _jsxs(Button, { onClick: () => setShowForm(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), " TAMBAH AKUN"] }) }), _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Kode" }), _jsx("th", { children: "Nama" }), _jsx("th", { children: "Tipe" }), _jsx("th", { children: "Saldo Normal" })] }) }), _jsxs("tbody", { children: [loading && _jsx("tr", { children: _jsx("td", { colSpan: 4, className: "text-center py-4 text-text-dim", children: "MEMUAT..." }) }), coa.map(item => (_jsxs("tr", { children: [_jsx("td", { className: "font-mono", children: item.kode }), _jsx("td", { children: item.nama }), _jsx("td", { children: _jsx("span", { className: `tag ${item.tipe === 'aset' ? 'tag-cyan' : item.tipe === 'beban' ? 'tag-pink' : 'tag-green'}`, children: item.tipe }) }), _jsx("td", { children: item.saldo_normal })] }, item.id)))] })] }), _jsx(Modal, { open: showForm, onClose: () => setShowForm(false), title: "TAMBAH AKUN", onConfirm: handleSave, confirmText: "SIMPAN", children: _jsxs("div", { className: "space-y-3", children: [_jsx(Input, { label: "Kode", value: form.kode, onChange: e => setForm({ ...form, kode: e.target.value }), required: true }), _jsx(Input, { label: "Nama", value: form.nama, onChange: e => setForm({ ...form, nama: e.target.value }), required: true }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold uppercase text-text-dim", children: "Tipe" }), _jsxs("select", { value: form.tipe, onChange: e => setForm({ ...form, tipe: e.target.value }), className: "input-neon w-full mt-1", children: [_jsx("option", { value: "aset", children: "Aset" }), _jsx("option", { value: "liabilitas", children: "Liabilitas" }), _jsx("option", { value: "ekuitas", children: "Ekuitas" }), _jsx("option", { value: "pendapatan", children: "Pendapatan" }), _jsx("option", { value: "beban", children: "Beban" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold uppercase text-text-dim", children: "Saldo Normal" }), _jsxs("select", { value: form.saldo_normal, onChange: e => setForm({ ...form, saldo_normal: e.target.value }), className: "input-neon w-full mt-1", children: [_jsx("option", { value: "debit", children: "Debit" }), _jsx("option", { value: "kredit", children: "Kredit" })] })] })] }) })] }));
};
export default COAList;
