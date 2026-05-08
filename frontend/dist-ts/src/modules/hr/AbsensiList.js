import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { hrApi } from '../../api/hr';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
const AbsensiList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [karyawanList, setKaryawanList] = useState([]);
    const [selectedKaryawan, setSelectedKaryawan] = useState('');
    const [bulan, setBulan] = useState(new Date().getMonth() + 1);
    const [tahun, setTahun] = useState(new Date().getFullYear());
    useEffect(() => {
        hrApi.getKaryawan().then(res => setKaryawanList(res.data));
    }, []);
    const fetchAbsensi = async () => {
        if (!selectedKaryawan)
            return;
        setLoading(true);
        try {
            const res = await hrApi.getAbsensi(selectedKaryawan, bulan, tahun);
            setData(res.data);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchAbsensi();
    }, [selectedKaryawan, bulan, tahun]);
    return (_jsxs(Card, { title: "DATA ABSENSI", glow: "cyan", children: [_jsxs("div", { className: "flex gap-4 mb-4 items-center", children: [_jsxs("select", { value: selectedKaryawan, onChange: e => setSelectedKaryawan(e.target.value), className: "input-neon w-48", children: [_jsx("option", { value: "", children: "-- Pilih Karyawan --" }), karyawanList.map(k => _jsx("option", { value: k.id, children: k.nama }, k.id))] }), _jsx("select", { value: bulan, onChange: e => setBulan(parseInt(e.target.value)), className: "input-neon w-24", children: Array.from({ length: 12 }, (_, i) => i + 1).map(m => _jsx("option", { value: m, children: m }, m)) }), _jsx(Input, { type: "number", value: tahun, onChange: e => setTahun(parseInt(e.target.value)), className: "w-24" })] }), _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Tanggal" }), _jsx("th", { children: "Jam Masuk" }), _jsx("th", { children: "Jam Pulang" }), _jsx("th", { children: "Status" })] }) }), _jsxs("tbody", { children: [loading && _jsx("tr", { children: _jsx("td", { colSpan: 4, className: "text-center py-4 text-text-dim", children: "MEMUAT..." }) }), !loading && data.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 4, className: "text-center py-4 text-text-dim", children: "TIDAK ADA DATA" }) }), data.map(item => (_jsxs("tr", { children: [_jsx("td", { children: item.tanggal }), _jsx("td", { children: item.jam_masuk || '-' }), _jsx("td", { children: item.jam_pulang || '-' }), _jsx("td", { className: `tag ${item.status_hadir === 'hadir' ? 'tag-green' : item.status_hadir === 'terlambat' ? 'tag-orange' : 'tag-pink'}`, children: item.status_hadir })] }, item.id)))] })] })] }));
};
export default AbsensiList;
