import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { usePosStore } from '../../store/posStore';
import { useAuthStore } from '../../store/authStore';
import { produkApi, pelangganApi } from '../../api/master';
import { posApi, settingsApi } from '../../api/pos';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import StrukModal from '../../components/pos/StrukModal';
import { Plus, Minus, Trash2, LogIn, LogOut, CreditCard, Banknote, QrCode, Truck, RefreshCw, Eye } from 'lucide-react';
const PosPage = () => {
    const store = usePosStore();
    const user = useAuthStore(state => state.user);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [showPayment, setShowPayment] = useState(false);
    const [showVoid, setShowVoid] = useState(false);
    const [voidPin, setVoidPin] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [showTransactions, setShowTransactions] = useState(false);
    const [detailTrx, setDetailTrx] = useState(null);
    const [pelangganList, setPelangganList] = useState([]);
    const [selectedPelanggan, setSelectedPelanggan] = useState('');
    const [showShiftModal, setShowShiftModal] = useState(null);
    const [shiftInputValue, setShiftInputValue] = useState('');
    const [shiftVariance, setShiftVariance] = useState(0);
    const [metodePengiriman, setMetodePengiriman] = useState('ambil');
    const [pengirimanForm, setPengirimanForm] = useState({ nama_penerima: '', alamat: '', kota: '', telepon: '' });
    const [bankInfo, setBankInfo] = useState({ bank: '', rekening: '', atasNama: '', qrisUrl: '' });
    const [strukData, setStrukData] = useState(null);
    const [showStruk, setShowStruk] = useState(false);
    // State untuk Tarik Tunai
    const [showPickup, setShowPickup] = useState(false);
    const [pickupAmount, setPickupAmount] = useState(0);
    const [pickupNote, setPickupNote] = useState('');
    const [collection, setCollection] = useState(null);
    // ====================== LIVE SEARCH ======================
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);
    useEffect(() => {
        if (debouncedTerm.trim()) {
            produkApi.getAll(debouncedTerm)
                .then(res => setProducts(res.data.filter((p) => p.is_active && p.stok > 0)))
                .catch(console.error);
        }
        else {
            setProducts([]);
        }
    }, [debouncedTerm]);
    useEffect(() => {
        store.fetchShift();
        pelangganApi.getAll().then(res => setPelangganList(res.data));
        settingsApi.getAll().then(res => {
            const map = {};
            res.data.forEach((s) => { map[s.key] = s.value; });
            setBankInfo({
                bank: map.bank_name || 'BCA',
                rekening: map.account_number || '1234567890',
                atasNama: map.account_holder || 'SinarSteel',
                qrisUrl: map.qris_image_url || '/qris-placeholder.png',
            });
        });
    }, []);
    const cartTotal = store.cart.reduce((sum, item) => sum + ((item.harga_jual - item.diskon_per_item) * item.qty), 0);
    const grandTotal = cartTotal - store.diskon_total;
    const kembalian = store.jenis_pembayaran === 'tunai' ? store.bayar - grandTotal : 0;
    const handleOpenShiftSubmit = async () => {
        const saldo = parseFloat(shiftInputValue);
        if (isNaN(saldo))
            return;
        try {
            await store.openShift(saldo);
            setShowShiftModal(null);
            setShiftInputValue('');
        }
        catch (err) {
            alert('Gagal membuka shift: ' + (err.response?.data?.detail || err.message));
        }
    };
    const handleCloseShiftSubmit = async () => {
        const setoran = parseFloat(shiftInputValue);
        if (isNaN(setoran))
            return;
        try {
            await store.closeShift(setoran);
            setShowShiftModal(null);
            setShiftInputValue('');
        }
        catch (err) {
            alert('Gagal menutup shift: ' + (err.response?.data?.detail || err.message));
        }
    };
    const handleSubmit = async () => {
        try {
            let deliveryData = undefined;
            if (metodePengiriman === 'kurir') {
                deliveryData = {
                    nama_penerima: pengirimanForm.nama_penerima,
                    alamat: pengirimanForm.alamat,
                    kota: pengirimanForm.kota,
                    telepon: pengirimanForm.telepon,
                };
            }
            const trx = await store.submitTransaction(deliveryData);
            setShowPayment(false);
            setStrukData({ transaksi: trx, cart: store.cart, total: cartTotal, diskon: store.diskon_total, grandTotal, pengirimanForm });
            setShowStruk(true);
        }
        catch { }
    };
    const handleVoidRequest = async (transaksiId) => {
        try {
            await posApi.requestVoidPin(transaksiId);
            alert('PIN void telah dikirim ke aplikasi super admin. Masukkan PIN yang diterima.');
            setShowVoid(true);
            setVoidPin('');
        }
        catch (err) {
            alert('Gagal request void: ' + (err.response?.data?.detail || err.message));
        }
    };
    const handleVoidConfirm = async (transaksiId) => {
        try {
            await posApi.verifyVoidPin(transaksiId, voidPin);
            setShowVoid(false);
            setVoidPin('');
            loadTransactions();
        }
        catch (err) {
            alert('Gagal void: ' + (err.response?.data?.detail || err.message));
        }
    };
    const handleRetur = (trx) => {
        const items = trx.items.map((item) => ({
            produk_id: item.produk_id,
            qty: item.qty,
            diskon_per_item: 0,
        }));
        store.returTransaksi({ transaksi_id: trx.id, items, diskon_total: 0 }).then(() => {
            loadTransactions();
        }).catch((err) => alert(err.response?.data?.detail || err.message));
    };
    const loadTransactions = useCallback(async () => {
        try {
            const res = await posApi.getTransaksiList(100);
            setTransactions(res.data);
        }
        catch { }
    }, []);
    useEffect(() => {
        if (showTransactions)
            loadTransactions();
    }, [showTransactions, loadTransactions]);
    const calculateVariance = () => {
        if (!store.shift)
            return;
        const expected = (store.shift.saldo_awal || 0) + (store.shift.total_tunai || 0);
        const input = parseFloat(shiftInputValue) || 0;
        setShiftVariance(input - expected);
    };
    const openPickupModal = async () => {
        try {
            const res = await posApi.getShiftCollection();
            setCollection(res.data);
            setShowPickup(true);
        }
        catch (err) {
            alert('Gagal mengambil data koleksi: ' + (err.response?.data?.detail || err.message));
        }
    };
    const handlePickup = async () => {
        if (pickupAmount <= 0) {
            alert('Jumlah penarikan harus lebih dari 0');
            return;
        }
        try {
            await posApi.createPickup({ jumlah: pickupAmount, keterangan: pickupNote });
            alert('Penarikan tunai berhasil dicatat.');
            setShowPickup(false);
            setPickupAmount(0);
            setPickupNote('');
            // Refresh collection
            const res = await posApi.getShiftCollection();
            setCollection(res.data);
        }
        catch (err) {
            alert('Gagal: ' + (err.response?.data?.detail || err.message));
        }
    };
    return (_jsxs("div", { className: "flex flex-col h-full", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h1", { className: "text-2xl font-bold text-text-primary font-orbitron tracking-[2px] uppercase", children: "POS KASIR" }), _jsxs("div", { className: "flex items-center gap-3", children: [store.shift ? (_jsxs("div", { className: "flex items-center gap-2 text-neon-green font-semibold", children: [_jsx(LogIn, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm font-orbitron", children: "SHIFT AKTIF" }), _jsxs(Button, { variant: "secondary", onClick: () => { setShowShiftModal('tutup'); setShiftInputValue('0'); }, children: [_jsx(LogOut, { className: "w-4 h-4 mr-1" }), " TUTUP SHIFT"] })] })) : (_jsxs(Button, { onClick: () => { setShowShiftModal('buka'); setShiftInputValue('0'); }, children: [_jsx(LogIn, { className: "w-4 h-4 mr-1" }), " BUKA SHIFT"] })), _jsxs(Button, { variant: "secondary", onClick: openPickupModal, disabled: !store.shift, children: [_jsx(Banknote, { className: "w-4 h-4 mr-1" }), " TARIK TUNAI"] }), _jsx(Button, { variant: "secondary", onClick: () => { setShowTransactions(true); }, children: "RIWAYAT" })] })] }), !store.shift && (_jsx(Card, { children: _jsx("p", { className: "text-center text-text-dim font-orbitron", children: "Silakan buka shift terlebih dahulu." }) })), store.shift && (_jsxs("div", { className: "flex gap-4 flex-1 overflow-hidden", children: [_jsxs("div", { className: "flex-1 flex flex-col gap-4", style: { maxHeight: 'calc(100vh - 120px)' }, children: [_jsxs(Card, { title: "CARI PRODUK", glow: "cyan", children: [_jsx("div", { className: "flex gap-2 mb-4", children: _jsx(Input, { placeholder: "Ketik nama / SKU / Barcode...", value: searchTerm, onChange: e => setSearchTerm(e.target.value), className: "flex-1" }) }), products.length > 0 && (_jsx("div", { className: "grid grid-cols-2 gap-2 max-h-60 overflow-y-auto", children: products.map(p => (_jsxs("div", { className: "flex items-center justify-between bg-[#0a1520] border border-[rgba(0,245,255,0.1)] p-2 rounded", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold", children: p.nama }), _jsxs("p", { className: "text-xs text-text-dim", children: [p.sku, " - Rp ", Number(p.harga_jual).toLocaleString()] })] }), _jsx(Button, { onClick: () => store.addToCart(p), children: _jsx(Plus, { className: "w-4 h-4" }) })] }, p.id))) }))] }), _jsxs(Card, { title: `KERANJANG (${store.cart.length} ITEM)`, glow: "cyan", className: "flex-1 overflow-auto", style: { minHeight: 200, maxHeight: '50vh' }, children: [store.cart.length === 0 && _jsx("p", { className: "text-center text-text-dim py-8 font-orbitron", children: "KERANJANG KOSONG" }), store.cart.map(item => (_jsxs("div", { className: "flex items-center justify-between py-2 border-b border-[rgba(0,245,255,0.08)]", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-semibold", children: item.nama }), _jsxs("p", { className: "text-xs text-text-dim", children: ["Rp ", item.harga_jual.toLocaleString()] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => store.updateQty(item.produk_id, item.qty - 1), className: "text-text-dim hover:text-neon-cyan", children: _jsx(Minus, { className: "w-4 h-4" }) }), _jsx("span", { className: "text-sm w-6 text-center font-mono", children: item.qty }), _jsx("button", { onClick: () => store.updateQty(item.produk_id, item.qty + 1), className: "text-text-dim hover:text-neon-cyan", children: _jsx(Plus, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "w-20 text-right", children: _jsx("input", { type: "number", value: item.diskon_per_item, onChange: e => store.updateDiskonItem(item.produk_id, Number(e.target.value)), className: "input-neon w-16 text-xs px-1 py-0", placeholder: "Diskon" }) }), _jsxs("div", { className: "w-24 text-right font-mono text-sm text-neon-yellow", children: ["Rp ", ((item.harga_jual - item.diskon_per_item) * item.qty).toLocaleString()] }), _jsx("button", { onClick: () => store.removeFromCart(item.produk_id), className: "text-[var(--neon-pink)] hover:text-red-400 ml-2", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }, item.produk_id)))] })] }), _jsxs("div", { className: "w-80 flex flex-col gap-4 overflow-y-auto", style: { maxHeight: 'calc(100vh - 140px)' }, children: [_jsx(Card, { title: "RINGKASAN", glow: "yellow", children: _jsxs("div", { className: "space-y-2 text-sm font-semibold", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-text-dim", children: "Subtotal" }), _jsxs("span", { children: ["Rp ", cartTotal.toLocaleString()] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-text-dim", children: "Diskon Total" }), _jsx("input", { type: "number", value: store.diskon_total, onChange: e => store.setDiskonTotal(Number(e.target.value)), className: "input-neon w-24 text-right px-2 py-1" })] }), _jsx("hr", { className: "border-[rgba(0,245,255,0.15)]" }), _jsxs("div", { className: "flex justify-between font-bold text-lg", children: [_jsx("span", { className: "text-text-dim", children: "Grand Total" }), _jsxs("span", { className: "text-neon-cyan", children: ["Rp ", grandTotal.toLocaleString()] })] })] }) }), _jsx(Card, { title: "PEMBAYARAN", glow: "green", children: _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "grid grid-cols-3 gap-2", children: ['tunai', 'transfer', 'qris', 'cod'].map(jenis => (_jsxs("button", { onClick: () => { store.setPembayaran(jenis); if (jenis === 'cod')
                                                    setMetodePengiriman('kurir'); }, className: `flex items-center gap-1 p-2 rounded-lg border text-xs font-bold uppercase transition-all ${store.jenis_pembayaran === jenis ? 'border-[var(--neon-cyan)] bg-[rgba(0,245,255,0.1)] text-neon-cyan' : 'border-[rgba(0,245,255,0.15)] text-text-dim hover:border-[rgba(0,245,255,0.4)]'}`, children: [jenis === 'tunai' && _jsx(Banknote, { className: "w-4 h-4" }), jenis === 'transfer' && _jsx(CreditCard, { className: "w-4 h-4" }), jenis === 'qris' && _jsx(QrCode, { className: "w-4 h-4" }), jenis === 'cod' && _jsx(Truck, { className: "w-4 h-4" }), _jsx("span", { children: jenis })] }, jenis))) }), store.jenis_pembayaran === 'tunai' && _jsx(Input, { label: "UANG PELANGGAN", type: "number", value: store.bayar, onChange: e => store.setBayar(Number(e.target.value)) }), store.jenis_pembayaran === 'tunai' && store.bayar > 0 && _jsxs("div", { className: "flex justify-between font-bold text-neon-green", children: [_jsx("span", { children: "KEMBALIAN" }), _jsxs("span", { children: ["Rp ", kembalian.toLocaleString()] })] }), store.jenis_pembayaran === 'kredit' && (_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold tracking-[1px] uppercase text-text-dim mt-2 block", children: "Pilih Pelanggan" }), _jsxs("select", { value: selectedPelanggan, onChange: e => { setSelectedPelanggan(e.target.value); const p = pelangganList.find(p => p.id === e.target.value); store.setPelanggan(e.target.value, p?.nama || ''); }, className: "input-neon w-full mt-1", children: [_jsx("option", { value: "", children: "-- Pilih --" }), pelangganList.map(p => _jsxs("option", { value: p.id, children: [p.nama, " (Limit: Rp ", Number(p.limit_kredit).toLocaleString(), ")"] }, p.id))] })] })), (store.jenis_pembayaran === 'transfer' || store.jenis_pembayaran === 'qris') && (_jsx("div", { className: "p-3 bg-[#0a1520] border border-[rgba(0,245,255,0.15)] rounded-md text-xs text-text-dim", children: store.jenis_pembayaran === 'transfer' ? (_jsxs(_Fragment, { children: [_jsx("p", { className: "text-neon-cyan font-bold mb-2", children: "TRANSFER KE:" }), _jsxs("p", { children: [bankInfo.bank, " | ", bankInfo.rekening] }), _jsx("p", { children: bankInfo.atasNama }), _jsx("p", { className: "mt-2", children: "Silakan transfer dan konfirmasi setelah selesai." })] })) : (_jsxs("div", { className: "text-center", children: [_jsx("img", { src: bankInfo.qrisUrl || '/qris-placeholder.png', alt: "QRIS", className: "w-32 h-32 mx-auto mb-2 object-contain" }), _jsx("p", { children: "Tunjukkan QR ke pelanggan" })] })) })), _jsxs("div", { className: "flex items-center gap-3 mt-3", children: [_jsx("label", { className: "text-xs font-semibold uppercase text-text-dim", children: "Pengiriman:" }), _jsxs("select", { value: metodePengiriman, onChange: e => setMetodePengiriman(e.target.value), className: "input-neon flex-1", children: [_jsx("option", { value: "ambil", children: "Ambil Sendiri" }), _jsx("option", { value: "kurir", children: "Kurir Toko" })] })] }), metodePengiriman === 'kurir' && (_jsxs("div", { className: "space-y-2 mt-2", children: [_jsx(Input, { label: "Nama Penerima", value: pengirimanForm.nama_penerima, onChange: e => setPengirimanForm({ ...pengirimanForm, nama_penerima: e.target.value }), required: true }), _jsx(Input, { label: "Alamat Lengkap", value: pengirimanForm.alamat, onChange: e => setPengirimanForm({ ...pengirimanForm, alamat: e.target.value }), required: true }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx(Input, { label: "Kota", value: pengirimanForm.kota, onChange: e => setPengirimanForm({ ...pengirimanForm, kota: e.target.value }), required: true }), _jsx(Input, { label: "Telepon", value: pengirimanForm.telepon, onChange: e => setPengirimanForm({ ...pengirimanForm, telepon: e.target.value }) })] })] })), _jsx(Button, { className: "w-full mt-4", disabled: store.cart.length === 0 || store.loading, onClick: () => setShowPayment(true), children: store.loading ? 'MEMPROSES...' : `BAYAR (Rp ${grandTotal.toLocaleString()})` })] }) })] })] })), _jsxs(Modal, { open: showPayment, onClose: () => setShowPayment(false), title: "KONFIRMASI PEMBAYARAN", onConfirm: handleSubmit, confirmText: "PROSES", isLoading: store.loading, children: [_jsxs("p", { className: "text-neon-cyan font-bold text-lg", children: ["Grand Total: Rp ", grandTotal.toLocaleString()] }), store.jenis_pembayaran === 'tunai' && _jsxs("p", { children: ["Bayar: Rp ", store.bayar.toLocaleString(), " | Kembalian: Rp ", kembalian.toLocaleString()] }), store.error && _jsx("p", { className: "text-[var(--neon-pink)] mt-2", children: store.error })] }), _jsxs(Modal, { open: showTransactions, onClose: () => setShowTransactions(false), title: "RIWAYAT TRANSAKSI", children: [_jsxs("div", { className: "max-h-96 overflow-y-auto space-y-2", children: [transactions.length === 0 && _jsx("p", { className: "text-text-dim text-center py-4", children: "Tidak ada transaksi" }), transactions.map(trx => (_jsxs("div", { className: "flex justify-between items-center py-2 border-b border-[rgba(0,245,255,0.08)] text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "font-mono text-neon-cyan", children: trx.no_transaksi }), _jsx("p", { className: "text-text-dim", children: new Date(trx.created_at).toLocaleString('id-ID') }), _jsxs("p", { className: `font-semibold ${trx.status === 'void' ? 'text-[var(--neon-pink)]' : trx.status === 'retur' ? 'text-yellow-400' : 'text-neon-green'}`, children: ["Rp ", Number(trx.total_setelah_diskon).toLocaleString(), " - ", trx.jenis_pembayaran, " (", trx.status, ")"] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "secondary", onClick: () => setDetailTrx(trx), children: _jsx(Eye, { className: "w-3 h-3" }) }), trx.status !== 'void' && trx.status !== 'retur' && (_jsxs(_Fragment, { children: [user?.role === 'super_admin' && (_jsxs(Button, { variant: "danger", onClick: () => handleVoidRequest(trx.id), children: [_jsx(Trash2, { className: "w-3 h-3" }), " VOID"] })), (user?.role === 'super_admin' || user?.role === 'manager') && (_jsxs(Button, { variant: "secondary", onClick: () => handleRetur(trx), children: [_jsx(RefreshCw, { className: "w-3 h-3" }), " RETUR"] }))] }))] })] }, trx.id)))] }), showVoid && (_jsxs("div", { className: "mt-4 border-t border-[rgba(0,245,255,0.15)] pt-4", children: [_jsx("p", { className: "text-sm text-text-dim mb-2", children: "Masukkan PIN dari aplikasi super admin:" }), _jsx(Input, { type: "text", value: voidPin, onChange: e => setVoidPin(e.target.value), placeholder: "6 digit PIN", maxLength: 6 }), _jsx(Button, { variant: "danger", className: "mt-2 w-full", onClick: () => handleVoidConfirm(transactions[0]?.id), children: "KONFIRMASI VOID" })] }))] }), detailTrx && (_jsx(Modal, { open: true, onClose: () => setDetailTrx(null), title: `DETAIL ${detailTrx.no_transaksi}`, children: _jsxs("div", { className: "text-sm space-y-2 max-h-[70vh] overflow-y-auto", children: [_jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("div", { className: "text-text-dim", children: "Tanggal" }), _jsx("div", { children: new Date(detailTrx.created_at).toLocaleString('id-ID') }), _jsx("div", { className: "text-text-dim", children: "Pembayaran" }), _jsx("div", { className: "font-bold", children: detailTrx.jenis_pembayaran }), _jsx("div", { className: "text-text-dim", children: "Status" }), _jsx("div", { className: `tag ${detailTrx.status === 'selesai' ? 'tag-green' : 'tag-orange'}`, children: detailTrx.status })] }), _jsx("hr", { className: "border-[rgba(0,245,255,0.15)]" }), _jsx("p", { className: "font-bold text-xs uppercase", children: "Item" }), _jsxs("table", { className: "table-neon w-full text-xs", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Item" }), _jsx("th", { children: "Qty" }), _jsx("th", { children: "Harga" }), _jsx("th", { children: "Subtotal" })] }) }), _jsx("tbody", { children: detailTrx.items?.map((item, idx) => (_jsxs("tr", { children: [_jsx("td", { children: item.produk_id?.substring(0, 8) || 'Produk' }), _jsx("td", { children: item.qty }), _jsxs("td", { children: ["Rp ", Number(item.harga_satuan).toLocaleString()] }), _jsxs("td", { children: ["Rp ", Number(item.subtotal).toLocaleString()] })] }, idx))) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-1 text-xs", children: [_jsx("div", { className: "text-text-dim", children: "Diskon" }), _jsxs("div", { children: ["Rp ", Number(detailTrx.diskon_total).toLocaleString()] }), _jsx("div", { className: "text-text-dim", children: "Bayar" }), _jsxs("div", { children: ["Rp ", Number(detailTrx.bayar || detailTrx.total_setelah_diskon).toLocaleString()] }), _jsx("div", { className: "text-text-dim", children: "Kembalian" }), _jsxs("div", { children: ["Rp ", Number(detailTrx.kembalian || 0).toLocaleString()] })] })] }) })), _jsxs(Modal, { open: showShiftModal !== null, onClose: () => setShowShiftModal(null), title: showShiftModal === 'buka' ? 'BUKA SHIFT' : 'TUTUP SHIFT', onConfirm: showShiftModal === 'buka' ? handleOpenShiftSubmit : handleCloseShiftSubmit, confirmText: "SIMPAN", children: [_jsx(Input, { label: showShiftModal === 'buka' ? 'Saldo Awal (Rp)' : 'Total Setoran (Rp)', type: "number", value: shiftInputValue, onChange: e => { setShiftInputValue(e.target.value); if (showShiftModal === 'tutup')
                            calculateVariance(); }, autoFocus: true }), showShiftModal === 'tutup' && (_jsxs("div", { className: "mt-2 text-sm", children: [_jsxs("p", { children: ["Seharusnya: Rp ", ((store.shift?.saldo_awal || 0) + (store.shift?.total_tunai || 0)).toLocaleString()] }), _jsxs("p", { className: shiftVariance < 0 ? 'text-[var(--neon-pink)]' : 'text-neon-green', children: ["Selisih: Rp ", shiftVariance.toLocaleString()] })] }))] }), _jsx(Modal, { open: showPickup, onClose: () => setShowPickup(false), title: "TARIK TUNAI DARI LACI", onConfirm: handlePickup, confirmText: "SIMPAN", children: _jsxs("div", { className: "space-y-3", children: [collection && (_jsx(_Fragment, { children: _jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [_jsx("div", { className: "text-text-dim", children: "Total Tunai" }), _jsxs("div", { className: "text-right", children: ["Rp ", Number(collection.total_tunai).toLocaleString()] }), _jsx("div", { className: "text-text-dim", children: "Total QRIS" }), _jsxs("div", { className: "text-right", children: ["Rp ", Number(collection.total_qris).toLocaleString()] }), _jsx("div", { className: "text-text-dim", children: "Total Transfer" }), _jsxs("div", { className: "text-right", children: ["Rp ", Number(collection.total_transfer).toLocaleString()] }), _jsx("div", { className: "text-text-dim", children: "Total COD" }), _jsxs("div", { className: "text-right", children: ["Rp ", Number(collection.total_cod).toLocaleString()] }), _jsx("div", { className: "text-text-dim font-bold", children: "Grand Total" }), _jsxs("div", { className: "text-right font-bold", children: ["Rp ", Number(collection.grand_total).toLocaleString()] }), _jsx("hr", { className: "col-span-2 border-[rgba(0,245,255,0.15)]" }), _jsx("div", { className: "text-text-dim", children: "Total Penarikan" }), _jsxs("div", { className: "text-right", children: ["Rp ", Number(collection.total_pickup).toLocaleString()] }), _jsx("div", { className: "text-neon-cyan font-bold", children: "Sisa Tunai di Laci" }), _jsxs("div", { className: "text-right text-neon-cyan font-bold", children: ["Rp ", Number(collection.sisa_tunai).toLocaleString()] })] }) })), _jsx(Input, { label: "Jumlah Penarikan", type: "number", value: pickupAmount, onChange: e => setPickupAmount(parseFloat(e.target.value)), min: 1 }), _jsx(Input, { label: "Keterangan", value: pickupNote, onChange: e => setPickupNote(e.target.value), placeholder: "Misal: Setor bank, biaya operasional" })] }) }), strukData && _jsx(StrukModal, { open: showStruk, onClose: () => { setShowStruk(false); store.clearCart(); }, ...strukData })] }));
};
export default PosPage;
