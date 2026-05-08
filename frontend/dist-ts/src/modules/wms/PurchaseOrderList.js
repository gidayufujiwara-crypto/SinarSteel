import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wmsApi } from '../../api/wms';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Plus, Check } from 'lucide-react';
const PurchaseOrderList = () => {
    const [poList, setPoList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPO, setSelectedPO] = useState(null);
    const [showReceive, setShowReceive] = useState(false);
    const [receiveItems, setReceiveItems] = useState([]);
    const [error, setError] = useState('');
    const fetchPO = async () => {
        setLoading(true);
        try {
            const res = await wmsApi.getPOList();
            setPoList(res.data);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchPO();
    }, []);
    const handleReceiveOpen = (po) => {
        setSelectedPO(po);
        setReceiveItems(po.items?.map((item) => ({
            ...item,
            qty_receive: 0,
        })) || []);
        setShowReceive(true);
    };
    const handleReceiveSubmit = async () => {
        if (!selectedPO)
            return;
        const itemsPayload = receiveItems
            .filter(it => it.qty_receive > 0)
            .map(it => ({
            item_id: it.id,
            qty_received: it.qty_receive,
        }));
        if (itemsPayload.length === 0) {
            setError('Tidak ada item diterima');
            return;
        }
        try {
            await wmsApi.receivePO(selectedPO.id, { items: itemsPayload });
            setShowReceive(false);
            fetchPO();
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Gagal menerima');
        }
    };
    const updateReceiveQty = (itemId, qty) => {
        setReceiveItems(prev => prev.map(it => it.id === itemId ? { ...it, qty_receive: qty } : it));
    };
    const getStatusBadge = (status) => {
        const colors = {
            draft: 'tag-cyan',
            ordered: 'tag-cyan',
            partial: 'tag-orange',
            received: 'tag-green',
        };
        return colors[status] || 'tag-cyan';
    };
    return (_jsxs(Card, { title: "PURCHASE ORDER", glow: "cyan", children: [_jsx("div", { className: "flex justify-end mb-4", children: _jsx(Link, { to: "/wms/po/tambah", children: _jsxs(Button, { children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), " BUAT PO"] }) }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "No PO" }), _jsx("th", { children: "Supplier" }), _jsx("th", { children: "Tanggal" }), _jsx("th", { children: "Total" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Aksi" })] }) }), _jsxs("tbody", { children: [loading && _jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center py-4 text-text-dim", children: "MEMUAT..." }) }), !loading && poList.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center py-4 text-text-dim", children: "TIDAK ADA PO" }) }), poList.map(po => (_jsxs("tr", { children: [_jsx("td", { className: "font-mono", children: po.no_po }), _jsx("td", { className: "text-text-dim", children: po.supplier_id?.substring(0, 8) || '-' }), _jsx("td", { children: new Date(po.tanggal_order).toLocaleDateString('id-ID') }), _jsxs("td", { children: ["Rp ", Number(po.total).toLocaleString()] }), _jsx("td", { children: _jsx("span", { className: `tag ${getStatusBadge(po.status)}`, children: po.status.toUpperCase() }) }), _jsx("td", { children: (po.status === 'ordered' || po.status === 'partial' || po.status === 'draft') && (_jsxs(Button, { variant: "secondary", onClick: () => handleReceiveOpen(po), children: [_jsx(Check, { className: "w-3 h-3 mr-1" }), " TERIMA"] })) })] }, po.id)))] })] }) }), _jsxs(Modal, { open: showReceive, onClose: () => setShowReceive(false), title: selectedPO ? `TERIMA PO: ${selectedPO.no_po}` : '', onConfirm: handleReceiveSubmit, confirmText: "PROSES", children: [error && _jsx("p", { className: "text-[var(--neon-pink)] mb-2 text-sm font-semibold", children: error }), receiveItems.map((item, idx) => (_jsxs("div", { className: "flex items-center justify-between gap-4 mb-2", children: [_jsxs("span", { className: "text-sm font-semibold text-text-primary", children: ["Item #", idx + 1, " (Order: ", item.qty_order, ")"] }), _jsx(Input, { type: "number", min: 0, max: item.qty_order - (item.qty_received || 0), value: item.qty_receive, onChange: e => updateReceiveQty(item.id, parseInt(e.target.value) || 0), className: "w-20 text-center py-1" })] }, item.id)))] })] }));
};
export default PurchaseOrderList;
