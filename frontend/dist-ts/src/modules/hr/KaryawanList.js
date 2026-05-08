import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { hrApi } from '../../api/hr';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Plus, Edit, Trash2 } from 'lucide-react';
const KaryawanList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({
        nik: '', nama: '', alamat: '', telepon: '', tanggal_masuk: '', jabatan: '',
        gaji_pokok: 0, no_rek: '', bank: '', status_aktif: true,
        gaji_per_hari: 0, tipe_gaji: 'bulanan',
    });
    const [deleteId, setDeleteId] = useState(null);
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await hrApi.getKaryawan();
            setData(res.data);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchData(); }, []);
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setForm(prev => ({ ...prev, [name]: e.target.checked }));
        }
        else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };
    const handleSave = async () => {
        if (editId)
            await hrApi.updateKaryawan(editId, form);
        else
            await hrApi.createKaryawan(form);
        setShowForm(false);
        setEditId(null);
        setForm({ nik: '', nama: '', alamat: '', telepon: '', tanggal_masuk: '', jabatan: '', gaji_pokok: 0, no_rek: '', bank: '', status_aktif: true, gaji_per_hari: 0, tipe_gaji: 'bulanan' });
        fetchData();
    };
    const handleEdit = (item) => {
        setEditId(item.id);
        setForm({
            nik: item.nik, nama: item.nama, alamat: item.alamat || '', telepon: item.telepon || '',
            tanggal_masuk: item.tanggal_masuk || '', jabatan: item.jabatan || '',
            gaji_pokok: item.gaji_pokok || 0, no_rek: item.no_rek || '', bank: item.bank || '',
            status_aktif: item.status_aktif !== false,
            gaji_per_hari: item.gaji_per_hari || 0,
            tipe_gaji: item.tipe_gaji || 'bulanan',
        });
        setShowForm(true);
    };
    const handleDelete = async () => {
        if (!deleteId)
            return;
        await hrApi.deleteKaryawan(deleteId);
        setDeleteId(null);
        fetchData();
    };
    return (_jsxs(Card, { title: "DAFTAR KARYAWAN", glow: "cyan", children: [_jsx("div", { className: "flex justify-end mb-4", children: _jsxs(Button, { onClick: () => {
                        setShowForm(true);
                        setEditId(null);
                        setForm({ nik: '', nama: '', alamat: '', telepon: '', tanggal_masuk: '', jabatan: '', gaji_pokok: 0, no_rek: '', bank: '', status_aktif: true, gaji_per_hari: 0, tipe_gaji: 'bulanan' });
                    }, children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), " TAMBAH"] }) }), _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "NIK" }), _jsx("th", { children: "Nama" }), _jsx("th", { children: "Jabatan" }), _jsx("th", { children: "Tipe Gaji" }), _jsx("th", { children: "Gaji Pokok" }), _jsx("th", { children: "Gaji/Hari" }), _jsx("th", { children: "Aksi" })] }) }), _jsxs("tbody", { children: [loading && _jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center py-4 text-text-dim", children: "MEMUAT..." }) }), !loading && data.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center py-4 text-text-dim", children: "TIDAK ADA DATA" }) }), data.map(item => (_jsxs("tr", { children: [_jsx("td", { className: "font-mono", children: item.nik }), _jsx("td", { children: item.nama }), _jsx("td", { children: item.jabatan || '-' }), _jsx("td", { children: _jsx("span", { className: "tag tag-cyan", children: item.tipe_gaji || 'bulanan' }) }), _jsxs("td", { children: ["Rp ", Number(item.gaji_pokok).toLocaleString()] }), _jsxs("td", { children: ["Rp ", Number(item.gaji_per_hari || 0).toLocaleString()] }), _jsx("td", { children: _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleEdit(item), className: "text-neon-cyan hover:text-neon-cyan/80", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setDeleteId(item.id), className: "text-[var(--neon-pink)] hover:text-[var(--neon-pink)]/80", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, item.id)))] })] }), _jsxs(Modal, { open: showForm, onClose: () => setShowForm(false), title: editId ? 'EDIT KARYAWAN' : 'TAMBAH KARYAWAN', onConfirm: handleSave, confirmText: "SIMPAN", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(Input, { label: "NIK", name: "nik", value: form.nik, onChange: handleChange, required: true }), _jsx(Input, { label: "Nama", name: "nama", value: form.nama, onChange: handleChange, required: true }), _jsx(Input, { label: "Telepon", name: "telepon", value: form.telepon, onChange: handleChange }), _jsx(Input, { label: "Jabatan", name: "jabatan", value: form.jabatan, onChange: handleChange }), _jsx(Input, { label: "Gaji Pokok", name: "gaji_pokok", type: "number", value: form.gaji_pokok, onChange: handleChange }), _jsx(Input, { label: "Gaji Per Hari", name: "gaji_per_hari", type: "number", value: form.gaji_per_hari, onChange: handleChange }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold uppercase text-text-dim", children: "Tipe Gaji" }), _jsxs("select", { name: "tipe_gaji", value: form.tipe_gaji, onChange: handleChange, className: "input-neon w-full mt-1", children: [_jsx("option", { value: "harian", children: "Harian" }), _jsx("option", { value: "mingguan", children: "Mingguan" }), _jsx("option", { value: "bulanan", children: "Bulanan" })] })] }), _jsx(Input, { label: "Tgl Masuk", name: "tanggal_masuk", type: "date", value: form.tanggal_masuk, onChange: handleChange })] }), _jsx(Input, { label: "Alamat", name: "alamat", value: form.alamat, onChange: handleChange, className: "mt-3" }), _jsxs("div", { className: "grid grid-cols-2 gap-3 mt-3", children: [_jsx(Input, { label: "No Rekening", name: "no_rek", value: form.no_rek, onChange: handleChange }), _jsx(Input, { label: "Bank", name: "bank", value: form.bank, onChange: handleChange })] }), _jsxs("label", { className: "flex items-center gap-2 text-sm font-semibold text-text-dim cursor-pointer mt-3", children: [_jsx("input", { type: "checkbox", name: "status_aktif", checked: form.status_aktif, onChange: handleChange, className: "accent-[var(--neon-cyan)]" }), "AKTIF"] })] }), _jsx(Modal, { open: !!deleteId, onClose: () => setDeleteId(null), title: "HAPUS KARYAWAN", onConfirm: handleDelete, confirmText: "HAPUS", confirmVariant: "danger", children: "Yakin ingin menghapus karyawan ini?" })] }));
};
export default KaryawanList;
