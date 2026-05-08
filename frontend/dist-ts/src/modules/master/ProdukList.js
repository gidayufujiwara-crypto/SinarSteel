import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { produkApi } from '../../api/master';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
const ProdukList = () => {
    const [produk, setProduk] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await produkApi.getAll(search || undefined);
            setProduk(res.data);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [search]);
    const handleDelete = async () => {
        if (!deleteId)
            return;
        try {
            await produkApi.delete(deleteId);
            setDeleteId(null);
            fetchData();
        }
        catch (err) {
            console.error(err);
        }
    };
    return (_jsxs(Card, { title: "DAFTAR PRODUK", glow: "cyan", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Search, { className: "w-4 h-4 text-text-dim" }), _jsx(Input, { placeholder: "Cari nama / SKU / barcode...", value: search, onChange: (e) => setSearch(e.target.value), className: "w-64" })] }), _jsx(Link, { to: "/master/produk/tambah", children: _jsxs(Button, { children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), " TAMBAH"] }) })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "SKU" }), _jsx("th", { children: "Nama" }), _jsx("th", { children: "Harga Jual" }), _jsx("th", { children: "Stok" }), _jsx("th", { children: "Aksi" })] }) }), _jsxs("tbody", { children: [loading && (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "text-center py-4 text-text-dim", children: "MEMUAT..." }) })), !loading && produk.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "text-center py-4 text-text-dim", children: "TIDAK ADA DATA" }) })), produk.map((item) => (_jsxs("tr", { children: [_jsx("td", { className: "font-mono", children: item.sku }), _jsx("td", { children: item.nama }), _jsxs("td", { children: ["Rp ", Number(item.harga_jual).toLocaleString()] }), _jsx("td", { className: item.stok <= item.stok_minimum ? 'text-[var(--neon-orange)] font-bold' : '', children: item.stok }), _jsx("td", { children: _jsxs("div", { className: "flex gap-2", children: [_jsx(Link, { to: `/master/produk/edit/${item.id}`, className: "text-neon-cyan hover:text-neon-cyan/80", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setDeleteId(item.id), className: "text-[var(--neon-pink)] hover:text-[var(--neon-pink)]/80", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, item.id)))] })] }) }), _jsx(Modal, { open: !!deleteId, onClose: () => setDeleteId(null), title: "HAPUS PRODUK", onConfirm: handleDelete, confirmText: "HAPUS", confirmVariant: "danger", children: "Apakah Anda yakin ingin menghapus produk ini?" })] }));
};
export default ProdukList;
