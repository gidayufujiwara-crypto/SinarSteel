import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { hrApi } from '../../api/hr';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
const GajiList = () => {
    const [gaji, setGaji] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bulan, setBulan] = useState(new Date().getMonth() + 1);
    const [tahun, setTahun] = useState(new Date().getFullYear());
    const [showHitung, setShowHitung] = useState(false);
    const [karyawanList, setKaryawanList] = useState([]);
    const [selectedKaryawan, setSelectedKaryawan] = useState('');
    const [jamLembur, setJamLembur] = useState(0);
    const [tarifLembur, setTarifLembur] = useState(0);
    useEffect(() => {
        hrApi.getKaryawan().then(res => setKaryawanList(res.data));
    }, []);
    const fetchGaji = async () => {
        setLoading(true);
        try {
            const res = await hrApi.getGajiList(bulan, tahun);
            setGaji(res.data);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchGaji(); }, [bulan, tahun]);
    const handleHitungGaji = async () => {
        if (!selectedKaryawan)
            return;
        try {
            await hrApi.hitungGaji({
                karyawan_id: selectedKaryawan,
                bulan,
                tahun,
                jam_lembur: jamLembur,
                tarif_lembur: tarifLembur,
            });
            setShowHitung(false);
            setSelectedKaryawan('');
            setJamLembur(0);
            setTarifLembur(0);
            fetchGaji();
        }
        catch (err) {
            console.error(err);
        }
    };
    return (_jsxs(Card, { title: "PENGGAJIAN", glow: "cyan", children: [_jsxs("div", { className: "flex justify-between mb-4", children: [_jsxs("div", { className: "flex gap-4 items-center", children: [_jsx("select", { value: bulan, onChange: e => setBulan(parseInt(e.target.value)), className: "input-neon w-24", children: Array.from({ length: 12 }, (_, i) => i + 1).map(m => _jsx("option", { value: m, children: m }, m)) }), _jsx(Input, { type: "number", value: tahun, onChange: e => setTahun(parseInt(e.target.value)), className: "w-24" })] }), _jsx(Button, { onClick: () => setShowHitung(true), children: "HITUNG GAJI" })] }), _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Karyawan" }), _jsx("th", { children: "Gaji Pokok" }), _jsx("th", { children: "Jam Lembur" }), _jsx("th", { children: "Tarif Lembur" }), _jsx("th", { children: "Total Lembur" }), _jsx("th", { children: "Potongan" }), _jsx("th", { children: "Total Gaji" })] }) }), _jsxs("tbody", { children: [loading && _jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center py-4 text-text-dim", children: "MEMUAT..." }) }), !loading && gaji.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center py-4 text-text-dim", children: "BELUM ADA PENGGAJIAN" }) }), gaji.map(item => (_jsxs("tr", { children: [_jsx("td", { className: "text-text-dim text-xs", children: item.karyawan_id?.substring(0, 8) }), _jsxs("td", { children: ["Rp ", Number(item.gaji_pokok).toLocaleString()] }), _jsxs("td", { children: [item.jam_lembur, " jam"] }), _jsxs("td", { children: ["Rp ", Number(item.tarif_lembur).toLocaleString()] }), _jsxs("td", { children: ["Rp ", Number(item.total_lembur).toLocaleString()] }), _jsxs("td", { children: ["Rp ", Number(item.potongan).toLocaleString()] }), _jsxs("td", { className: "text-neon-green font-bold", children: ["Rp ", Number(item.total_gaji).toLocaleString()] })] }, item.id)))] })] }), _jsx(Modal, { open: showHitung, onClose: () => setShowHitung(false), title: "HITUNG GAJI", onConfirm: handleHitungGaji, confirmText: "PROSES", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold tracking-[1px] uppercase text-text-dim", children: "Karyawan" }), _jsxs("select", { value: selectedKaryawan, onChange: e => setSelectedKaryawan(e.target.value), className: "input-neon w-full mt-1", children: [_jsx("option", { value: "", children: "-- Pilih --" }), karyawanList.map(k => _jsx("option", { value: k.id, children: k.nama }, k.id))] })] }), _jsx(Input, { label: "Jam Lembur", type: "number", value: jamLembur, onChange: e => setJamLembur(parseInt(e.target.value) || 0) }), _jsx(Input, { label: "Tarif Lembur (Rp)", type: "number", value: tarifLembur, onChange: e => setTarifLembur(parseFloat(e.target.value) || 0) })] }) })] }));
};
export default GajiList;
