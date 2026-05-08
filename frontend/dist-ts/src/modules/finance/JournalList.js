import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { financeApi } from '../../api/finance';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Plus, Eye } from 'lucide-react';
const JournalList = () => {
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [coa, setCOA] = useState([]);
    const [detail, setDetail] = useState(null);
    // Form state
    const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
    const [keterangan, setKeterangan] = useState('');
    const [tipe, setTipe] = useState('memorial');
    const [items, setItems] = useState([{ account_id: '', deskripsi: '', debit: 0, kredit: 0 }]);
    const fetchJournals = async () => {
        setLoading(true);
        try {
            const res = await financeApi.getJournals();
            setJournals(res.data);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchCOA = async () => {
        try {
            const res = await financeApi.getCOA();
            setCOA(res.data);
        }
        catch { }
    };
    useEffect(() => {
        fetchJournals();
        fetchCOA();
    }, []);
    const addItem = () => setItems([...items, { account_id: '', deskripsi: '', debit: 0, kredit: 0 }]);
    const removeItem = (index) => setItems(items.filter((_, i) => i !== index));
    const updateItem = (index, field, value) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };
        setItems(updated);
    };
    const totalDebit = items.reduce((sum, it) => sum + (Number(it.debit) || 0), 0);
    const totalKredit = items.reduce((sum, it) => sum + (Number(it.kredit) || 0), 0);
    const handleSave = async () => {
        if (totalDebit !== totalKredit) {
            alert('Total Debit harus sama dengan Total Kredit');
            return;
        }
        if (items.length === 0) {
            alert('Minimal satu item jurnal');
            return;
        }
        try {
            await financeApi.createJournal({
                tanggal,
                keterangan,
                tipe,
                items: items.map(it => ({
                    account_id: it.account_id,
                    deskripsi: it.deskripsi || '',
                    debit: Number(it.debit),
                    kredit: Number(it.kredit),
                })),
            });
            setShowForm(false);
            setItems([{ account_id: '', deskripsi: '', debit: 0, kredit: 0 }]);
            fetchJournals();
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Gagal menyimpan jurnal');
        }
    };
    return (_jsxs(Card, { title: "JURNAL UMUM", glow: "cyan", children: [_jsx("div", { className: "flex justify-end mb-4", children: _jsxs(Button, { onClick: () => setShowForm(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), " BUAT JURNAL"] }) }), _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "No Jurnal" }), _jsx("th", { children: "Tanggal" }), _jsx("th", { children: "Tipe" }), _jsx("th", { children: "Keterangan" }), _jsx("th", { children: "Aksi" })] }) }), _jsxs("tbody", { children: [loading && _jsx("tr", { children: _jsx("td", { colSpan: 5, className: "text-center py-4 text-text-dim", children: "MEMUAT..." }) }), !loading && journals.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 5, className: "text-center py-4 text-text-dim", children: "BELUM ADA JURNAL" }) }), journals.map(j => (_jsxs("tr", { children: [_jsx("td", { className: "font-mono text-neon-cyan", children: j.no_jurnal }), _jsx("td", { children: j.tanggal }), _jsx("td", { children: _jsx("span", { className: "tag tag-cyan", children: j.tipe }) }), _jsx("td", { children: j.keterangan || '-' }), _jsx("td", { children: _jsx(Button, { variant: "secondary", onClick: () => setDetail(j), children: _jsx(Eye, { className: "w-3 h-3" }) }) })] }, j.id)))] })] }), _jsx(Modal, { open: showForm, onClose: () => setShowForm(false), title: "BUAT JURNAL BARU", onConfirm: handleSave, confirmText: "SIMPAN", children: _jsxs("div", { className: "space-y-3 max-h-[70vh] overflow-y-auto", children: [_jsx(Input, { label: "Tanggal", type: "date", value: tanggal, onChange: e => setTanggal(e.target.value) }), _jsx(Input, { label: "Keterangan", value: keterangan, onChange: e => setKeterangan(e.target.value) }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold uppercase text-text-dim", children: "Tipe" }), _jsxs("select", { value: tipe, onChange: e => setTipe(e.target.value), className: "input-neon w-full mt-1", children: [_jsx("option", { value: "penjualan", children: "Penjualan" }), _jsx("option", { value: "pembelian", children: "Pembelian" }), _jsx("option", { value: "kas", children: "Kas" }), _jsx("option", { value: "memorial", children: "Memorial" })] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("p", { className: "text-xs font-bold uppercase", children: "Item Jurnal" }), _jsxs(Button, { variant: "secondary", onClick: addItem, children: [_jsx(Plus, { className: "w-3 h-3 mr-1" }), " Tambah"] })] }), items.map((item, idx) => (_jsxs("div", { className: "grid grid-cols-12 gap-2 items-center border-b border-[rgba(0,245,255,0.1)] pb-2", children: [_jsx("div", { className: "col-span-4", children: _jsxs("select", { value: item.account_id, onChange: e => updateItem(idx, 'account_id', e.target.value), className: "input-neon w-full py-1 text-xs", children: [_jsx("option", { value: "", children: "Pilih Akun" }), coa.map(a => _jsxs("option", { value: a.id, children: [a.kode, " ", a.nama] }, a.id))] }) }), _jsx("div", { className: "col-span-4", children: _jsx(Input, { placeholder: "Deskripsi", value: item.deskripsi, onChange: e => updateItem(idx, 'deskripsi', e.target.value), className: "py-1 text-xs" }) }), _jsx("div", { className: "col-span-2", children: _jsx(Input, { type: "number", placeholder: "Debit", value: item.debit, onChange: e => updateItem(idx, 'debit', e.target.value), className: "py-1 text-xs" }) }), _jsx("div", { className: "col-span-2", children: _jsx(Input, { type: "number", placeholder: "Kredit", value: item.kredit, onChange: e => updateItem(idx, 'kredit', e.target.value), className: "py-1 text-xs" }) }), _jsx("button", { onClick: () => removeItem(idx), className: "text-[var(--neon-pink)] text-xs", children: "\u2715" })] }, idx))), _jsxs("div", { className: "flex justify-between text-xs font-bold", children: [_jsxs("span", { children: ["Debit: Rp ", totalDebit.toLocaleString()] }), _jsxs("span", { children: ["Kredit: Rp ", totalKredit.toLocaleString()] })] })] }) }), _jsx(Modal, { open: !!detail, onClose: () => setDetail(null), title: `DETAIL ${detail?.no_jurnal || ''}`, children: detail && (_jsxs("div", { className: "text-sm space-y-2 max-h-[60vh] overflow-y-auto", children: [_jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("div", { className: "text-text-dim", children: "Tanggal" }), _jsx("div", { children: detail.tanggal }), _jsx("div", { className: "text-text-dim", children: "Tipe" }), _jsx("div", { className: "font-bold", children: detail.tipe }), _jsx("div", { className: "text-text-dim", children: "Keterangan" }), _jsx("div", { children: detail.keterangan || '-' })] }), _jsx("hr", { className: "border-[rgba(0,245,255,0.15)]" }), _jsxs("table", { className: "table-neon w-full text-xs", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Akun" }), _jsx("th", { children: "Deskripsi" }), _jsx("th", { children: "Debit" }), _jsx("th", { children: "Kredit" })] }) }), _jsx("tbody", { children: detail.items?.map((it) => (_jsxs("tr", { children: [_jsx("td", { children: it.account_id?.substring(0, 8) }), _jsx("td", { children: it.deskripsi || '-' }), _jsxs("td", { children: ["Rp ", Number(it.debit).toLocaleString()] }), _jsxs("td", { children: ["Rp ", Number(it.kredit).toLocaleString()] })] }, it.id))) })] })] })) })] }));
};
export default JournalList;
