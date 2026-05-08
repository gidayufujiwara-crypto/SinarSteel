import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import NeonLineChart from '../../components/charts/NeonLineChart';
import NeonBarChart from '../../components/charts/NeonBarChart';
import NeonDonutChart from '../../components/charts/NeonDonutChart';
import { reportApi } from '../../api/report';
import { produkApi } from '../../api/master';
import { DollarSign, TrendingUp, AlertTriangle, Truck } from 'lucide-react';
const DashboardPage = () => {
    const [metrics, setMetrics] = useState({});
    const [charts, setCharts] = useState({});
    const [loading, setLoading] = useState(true);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [metricsRes, chartsRes] = await Promise.all([
                    reportApi.getDashboardMetrics(),
                    reportApi.getDashboardCharts(),
                ]);
                setMetrics(metricsRes.data);
                setCharts(chartsRes.data);
            }
            catch (err) {
                console.error(err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
        // Fetch produk untuk stok minimum
        produkApi.getAll().then(res => {
            const low = res.data.filter((p) => p.is_active && p.stok <= p.stok_minimum);
            setLowStockProducts(low);
        }).catch(console.error);
    }, []);
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsx("h1", { className: "text-2xl font-bold text-text-primary font-orbitron tracking-[2px] uppercase", children: "DASHBOARD" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { glow: "cyan", className: "relative overflow-hidden cursor-pointer hover:-translate-y-1", children: [_jsx("div", { className: "absolute top-0 left-0 right-0 h-[2px]", style: { background: 'var(--neon-cyan)', boxShadow: '0 0 12px var(--neon-cyan)' } }), _jsx("div", { className: "text-xs font-semibold tracking-[2px] uppercase text-text-dim mb-2", children: "Revenue Hari Ini" }), _jsxs("div", { className: "font-orbitron text-3xl font-black leading-none mb-2", style: { color: 'var(--neon-cyan)', textShadow: '0 0 20px rgba(0,245,255,0.5)' }, children: ["Rp ", Number(metrics.revenue_today || 0).toLocaleString()] }), _jsxs("div", { className: `text-xs font-semibold flex items-center gap-1 ${metrics.growth_percent >= 0 ? 'text-neon-green' : 'text-neon-pink'}`, children: [metrics.growth_percent >= 0 ? '▲' : '▼', " ", Math.abs(metrics.growth_percent || 0).toFixed(1), "% dari kemarin"] }), _jsx(DollarSign, { className: "absolute right-4 top-1/2 -translate-y-1/2 text-3xl opacity-[0.07]" })] }), _jsxs(Card, { glow: "cyan", className: "relative overflow-hidden cursor-pointer hover:-translate-y-1", children: [_jsx("div", { className: "absolute top-0 left-0 right-0 h-[2px]", style: { background: 'var(--neon-cyan)', boxShadow: '0 0 12px var(--neon-cyan)' } }), _jsx("div", { className: "text-xs font-semibold tracking-[2px] uppercase text-text-dim mb-2", children: "Transaksi Hari Ini" }), _jsx("div", { className: "font-orbitron text-3xl font-black leading-none mb-2", style: { color: 'var(--neon-cyan)', textShadow: '0 0 20px rgba(0,245,255,0.5)' }, children: metrics.total_transactions || 0 }), _jsxs("div", { className: "text-xs font-semibold text-text-dim", children: ["Avg: Rp ", Number(metrics.avg_order_value || 0).toLocaleString()] }), _jsx(TrendingUp, { className: "absolute right-4 top-1/2 -translate-y-1/2 text-3xl opacity-[0.07]" })] }), _jsxs(Card, { glow: "orange", className: "relative overflow-hidden cursor-pointer hover:-translate-y-1", children: [_jsx("div", { className: "absolute top-0 left-0 right-0 h-[2px]", style: { background: 'var(--neon-orange)', boxShadow: '0 0 12px var(--neon-orange)' } }), _jsx("div", { className: "text-xs font-semibold tracking-[2px] uppercase text-text-dim mb-2", children: "Stok Kritis" }), _jsx("div", { className: "font-orbitron text-3xl font-black leading-none mb-2", style: { color: 'var(--neon-orange)', textShadow: '0 0 20px rgba(255,107,0,0.5)' }, children: metrics.critical_stock || 0 }), _jsx("div", { className: "text-xs font-semibold text-text-dim", children: "Produk perlu restock" }), _jsx(AlertTriangle, { className: "absolute right-4 top-1/2 -translate-y-1/2 text-3xl opacity-[0.07]" })] }), _jsxs(Card, { glow: "green", className: "relative overflow-hidden cursor-pointer hover:-translate-y-1", children: [_jsx("div", { className: "absolute top-0 left-0 right-0 h-[2px]", style: { background: 'var(--neon-green)', boxShadow: '0 0 12px var(--neon-green)' } }), _jsx("div", { className: "text-xs font-semibold tracking-[2px] uppercase text-text-dim mb-2", children: "Pengiriman Aktif" }), _jsx("div", { className: "font-orbitron text-3xl font-black leading-none mb-2", style: { color: 'var(--neon-green)', textShadow: '0 0 20px rgba(57,255,20,0.4)' }, children: metrics.active_deliveries || 0 }), _jsx("div", { className: "text-xs font-semibold text-text-dim", children: "Hari ini" }), _jsx(Truck, { className: "absolute right-4 top-1/2 -translate-y-1/2 text-3xl opacity-[0.07]" })] })] }), lowStockProducts.length > 0 && (_jsx(Card, { title: "PRODUK STOK MINIMUM", glow: "orange", children: _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "SKU" }), _jsx("th", { children: "Nama" }), _jsx("th", { children: "Stok" }), _jsx("th", { children: "Min" })] }) }), _jsx("tbody", { children: lowStockProducts.map((p) => (_jsxs("tr", { children: [_jsx("td", { className: "font-mono text-xs", children: p.sku }), _jsx("td", { children: p.nama }), _jsx("td", { className: "text-[var(--neon-orange)] font-bold", children: p.stok }), _jsx("td", { children: p.stok_minimum })] }, p.id))) })] }) })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(Card, { title: "REVENUE 8 BULAN TERAKHIR", glow: "cyan", children: _jsx(NeonLineChart, { data: charts.revenue_series || [] }) }), _jsx(Card, { title: "TOP 7 PRODUK TERLARIS", glow: "cyan", children: _jsx(NeonBarChart, { data: charts.top_products || [] }) }), _jsx(Card, { title: "STATUS ORDER HARI INI", glow: "cyan", children: _jsx(NeonDonutChart, { data: charts.order_status_dist || [] }) }), _jsx(Card, { title: "ABSENSI HARI INI", glow: "green", children: _jsx(NeonDonutChart, { data: charts.absensi_today || [] }) })] })] }));
};
export default DashboardPage;
