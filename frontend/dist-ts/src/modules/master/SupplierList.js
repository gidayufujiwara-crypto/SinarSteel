import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supplierApi } from '../../api/master';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
const SupplierList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ kode: '', nama: '', alamat: '', telepon: '', email: '' });
    const [deleteId, setDeleteId] = useState(null);
    const [search, setSearch] = useState('');
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await supplierApi.getAll(search || undefined);
            setData(res.data);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchData(); }, [search]);
    const handleSave = async () => {
        try {
            if (editId)
                await supplierApi.update(editId, form);
            else
                await supplierApi.create(form);
            setShowForm(false);
            setForm({ kode: '', nama: '', alamat: '', telepon: '', email: '' });
            setEditId(null);
            fetchData();
        }
        catch (err) {
            console.error(err);
        }
    };
    const handleEdit = (item) => {
        setEditId(item.id);
        setForm({ kode: item.kode, nama: item.nama, alamat: item.alamat || '', telepon: item.telepon || '', email: item.email || '' });
        setShowForm(true);
    };
    const handleDelete = async () => {
        if (!deleteId)
            return;
        await supplierApi.delete(deleteId);
        setDeleteId(null);
        fetchData();
    };
    return (_jsxs(Card, { title: "DAFTAR SUPPLIER", glow: "cyan", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Search, { className: "w-4 h-4 text-text-dim" }), _jsx(Input, { placeholder: "Cari kode/nama...", value: search, onChange: e => setSearch(e.target.value), className: "w-64" })] }), _jsxs(Button, { onClick: () => { setShowForm(true); setEditId(null); setForm({ kode: '', nama: '', alamat: '', telepon: '', email: '' }); }, children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), " TAMBAH"] })] }), _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Kode" }), _jsx("th", { children: "Nama" }), _jsx("th", { children: "Telepon" }), _jsx("th", { children: "Aksi" })] }) }), _jsxs("tbody", { children: [loading && _jsx("tr", { children: _jsx("td", { colSpan: 4, className: "text-center py-4 text-text-dim", children: "MEMUAT..." }) }), !loading && data.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 4, className: "text-center py-4 text-text-dim", children: "TIDAK ADA DATA" }) }), data.map(item => (_jsxs("tr", { children: [_jsx("td", { className: "font-mono", children: item.kode }), _jsx("td", { children: item.nama }), _jsx("td", { children: item.telepon || '-' }), _jsx("td", { children: _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleEdit(item), className: "text-neon-cyan hover:text-neon-cyan/80", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setDeleteId(item.id), className: "text-[var(--neon-pink)] hover:text-[var(--neon-pink)]/80", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, item.id)))] })] }), showForm && (_jsx(Modal, { open: showForm, onClose: () => setShowForm(false), title: editId ? 'EDIT SUPPLIER' : 'TAMBAH SUPPLIER', onConfirm: handleSave, confirmText: "SIMPAN", children: _jsxs("div", { className: "space-y-2", children: [_jsx(Input, { label: "Kode", value: form.kode, onChange: e => setForm({ ...form, kode: e.target.value }) }), _jsx(Input, { label: "Nama", value: form.nama, onChange: e => setForm({ ...form, nama: e.target.value }) }), _jsx(Input, { label: "Alamat", value: form.alamat, onChange: e => setForm({ ...form, alamat: e.target.value }) }), _jsx(Input, { label: "Telepon", value: form.telepon, onChange: e => setForm({ ...form, telepon: e.target.value }) }), _jsx(Input, { label: "Email", value: form.email, onChange: e => setForm({ ...form, email: e.target.value }) })] }) })), _jsx(Modal, { open: !!deleteId, onClose: () => setDeleteId(null), title: "HAPUS SUPPLIER", onConfirm: handleDelete, confirmText: "HAPUS", confirmVariant: "danger", children: "Yakin ingin menghapus supplier ini?" })] }));
};
export default SupplierList;
