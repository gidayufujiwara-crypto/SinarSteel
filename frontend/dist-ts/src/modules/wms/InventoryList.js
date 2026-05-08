import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { wmsApi } from '../../api/wms';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Search, AlertTriangle, Printer } from 'lucide-react';
const InventoryList = () => {
    const [inventory, setInventory] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const fetch = async () => {
        setLoading(true);
        try {
            const res = await wmsApi.getInventory(search || undefined);
            setInventory(res.data);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetch(); }, [search]);
    const handlePrintLabel = () => {
        if (window.electronAPI?.printLabel) {
            window.electronAPI.printLabel();
            alert('Label sedang dicetak...');
        }
        else {
            alert('Fitur cetak hanya tersedia di aplikasi desktop.');
        }
    };
    return (_jsxs(Card, { title: "STOK INVENTORI", glow: "cyan", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Search, { className: "w-4 h-4 text-text-dim" }), _jsx(Input, { placeholder: "Cari produk...", value: search, onChange: e => setSearch(e.target.value), className: "w-64" })] }), _jsxs(Button, { variant: "secondary", onClick: handlePrintLabel, children: [_jsx(Printer, { className: "w-4 h-4 mr-1" }), " PRINT LABEL"] })] }), _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "SKU" }), _jsx("th", { children: "Nama" }), _jsx("th", { children: "Stok" }), _jsx("th", { children: "Harga Jual" })] }) }), _jsxs("tbody", { children: [loading && _jsx("tr", { children: _jsx("td", { colSpan: 4, className: "text-center py-4 text-text-dim", children: "MEMUAT..." }) }), !loading && inventory.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 4, className: "text-center py-4 text-text-dim", children: "TIDAK ADA DATA" }) }), inventory.map(prod => (_jsxs("tr", { children: [_jsx("td", { className: "font-mono", children: prod.sku }), _jsxs("td", { className: "flex items-center gap-1", children: [prod.stok <= prod.stok_minimum && _jsx(AlertTriangle, { className: "w-4 h-4 text-[var(--neon-orange)]" }), prod.nama] }), _jsx("td", { className: prod.stok <= prod.stok_minimum ? 'text-[var(--neon-orange)] font-bold' : '', children: prod.stok }), _jsxs("td", { children: ["Rp ", Number(prod.harga_jual).toLocaleString()] })] }, prod.id)))] })] })] }));
};
export default InventoryList;
