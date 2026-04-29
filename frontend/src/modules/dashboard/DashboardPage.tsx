import React, { useEffect, useState } from 'react'
import Card from '../../components/ui/Card'
import NeonLineChart from '../../components/charts/NeonLineChart'
import NeonBarChart from '../../components/charts/NeonBarChart'
import NeonDonutChart from '../../components/charts/NeonDonutChart'
import { reportApi } from '../../api/report'
import { produkApi } from '../../api/master'
import { DollarSign, TrendingUp, AlertTriangle, Truck } from 'lucide-react'

const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>({})
  const [charts, setCharts] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, chartsRes] = await Promise.all([
          reportApi.getDashboardMetrics(),
          reportApi.getDashboardCharts(),
        ])
        setMetrics(metricsRes.data)
        setCharts(chartsRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()

    // Fetch produk untuk stok minimum
    produkApi.getAll().then(res => {
      const low = res.data.filter((p: any) => p.is_active && p.stok <= p.stok_minimum)
      setLowStockProducts(low)
    }).catch(console.error)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-text-primary font-orbitron tracking-[2px] uppercase">
        DASHBOARD
      </h1>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Hari Ini */}
        <Card glow="cyan" className="relative overflow-hidden cursor-pointer hover:-translate-y-1">
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: 'var(--neon-cyan)', boxShadow: '0 0 12px var(--neon-cyan)' }} />
          <div className="text-xs font-semibold tracking-[2px] uppercase text-text-dim mb-2">
            Revenue Hari Ini
          </div>
          <div className="font-orbitron text-3xl font-black leading-none mb-2"
            style={{ color: 'var(--neon-cyan)', textShadow: '0 0 20px rgba(0,245,255,0.5)' }}>
            Rp {Number(metrics.revenue_today || 0).toLocaleString()}
          </div>
          <div className={`text-xs font-semibold flex items-center gap-1 ${metrics.growth_percent >= 0 ? 'text-neon-green' : 'text-neon-pink'}`}>
            {metrics.growth_percent >= 0 ? '▲' : '▼'} {Math.abs(metrics.growth_percent || 0).toFixed(1)}% dari kemarin
          </div>
          <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl opacity-[0.07]" />
        </Card>

        {/* Total Transaksi */}
        <Card glow="cyan" className="relative overflow-hidden cursor-pointer hover:-translate-y-1">
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: 'var(--neon-cyan)', boxShadow: '0 0 12px var(--neon-cyan)' }} />
          <div className="text-xs font-semibold tracking-[2px] uppercase text-text-dim mb-2">
            Transaksi Hari Ini
          </div>
          <div className="font-orbitron text-3xl font-black leading-none mb-2"
            style={{ color: 'var(--neon-cyan)', textShadow: '0 0 20px rgba(0,245,255,0.5)' }}>
            {metrics.total_transactions || 0}
          </div>
          <div className="text-xs font-semibold text-text-dim">
            Avg: Rp {Number(metrics.avg_order_value || 0).toLocaleString()}
          </div>
          <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl opacity-[0.07]" />
        </Card>

        {/* Stok Kritis */}
        <Card glow="orange" className="relative overflow-hidden cursor-pointer hover:-translate-y-1">
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: 'var(--neon-orange)', boxShadow: '0 0 12px var(--neon-orange)' }} />
          <div className="text-xs font-semibold tracking-[2px] uppercase text-text-dim mb-2">
            Stok Kritis
          </div>
          <div className="font-orbitron text-3xl font-black leading-none mb-2"
            style={{ color: 'var(--neon-orange)', textShadow: '0 0 20px rgba(255,107,0,0.5)' }}>
            {metrics.critical_stock || 0}
          </div>
          <div className="text-xs font-semibold text-text-dim">
            Produk perlu restock
          </div>
          <AlertTriangle className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl opacity-[0.07]" />
        </Card>

        {/* Pengiriman Aktif */}
        <Card glow="green" className="relative overflow-hidden cursor-pointer hover:-translate-y-1">
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: 'var(--neon-green)', boxShadow: '0 0 12px var(--neon-green)' }} />
          <div className="text-xs font-semibold tracking-[2px] uppercase text-text-dim mb-2">
            Pengiriman Aktif
          </div>
          <div className="font-orbitron text-3xl font-black leading-none mb-2"
            style={{ color: 'var(--neon-green)', textShadow: '0 0 20px rgba(57,255,20,0.4)' }}>
            {metrics.active_deliveries || 0}
          </div>
          <div className="text-xs font-semibold text-text-dim">
            Hari ini
          </div>
          <Truck className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl opacity-[0.07]" />
        </Card>
      </div>

      {/* Produk Stok Minimum */}
      {lowStockProducts.length > 0 && (
        <Card title="PRODUK STOK MINIMUM" glow="orange">
          <table className="table-neon w-full">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nama</th>
                <th>Stok</th>
                <th>Min</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((p: any) => (
                <tr key={p.id}>
                  <td className="font-mono text-xs">{p.sku}</td>
                  <td>{p.nama}</td>
                  <td className="text-[var(--neon-orange)] font-bold">{p.stok}</td>
                  <td>{p.stok_minimum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* BOTTOM ROW: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="REVENUE 8 BULAN TERAKHIR" glow="cyan">
          <NeonLineChart data={charts.revenue_series || []} />
        </Card>
        <Card title="TOP 7 PRODUK TERLARIS" glow="cyan">
          <NeonBarChart data={charts.top_products || []} />
        </Card>
        <Card title="STATUS ORDER HARI INI" glow="cyan">
          <NeonDonutChart data={charts.order_status_dist || []} />
        </Card>
        <Card title="ABSENSI HARI INI" glow="green">
          <NeonDonutChart data={charts.absensi_today || []} />
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage