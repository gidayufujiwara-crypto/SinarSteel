import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { financeApi } from '../../api/finance';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
const LedgerPage = () => {
    const [coa, setCOA] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [ledger, setLedger] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    useEffect(() => {
        financeApi.getCOA().then(res => setCOA(res.data));
    }, []);
    const fetchLedger = async () => {
        if (!selectedAccount)
            return;
        setLoading(true);
        try {
            const res = await financeApi.getLedger(selectedAccount, {
                start_date: startDate || undefined,
                end_date: endDate || undefined,
            });
            setLedger(res.data);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(Card, { title: "BUKU BESAR", glow: "cyan", children: [_jsxs("div", { className: "flex gap-4 mb-4 items-end", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold uppercase text-text-dim", children: "Akun" }), _jsxs("select", { value: selectedAccount, onChange: e => setSelectedAccount(e.target.value), className: "input-neon w-48", children: [_jsx("option", { value: "", children: "-- Pilih Akun --" }), coa.map(a => _jsxs("option", { value: a.id, children: [a.kode, " ", a.nama] }, a.id))] })] }), _jsx(Input, { label: "Dari", type: "date", value: startDate, onChange: e => setStartDate(e.target.value) }), _jsx(Input, { label: "Sampai", type: "date", value: endDate, onChange: e => setEndDate(e.target.value) }), _jsx(Button, { onClick: fetchLedger, children: "TAMPILKAN" })] }), _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Tanggal" }), _jsx("th", { children: "No Jurnal" }), _jsx("th", { children: "Keterangan" }), _jsx("th", { children: "Debit" }), _jsx("th", { children: "Kredit" }), _jsx("th", { children: "Saldo" })] }) }), _jsxs("tbody", { children: [loading && _jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center py-4 text-text-dim", children: "MEMUAT..." }) }), !loading && ledger.length === 0 && selectedAccount && _jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center py-4 text-text-dim", children: "TIDAK ADA MUTASI" }) }), ledger.map((line, idx) => (_jsxs("tr", { children: [_jsx("td", { children: line.tanggal }), _jsx("td", { className: "font-mono text-xs", children: line.no_jurnal }), _jsx("td", { children: line.keterangan || '-' }), _jsxs("td", { children: ["Rp ", Number(line.debit).toLocaleString()] }), _jsxs("td", { children: ["Rp ", Number(line.kredit).toLocaleString()] }), _jsxs("td", { className: "font-bold", children: ["Rp ", Number(line.saldo).toLocaleString()] })] }, idx)))] })] })] }));
};
export default LedgerPage;
