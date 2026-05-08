import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { kategoriApi, satuanApi } from '../../api/master';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Plus, Edit, Trash2 } from 'lucide-react';
const KategoriSatuanList = () => {
    const [kategori, setKategori] = useState([]);
    const [satuan, setSatuan] = useState([]);
    const [loading, setLoading] = useState(false);
    // Kategori state
    const [showKategoriForm, setShowKategoriForm] = useState(false);
    const [editKategoriId, setEditKategoriId] = useState(null);
    const [kategoriNama, setKategoriNama] = useState('');
    const [kategoriDeskripsi, setKategoriDeskripsi] = useState('');
    const [deleteKategoriId, setDeleteKategoriId] = useState(null);
    // Satuan state
    const [showSatuanForm, setShowSatuanForm] = useState(false);
    const [editSatuanId, setEditSatuanId] = useState(null);
    const [satuanNama, setSatuanNama] = useState('');
    const [deleteSatuanId, setDeleteSatuanId] = useState(null);
    const fetchData = async () => {
        setLoading(true);
        try {
            const [kRes, sRes] = await Promise.all([kategoriApi.getAll(), satuanApi.getAll()]);
            setKategori(kRes.data);
            setSatuan(sRes.data);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchData(); }, []);
    // ---------- KATEGORI CRUD ----------
    const handleSaveKategori = async () => {
        if (!kategoriNama)
            return;
        if (editKategoriId) {
            await kategoriApi.update(editKategoriId, { nama: kategoriNama, deskripsi: kategoriDeskripsi });
        }
        else {
            await kategoriApi.create({ nama: kategoriNama, deskripsi: kategoriDeskripsi });
        }
        setShowKategoriForm(false);
        setEditKategoriId(null);
        setKategoriNama('');
        setKategoriDeskripsi('');
        fetchData();
    };
    const handleEditKategori = (item) => {
        setEditKategoriId(item.id);
        setKategoriNama(item.nama);
        setKategoriDeskripsi(item.deskripsi || '');
        setShowKategoriForm(true);
    };
    const handleDeleteKategori = async () => {
        if (!deleteKategoriId)
            return;
        await kategoriApi.delete(deleteKategoriId);
        setDeleteKategoriId(null);
        fetchData();
    };
    // ---------- SATUAN CRUD ----------
    const handleSaveSatuan = async () => {
        if (!satuanNama)
            return;
        if (editSatuanId) {
            await satuanApi.update(editSatuanId, { nama: satuanNama });
        }
        else {
            await satuanApi.create({ nama: satuanNama });
        }
        setShowSatuanForm(false);
        setEditSatuanId(null);
        setSatuanNama('');
        fetchData();
    };
    const handleEditSatuan = (item) => {
        setEditSatuanId(item.id);
        setSatuanNama(item.nama);
        setShowSatuanForm(true);
    };
    const handleDeleteSatuan = async () => {
        if (!deleteSatuanId)
            return;
        await satuanApi.delete(deleteSatuanId);
        setDeleteSatuanId(null);
        fetchData();
    };
    return (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { title: "KATEGORI", glow: "cyan", children: [_jsx("div", { className: "flex justify-end mb-2", children: _jsxs(Button, { onClick: () => { setShowKategoriForm(true); setEditKategoriId(null); setKategoriNama(''); setKategoriDeskripsi(''); }, children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), " TAMBAH"] }) }), _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Nama" }), _jsx("th", { children: "Deskripsi" }), _jsx("th", { children: "Aksi" })] }) }), _jsx("tbody", { children: kategori.map(item => (_jsxs("tr", { children: [_jsx("td", { children: item.nama }), _jsx("td", { className: "text-text-dim", children: item.deskripsi || '-' }), _jsx("td", { children: _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleEditKategori(item), className: "text-neon-cyan", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setDeleteKategoriId(item.id), className: "text-[var(--neon-pink)]", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, item.id))) })] })] }), _jsxs(Card, { title: "SATUAN", glow: "cyan", children: [_jsx("div", { className: "flex justify-end mb-2", children: _jsxs(Button, { onClick: () => { setShowSatuanForm(true); setEditSatuanId(null); setSatuanNama(''); }, children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), " TAMBAH"] }) }), _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Nama" }), _jsx("th", { children: "Aksi" })] }) }), _jsx("tbody", { children: satuan.map(item => (_jsxs("tr", { children: [_jsx("td", { children: item.nama }), _jsx("td", { children: _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleEditSatuan(item), className: "text-neon-cyan", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setDeleteSatuanId(item.id), className: "text-[var(--neon-pink)]", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, item.id))) })] })] }), _jsxs(Modal, { open: showKategoriForm, onClose: () => setShowKategoriForm(false), title: editKategoriId ? 'EDIT KATEGORI' : 'TAMBAH KATEGORI', onConfirm: handleSaveKategori, confirmText: "SIMPAN", children: [_jsx(Input, { label: "Nama", value: kategoriNama, onChange: e => setKategoriNama(e.target.value), className: "mb-2" }), _jsx(Input, { label: "Deskripsi", value: kategoriDeskripsi, onChange: e => setKategoriDeskripsi(e.target.value) })] }), _jsx(Modal, { open: !!deleteKategoriId, onClose: () => setDeleteKategoriId(null), title: "HAPUS KATEGORI", onConfirm: handleDeleteKategori, confirmText: "HAPUS", confirmVariant: "danger", children: "Yakin ingin menghapus kategori ini?" }), _jsx(Modal, { open: showSatuanForm, onClose: () => setShowSatuanForm(false), title: editSatuanId ? 'EDIT SATUAN' : 'TAMBAH SATUAN', onConfirm: handleSaveSatuan, confirmText: "SIMPAN", children: _jsx(Input, { label: "Nama", value: satuanNama, onChange: e => setSatuanNama(e.target.value) }) }), _jsx(Modal, { open: !!deleteSatuanId, onClose: () => setDeleteSatuanId(null), title: "HAPUS SATUAN", onConfirm: handleDeleteSatuan, confirmText: "HAPUS", confirmVariant: "danger", children: "Yakin ingin menghapus satuan ini?" })] }));
};
export default KategoriSatuanList;
