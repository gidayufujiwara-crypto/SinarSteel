import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { wmsApi } from '../../api/wms';
import { produkApi, supplierApi } from '../../api/master';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
const PurchaseOrderForm = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [items, setItems] = useState([]);
    const [catatan, setCatatan] = useState('');
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            const [supRes, prodRes] = await Promise.all([
                supplierApi.getAll(),
                produkApi.getAll(),
            ]);
            setSuppliers(supRes.data);
            setProducts(prodRes.data.filter((p) => p.is_active));
        };
        fetchData();
    }, []);
    const addItem = () => {
        setItems([...items, { produk_id: '', qty_order: 1, harga_satuan: 0 }]);
    };
    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };
    const updateItem = (index, field, value) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };
        setItems(updated);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSupplier) {
            alert('Pilih supplier');
            return;
        }
        if (items.length === 0) {
            alert('Tambah setidaknya satu item');
            return;
        }
        const payload = {
            supplier_id: selectedSupplier,
            items: items.map(it => ({
                produk_id: it.produk_id,
                qty_order: it.qty_order,
                harga_satuan: it.harga_satuan,
            })),
            catatan,
        };
        setLoading(true);
        try {
            await wmsApi.createPO(payload);
            navigate('/wms/po');
        }
        catch (err) {
            console.error(err);
            alert(err.response?.data?.detail || 'Gagal membuat PO');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(Card, { title: "BUAT PURCHASE ORDER", glow: "cyan", children: [_jsxs("button", { onClick: () => navigate('/wms/po'), className: "flex items-center gap-1 text-text-dim hover:text-neon-cyan mb-4", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), " KEMBALI"] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 max-w-2xl", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold tracking-[1px] uppercase text-text-dim", children: "Supplier" }), _jsxs("select", { value: selectedSupplier, onChange: e => setSelectedSupplier(e.target.value), className: "input-neon w-full mt-1", required: true, children: [_jsx("option", { value: "", children: "-- Pilih Supplier --" }), suppliers.map(s => _jsx("option", { value: s.id, children: s.nama }, s.id))] })] }), _jsxs("div", { className: "border-t border-[rgba(0,245,255,0.15)] pt-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("h3", { className: "text-sm font-bold text-text-primary uppercase tracking-wider", children: "Item" }), _jsxs(Button, { type: "button", variant: "secondary", onClick: addItem, children: [_jsx(Plus, { className: "w-3 h-3 mr-1" }), " TAMBAH ITEM"] })] }), items.map((item, index) => (_jsxs("div", { className: "flex gap-2 items-end mb-2", children: [_jsxs("div", { className: "flex-1", children: [_jsx("label", { className: "text-xs font-semibold tracking-[1px] uppercase text-text-dim", children: "Produk" }), _jsxs("select", { value: item.produk_id, onChange: e => updateItem(index, 'produk_id', e.target.value), className: "input-neon w-full py-1 mt-1", required: true, children: [_jsx("option", { value: "", children: "Pilih" }), products.map(p => _jsxs("option", { value: p.id, children: [p.nama, " (Rp ", p.harga_jual, ")"] }, p.id))] })] }), _jsxs("div", { className: "w-20", children: [_jsx("label", { className: "text-xs font-semibold tracking-[1px] uppercase text-text-dim", children: "Qty" }), _jsx(Input, { type: "number", min: 1, value: item.qty_order, onChange: e => updateItem(index, 'qty_order', parseInt(e.target.value)), required: true })] }), _jsxs("div", { className: "w-28", children: [_jsx("label", { className: "text-xs font-semibold tracking-[1px] uppercase text-text-dim", children: "Harga" }), _jsx(Input, { type: "number", step: "0.01", value: item.harga_satuan, onChange: e => updateItem(index, 'harga_satuan', parseFloat(e.target.value)), required: true })] }), _jsx("button", { type: "button", onClick: () => removeItem(index), className: "text-[var(--neon-pink)] hover:text-red-400 mb-1", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }, index)))] }), _jsx(Input, { label: "Catatan", value: catatan, onChange: e => setCatatan(e.target.value) }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx(Button, { type: "submit", isLoading: loading, children: "SIMPAN PO" }), _jsx(Button, { variant: "secondary", type: "button", onClick: () => navigate('/wms/po'), children: "BATAL" })] })] })] }));
};
export default PurchaseOrderForm;
