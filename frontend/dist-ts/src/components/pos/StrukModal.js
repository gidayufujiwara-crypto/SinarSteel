import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Button from '../ui/Button';
import { Printer } from 'lucide-react';
const generateStruk = (data, cart, total, diskon, grandTotal) => {
    const store = JSON.parse(localStorage.getItem('storeName') || '""');
    const storeName = store || 'SinarSteel';
    const lines = [
        `   ${storeName}`,
        '=============================',
        `No : ${data.no_transaksi}`,
        `Tgl: ${new Date(data.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} ${new Date(data.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
        '-----------------------------',
    ];
    cart.forEach((item) => {
        lines.push(`${item.nama}`);
        lines.push(`${item.qty} x Rp ${item.harga_jual.toLocaleString()} = Rp ${((item.harga_jual - item.diskon_per_item) * item.qty).toLocaleString()}`);
    });
    lines.push('-----------------------------');
    lines.push(`Total    : Rp ${total.toLocaleString()}`);
    if (diskon > 0)
        lines.push(`Diskon   : Rp ${diskon.toLocaleString()}`);
    lines.push(`Grand Tot: Rp ${grandTotal.toLocaleString()}`);
    lines.push(`Bayar    : ${data.jenis_pembayaran.toUpperCase()}`);
    if (data.bayar)
        lines.push(`Uang     : Rp ${Number(data.bayar).toLocaleString()}`);
    if (data.kembalian)
        lines.push(`Kembali  : Rp ${Number(data.kembalian).toLocaleString()}`);
    lines.push('=============================');
    lines.push('   TERIMA KASIH');
    return lines.join('\n');
};
const StrukModal = ({ open, onClose, transaksi, cart, total, diskon, grandTotal, alamatPengiriman, namaPenerima, kota, telepon }) => {
    if (!open)
        return null;
    const handlePrint = () => {
        const text = generateStruk(transaksi, cart, total, diskon, grandTotal);
        if (window.electronAPI?.printReceipt) {
            window.electronAPI.printReceipt(text);
        }
        else {
            const w = window.open('', '_blank', 'width=300,height=400');
            if (w) {
                w.document.write(`<pre>${text}</pre>`);
                w.document.close();
                w.print();
            }
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm", children: _jsxs("div", { className: "card-neon p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto", children: [_jsx("h2", { className: "text-lg font-bold text-neon-cyan font-orbitron tracking-wider mb-4", children: "STRUK TRANSAKSI" }), _jsx("pre", { className: "text-sm text-text-primary font-mono whitespace-pre-wrap mb-4", children: generateStruk(transaksi, cart, total, diskon, grandTotal) }), alamatPengiriman && (_jsxs("div", { className: "border-t border-[rgba(0,245,255,0.2)] pt-3 mt-3 text-sm text-text-primary", children: [_jsx("p", { className: "font-bold text-neon-cyan mb-1", children: "STRUK PENGIRIMAN" }), _jsxs("p", { children: ["Penerima: ", namaPenerima] }), _jsxs("p", { children: ["Alamat  : ", alamatPengiriman] }), _jsxs("p", { children: ["Kota    : ", kota] }), telepon && _jsxs("p", { children: ["Telp    : ", telepon] })] })), _jsxs("div", { className: "flex gap-3 mt-6", children: [_jsxs(Button, { variant: "primary", onClick: handlePrint, children: [_jsx(Printer, { className: "w-4 h-4 mr-1" }), " CETAK"] }), _jsx(Button, { variant: "secondary", onClick: onClose, children: "TUTUP" })] })] }) }));
};
export default StrukModal;
