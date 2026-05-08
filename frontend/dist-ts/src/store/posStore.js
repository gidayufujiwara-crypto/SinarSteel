import { create } from 'zustand';
import { posApi } from '../api/pos';
export const usePosStore = create((set, get) => ({
    cart: [],
    shift: null,
    pelanggan_id: null,
    pelanggan_nama: '',
    jenis_pembayaran: 'tunai',
    diskon_total: 0,
    bayar: 0,
    error: null,
    loading: false,
    addToCart: (product) => {
        const cart = get().cart;
        const existing = cart.find(item => item.produk_id === product.id);
        if (existing) {
            set({ cart: cart.map(item => item.produk_id === product.id ? { ...item, qty: item.qty + 1 } : item) });
        }
        else {
            set({
                cart: [...cart, {
                        produk_id: product.id,
                        sku: product.sku,
                        nama: product.nama,
                        harga_jual: Number(product.harga_jual),
                        qty: 1,
                        diskon_per_item: 0,
                        hpp_rata_rata: Number(product.hpp_rata_rata || 0),
                    }],
            });
        }
    },
    removeFromCart: (produk_id) => set({ cart: get().cart.filter(item => item.produk_id !== produk_id) }),
    updateQty: (produk_id, qty) => {
        if (qty <= 0) {
            get().removeFromCart(produk_id);
            return;
        }
        set({ cart: get().cart.map(item => item.produk_id === produk_id ? { ...item, qty } : item) });
    },
    updateDiskonItem: (produk_id, diskon) => set({ cart: get().cart.map(item => item.produk_id === produk_id ? { ...item, diskon_per_item: diskon } : item) }),
    clearCart: () => set({ cart: [], diskon_total: 0, bayar: 0, pelanggan_id: null, pelanggan_nama: '' }),
    setPembayaran: (jenis) => set({ jenis_pembayaran: jenis }),
    setDiskonTotal: (diskon) => set({ diskon_total: diskon }),
    setBayar: (bayar) => set({ bayar }),
    setPelanggan: (id, nama) => set({ pelanggan_id: id, pelanggan_nama: nama }),
    fetchShift: async () => {
        try {
            const res = await posApi.getCurrentShift();
            set({ shift: res.data });
        }
        catch {
            set({ shift: null });
        }
    },
    openShift: async (saldoAwal) => {
        const res = await posApi.openShift({ saldo_awal: saldoAwal });
        set({ shift: res.data });
    },
    closeShift: async (totalSetoran) => {
        try {
            await posApi.closeShift({ total_setoran: totalSetoran });
            set({ shift: null });
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    },
    submitTransaction: async (deliveryData) => {
        set({ loading: true, error: null });
        const state = get();
        const total = state.cart.reduce((sum, item) => sum + ((item.harga_jual - item.diskon_per_item) * item.qty), 0);
        const diskon = state.diskon_total;
        const total_after = total - diskon;
        const payload = {
            pelanggan_id: state.pelanggan_id || null,
            jenis_pembayaran: state.jenis_pembayaran,
            items: state.cart.map(item => ({ produk_id: item.produk_id, qty: item.qty, diskon_per_item: item.diskon_per_item })),
            diskon_total: diskon,
            bayar: state.jenis_pembayaran === 'tunai' ? state.bayar : null,
            catatan: '',
            delivery: deliveryData || undefined,
        };
        try {
            const res = await posApi.createTransaksi(payload);
            set({ loading: false });
            get().clearCart();
            get().fetchShift();
            return res.data;
        }
        catch (err) {
            const msg = err.response?.data?.detail || err.message || 'Gagal menyimpan transaksi';
            set({ loading: false, error: msg });
            throw err;
        }
    },
    requestVoidPin: async (transaksiId) => {
        const res = await posApi.requestVoidPin(transaksiId);
        return res.data.pin;
    },
    verifyVoidPin: async (transaksiId, pin) => {
        const res = await posApi.verifyVoidPin(transaksiId, pin);
        return res.data;
    },
    returTransaksi: async (data) => {
        const res = await posApi.returTransaksi(data);
        return res.data;
    },
    reset: () => set({
        cart: [], pelanggan_id: null, pelanggan_nama: '', jenis_pembayaran: 'tunai', diskon_total: 0, bayar: 0, error: null,
    }),
}));
// Fungsi generateStruk baru (diletakkan di luar store)
function generateStruk(trx, cart, total, diskon, total_after) {
    const storeName = localStorage.getItem('storeName') || 'SINARSTEEL';
    const storeAddress = localStorage.getItem('storeAddress') || '';
    const storePhone = localStorage.getItem('storePhone') || '';
    const lines = [
        `\x1b\x40`,
        `\x1b\x61\x01`,
        `${storeName}`,
        storeAddress ? `${storeAddress}` : '',
        storePhone ? `Telp: ${storePhone}` : '',
        '',
        `\x1b\x61\x00`,
        '=============================',
        `No  : ${trx.no_transaksi}`,
        `Tgl : ${new Date(trx.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} ${new Date(trx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
        '=============================',
    ];
    cart.forEach(item => {
        lines.push(`${item.nama}`);
        lines.push(`  ${item.qty} x Rp ${item.harga_jual.toLocaleString()} = Rp ${((item.harga_jual - item.diskon_per_item) * item.qty).toLocaleString()}`);
    });
    lines.push('-----------------------------');
    lines.push(`Total    : Rp ${total.toLocaleString()}`);
    if (diskon > 0)
        lines.push(`Diskon   : Rp ${diskon.toLocaleString()}`);
    lines.push(`Grand Tot: Rp ${total_after.toLocaleString()}`);
    lines.push(`Bayar    : ${trx.jenis_pembayaran.toUpperCase()}`);
    if (trx.bayar)
        lines.push(`Uang     : Rp ${Number(trx.bayar).toLocaleString()}`);
    if (trx.kembalian !== null)
        lines.push(`Kembali  : Rp ${Number(trx.kembalian).toLocaleString()}`);
    lines.push('=============================');
    lines.push('   TERIMA KASIH');
    lines.push('');
    lines.push('\x1b\x69');
    return lines.join('\n');
}
