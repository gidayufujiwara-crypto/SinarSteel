import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { wmsApi } from '../../api/wms';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { Search } from 'lucide-react';
const MutationHistory = () => {
    const [mutations, setMutations] = useState([]);
    const [produkId, setProdukId] = useState('');
    const [loading, setLoading] = useState(false);
    const fetch = async () => {
        setLoading(true);
        try {
            const res = await wmsApi.getMutations(produkId || undefined);
            setMutations(res.data);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetch();
    }, [produkId]);
    const getTipeBadge = (tipe) => {
        if (tipe === 'masuk')
            return 'tag-green';
        if (tipe === 'keluar')
            return 'tag-pink';
        return 'tag-orange';
    };
    return (_jsxs(Card, { title: "RIWAYAT MUTASI STOK", glow: "cyan", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(Search, { className: "w-4 h-4 text-text-dim" }), _jsx(Input, { placeholder: "Filter Produk ID...", value: produkId, onChange: e => setProdukId(e.target.value), className: "w-64" })] }), _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Tanggal" }), _jsx("th", { children: "Produk" }), _jsx("th", { children: "Tipe" }), _jsx("th", { children: "Qty" }), _jsx("th", { children: "Referensi" }), _jsx("th", { children: "Keterangan" })] }) }), _jsxs("tbody", { children: [loading && _jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center py-4 text-text-dim", children: "MEMUAT..." }) }), !loading && mutations.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center py-4 text-text-dim", children: "TIDAK ADA DATA" }) }), mutations.map(mut => (_jsxs("tr", { children: [_jsx("td", { children: new Date(mut.created_at).toLocaleString('id-ID') }), _jsx("td", { className: "font-mono text-xs text-text-dim", children: mut.produk_id?.substring(0, 8) || '-' }), _jsx("td", { children: _jsx("span", { className: `tag ${getTipeBadge(mut.tipe)}`, children: mut.tipe.toUpperCase() }) }), _jsx("td", { children: mut.qty }), _jsx("td", { className: "text-text-dim", children: mut.referensi || '-' }), _jsx("td", { className: "text-text-dim", children: mut.keterangan || '-' })] }, mut.id)))] })] })] }));
};
export default MutationHistory;
