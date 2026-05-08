import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { wmsApi } from '../../api/wms';
import { produkApi } from '../../api/master';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Plus, Check, X } from 'lucide-react';
const StockOpnameList = () => {
    const [opname, setOpname] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [products, setProducts] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [keterangan, setKeterangan] = useState('');
    const [error, setError] = useState('');
    const fetchOpname = async () => {
        setLoading(true);
        try {
            const res = await wmsApi.getOpnameList();
            setOpname(res.data);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchOpname();
        produkApi.getAll().then(res => setProducts(res.data.filter((p) => p.is_active)));
    }, []);
    const toggleProduct = (produkId, qtyFisik) => {
        setSelectedItems(prev => {
            const exist = prev.find(it => it.produk_id === produkId);
            if (exist) {
                return prev.map(it => it.produk_id === produkId ? { ...it, qty_fisik: qtyFisik } : it);
            }
            else {
                return [...prev, { produk_id: produkId, qty_fisik: qtyFisik }];
            }
        });
    };
    const handleSubmit = async () => {
        if (selectedItems.length === 0) {
            setError('Pilih setidaknya satu produk');
            return;
        }
        try {
            await wmsApi.createOpname({ items: selectedItems, keterangan });
            setShowForm(false);
            setSelectedItems([]);
            setKeterangan('');
            fetchOpname();
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Gagal menyimpan');
        }
    };
    return (_jsxs(Card, { title: "STOCK OPNAME", glow: "cyan", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("div", {}), _jsxs(Button, { onClick: () => setShowForm(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), " MULAI OPNAME"] })] }), _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Tanggal" }), _jsx("th", { children: "Produk" }), _jsx("th", { children: "Sistem" }), _jsx("th", { children: "Fisik" }), _jsx("th", { children: "Selisih" }), _jsx("th", { children: "Keterangan" })] }) }), _jsxs("tbody", { children: [loading && _jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center py-4 text-text-dim", children: "MEMUAT..." }) }), !loading && opname.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center py-4 text-text-dim", children: "BELUM ADA DATA" }) }), opname.map((so) => (_jsxs("tr", { children: [_jsx("td", { children: new Date(so.tanggal).toLocaleDateString('id-ID') }), _jsx("td", { className: "text-text-dim text-xs font-mono", children: so.produk_id?.substring(0, 8) || '-' }), _jsx("td", { children: so.qty_sistem }), _jsx("td", { children: so.qty_fisik }), _jsx("td", { className: so.selisih !== 0 ? 'text-[var(--neon-orange)] font-bold' : '', children: so.selisih }), _jsx("td", { className: "text-text-dim", children: so.keterangan || '-' })] }, so.id)))] })] }), _jsxs(Modal, { open: showForm, onClose: () => setShowForm(false), title: "STOCK OPNAME BARU", onConfirm: handleSubmit, confirmText: "SIMPAN", children: [error && _jsx("p", { className: "text-[var(--neon-pink)] mb-2 text-sm font-semibold", children: error }), _jsx(Input, { label: "Keterangan", value: keterangan, onChange: e => setKeterangan(e.target.value), className: "mb-4" }), _jsx("div", { className: "max-h-60 overflow-y-auto border border-[rgba(0,245,255,0.15)] rounded p-2", children: products.map(prod => {
                            const selected = selectedItems.find(it => it.produk_id === prod.id);
                            return (_jsxs("div", { className: "flex items-center justify-between py-1 text-sm", children: [_jsxs("span", { className: "font-semibold text-text-primary", children: [prod.nama, " (Stok: ", prod.stok, ")"] }), _jsx("div", { className: "flex items-center gap-2", children: selected ? (_jsxs(_Fragment, { children: [_jsx(Input, { type: "number", value: selected.qty_fisik, onChange: e => toggleProduct(prod.id, parseInt(e.target.value) || 0), className: "w-16 text-center py-0 px-1" }), _jsx("button", { onClick: () => setSelectedItems(prev => prev.filter(it => it.produk_id !== prod.id)), className: "text-[var(--neon-pink)]", children: _jsx(X, { className: "w-3 h-3" }) })] })) : (_jsxs(Button, { variant: "secondary", className: "text-xs py-1 px-2", onClick: () => toggleProduct(prod.id, prod.stok), children: [_jsx(Check, { className: "w-3 h-3 mr-1" }), " PILIH"] })) })] }, prod.id));
                        }) })] })] }));
};
export default StockOpnameList;
