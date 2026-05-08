import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { deliveryApi } from '../../api/delivery';
import { posApi } from '../../api/pos';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Check, Eye, ArrowRight, CreditCard } from 'lucide-react';
const NEXT_STATUS = {
    disiapkan: 'diambil_driver',
    diambil_driver: 'dalam_perjalanan',
    dalam_perjalanan: 'sampai',
    sampai: 'selesai',
};
const DeliveryOrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [assignModal, setAssignModal] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState('');
    const [error, setError] = useState('');
    const [detailOrder, setDetailOrder] = useState(null);
    const [updateModal, setUpdateModal] = useState(null);
    const user = useAuthStore(state => state.user);
    // State untuk switch pembayaran COD
    const [switchPaymentOrder, setSwitchPaymentOrder] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('qris');
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await deliveryApi.getOrders();
            setOrders(res.data);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchOrders(); }, []);
    const handleAssignDriver = async (orderId) => {
        try {
            await deliveryApi.assignDriver(orderId, selectedDriver);
            setAssignModal(null);
            fetchOrders();
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Gagal assign driver');
        }
    };
    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await deliveryApi.updateStatus(orderId, { status: newStatus });
            setUpdateModal(null);
            fetchOrders();
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Gagal update status');
        }
    };
    const getStatusBadge = (status) => {
        const colors = {
            disiapkan: 'tag-cyan',
            diambil_driver: 'tag-cyan',
            dalam_perjalanan: 'tag-orange',
            sampai: 'tag-green',
            selesai: 'tag-green',
        };
        return colors[status] || 'tag-cyan';
    };
    const canUpdateStatus = (order) => {
        if (!user)
            return false;
        if (user.role === 'super_admin')
            return true;
        if (user.role === 'driver' && order.driver_id === user.id)
            return true;
        return false;
    };
    return (_jsxs(Card, { title: "DAFTAR PENGIRIMAN", glow: "cyan", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "No Order" }), _jsx("th", { children: "Nama Penerima" }), _jsx("th", { children: "Kota" }), _jsx("th", { children: "COD" }), _jsx("th", { children: "Driver" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Aksi" })] }) }), _jsxs("tbody", { children: [loading && _jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center py-4 text-text-dim", children: "MEMUAT..." }) }), !loading && orders.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center py-4 text-text-dim", children: "TIDAK ADA DATA" }) }), orders.map(order => (_jsxs("tr", { children: [_jsx("td", { className: "font-mono", children: order.no_order }), _jsx("td", { children: order.nama_penerima }), _jsx("td", { children: order.kota }), _jsx("td", { children: order.nominal_cod ? `Rp ${Number(order.nominal_cod).toLocaleString()}` : '-' }), _jsx("td", { className: "text-text-dim", children: order.driver_id ? 'Terassign' : '-' }), _jsx("td", { children: _jsx("span", { className: `tag ${getStatusBadge(order.status)}`, children: order.status.replace('_', ' ').toUpperCase() }) }), _jsx("td", { children: _jsxs("div", { className: "flex gap-1", children: [order.status === 'disiapkan' && (user?.role === 'super_admin' || user?.role === 'manager') && (_jsxs(Button, { variant: "secondary", onClick: () => setAssignModal(order.id), children: [_jsx(Check, { className: "w-3 h-3 mr-1" }), " ASSIGN"] })), _jsx(Button, { variant: "secondary", onClick: () => setDetailOrder(order), children: _jsx(Eye, { className: "w-3 h-3" }) }), canUpdateStatus(order) && NEXT_STATUS[order.status] && (_jsx(Button, { variant: "primary", onClick: () => setUpdateModal(order.id), children: _jsx(ArrowRight, { className: "w-3 h-3" }) })), order.status === 'sampai' && order.nominal_cod && (user?.role === 'super_admin' || user?.role === 'kasir') && (_jsxs(Button, { variant: "secondary", onClick: () => setSwitchPaymentOrder(order), children: [_jsx(CreditCard, { className: "w-3 h-3" }), " BAYAR"] }))] }) })] }, order.id)))] })] }) }), _jsxs(Modal, { open: !!assignModal, onClose: () => setAssignModal(null), title: "ASSIGN DRIVER", onConfirm: () => handleAssignDriver(assignModal), confirmText: "ASSIGN", children: [error && _jsx("p", { className: "text-[var(--neon-pink)] mb-2", children: error }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold tracking-[1px] uppercase text-text-dim", children: "Pilih Driver" }), _jsx("select", { value: selectedDriver, onChange: e => setSelectedDriver(e.target.value), className: "input-neon w-full mt-1", children: _jsx("option", { value: "", children: "-- Pilih --" }) })] })] }), _jsx(Modal, { open: !!detailOrder, onClose: () => setDetailOrder(null), title: `DETAIL ORDER: ${detailOrder?.no_order || ''}`, children: detailOrder && (_jsx("div", { className: "text-sm space-y-2 max-h-[70vh] overflow-y-auto", children: _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("div", { className: "text-text-dim", children: "No Order" }), _jsx("div", { className: "font-mono text-neon-cyan", children: detailOrder.no_order }), _jsx("div", { className: "text-text-dim", children: "Tanggal" }), _jsx("div", { children: new Date(detailOrder.created_at).toLocaleString('id-ID') }), _jsx("div", { className: "text-text-dim", children: "Penerima" }), _jsx("div", { children: detailOrder.nama_penerima }), _jsx("div", { className: "text-text-dim", children: "Alamat" }), _jsx("div", { className: "whitespace-pre-wrap", children: detailOrder.alamat_pengiriman }), _jsx("div", { className: "text-text-dim", children: "Kota" }), _jsx("div", { children: detailOrder.kota }), _jsx("div", { className: "text-text-dim", children: "Telepon" }), _jsx("div", { children: detailOrder.telepon || '-' }), _jsx("div", { className: "text-text-dim", children: "COD" }), _jsx("div", { children: detailOrder.nominal_cod ? `Rp ${Number(detailOrder.nominal_cod).toLocaleString()}` : '-' }), _jsx("div", { className: "text-text-dim", children: "Status" }), _jsx("div", { children: _jsx("span", { className: `tag ${getStatusBadge(detailOrder.status)}`, children: detailOrder.status.replace('_', ' ').toUpperCase() }) }), _jsx("div", { className: "text-text-dim", children: "Driver" }), _jsx("div", { className: "text-text-dim", children: detailOrder.driver_id || 'Belum diassign' })] }) })) }), _jsxs(Modal, { open: !!updateModal, onClose: () => setUpdateModal(null), title: "UPDATE STATUS", children: [_jsx("p", { className: "text-text-dim mb-4", children: "Pilih status berikutnya:" }), _jsx("div", { className: "flex flex-col gap-2", children: orders.find(o => o.id === updateModal) && NEXT_STATUS[orders.find(o => o.id === updateModal).status] && (_jsx(Button, { variant: "primary", onClick: () => handleUpdateStatus(updateModal, NEXT_STATUS[orders.find(o => o.id === updateModal).status]), children: NEXT_STATUS[orders.find(o => o.id === updateModal).status].replace('_', ' ').toUpperCase() })) })] }), _jsxs(Modal, { open: !!switchPaymentOrder, onClose: () => setSwitchPaymentOrder(null), title: "UBAH PEMBAYARAN COD", onConfirm: async () => {
                    if (!switchPaymentOrder)
                        return;
                    try {
                        await posApi.switchPayment(switchPaymentOrder.transaksi_id, selectedPaymentMethod);
                        alert(`Pembayaran berhasil diubah ke ${selectedPaymentMethod.toUpperCase()}`);
                        setSwitchPaymentOrder(null);
                        fetchOrders();
                    }
                    catch (err) {
                        alert(err.response?.data?.detail || 'Gagal mengubah pembayaran');
                    }
                }, confirmText: "SIMPAN", children: [_jsxs("p", { className: "text-sm mb-3", children: ["Pilih metode pembayaran baru untuk order ", _jsx("strong", { children: switchPaymentOrder?.no_order })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "radio", value: "qris", checked: selectedPaymentMethod === 'qris', onChange: () => setSelectedPaymentMethod('qris'), className: "accent-[var(--neon-cyan)]" }), "QRIS"] }), _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "radio", value: "transfer", checked: selectedPaymentMethod === 'transfer', onChange: () => setSelectedPaymentMethod('transfer'), className: "accent-[var(--neon-cyan)]" }), "Transfer"] })] })] })] }));
};
export default DeliveryOrderList;
