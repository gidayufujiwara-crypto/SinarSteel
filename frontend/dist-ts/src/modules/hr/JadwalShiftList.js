import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { hrApi } from '../../api/hr';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Plus } from 'lucide-react';
const JadwalShiftList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [karyawanList, setKaryawanList] = useState([]);
    const [form, setForm] = useState({ karyawan_id: '', tanggal: '', shift_ke: 'pagi', jam_mulai: '08:00', jam_selesai: '16:00' });
    const [filterKaryawan, setFilterKaryawan] = useState('');
    const fetchJadwal = async () => {
        if (!filterKaryawan)
            return;
        setLoading(true);
        try {
            const start = new Date().toISOString().slice(0, 10);
            const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
            const res = await hrApi.getJadwal(filterKaryawan, start, end);
            setData(res.data);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        hrApi.getKaryawan().then(res => setKaryawanList(res.data));
    }, []);
    useEffect(() => {
        fetchJadwal();
    }, [filterKaryawan]);
    const handleSave = async () => {
        await hrApi.createJadwal(form);
        setShowForm(false);
        fetchJadwal();
    };
    return (_jsxs(Card, { title: "JADWAL SHIFT", glow: "cyan", children: [_jsxs("div", { className: "flex justify-between mb-4", children: [_jsx("div", { className: "flex items-center gap-2", children: _jsxs("select", { value: filterKaryawan, onChange: e => setFilterKaryawan(e.target.value), className: "input-neon w-48", children: [_jsx("option", { value: "", children: "-- Pilih Karyawan --" }), karyawanList.map(k => _jsx("option", { value: k.id, children: k.nama }, k.id))] }) }), _jsxs(Button, { onClick: () => { setShowForm(true); setForm({ karyawan_id: filterKaryawan, tanggal: '', shift_ke: 'pagi', jam_mulai: '08:00', jam_selesai: '16:00' }); }, children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), " TAMBAH"] })] }), _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Tanggal" }), _jsx("th", { children: "Shift" }), _jsx("th", { children: "Jam Mulai" }), _jsx("th", { children: "Jam Selesai" })] }) }), _jsxs("tbody", { children: [loading && _jsx("tr", { children: _jsx("td", { colSpan: 4, className: "text-center py-4 text-text-dim", children: "MEMUAT..." }) }), !loading && data.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 4, className: "text-center py-4 text-text-dim", children: "TIDAK ADA JADWAL" }) }), data.map(item => (_jsxs("tr", { children: [_jsx("td", { children: item.tanggal }), _jsx("td", { children: item.shift_ke }), _jsx("td", { children: item.jam_mulai }), _jsx("td", { children: item.jam_selesai })] }, item.id)))] })] }), _jsx(Modal, { open: showForm, onClose: () => setShowForm(false), title: "TAMBAH JADWAL", onConfirm: handleSave, confirmText: "SIMPAN", children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold tracking-[1px] uppercase text-text-dim", children: "Karyawan" }), _jsxs("select", { value: form.karyawan_id, onChange: e => setForm({ ...form, karyawan_id: e.target.value }), className: "input-neon w-full mt-1", required: true, children: [_jsx("option", { value: "", children: "Pilih" }), karyawanList.map(k => _jsx("option", { value: k.id, children: k.nama }, k.id))] })] }), _jsx(Input, { label: "Tanggal", type: "date", value: form.tanggal, onChange: e => setForm({ ...form, tanggal: e.target.value }) }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold tracking-[1px] uppercase text-text-dim", children: "Shift" }), _jsxs("select", { value: form.shift_ke, onChange: e => setForm({ ...form, shift_ke: e.target.value }), className: "input-neon w-full mt-1", children: [_jsx("option", { value: "pagi", children: "Pagi" }), _jsx("option", { value: "sore", children: "Sore" }), _jsx("option", { value: "malam", children: "Malam" })] })] }), _jsx(Input, { label: "Jam Mulai", type: "time", value: form.jam_mulai, onChange: e => setForm({ ...form, jam_mulai: e.target.value }) }), _jsx(Input, { label: "Jam Selesai", type: "time", value: form.jam_selesai, onChange: e => setForm({ ...form, jam_selesai: e.target.value }) })] }) })] }));
};
export default JadwalShiftList;
