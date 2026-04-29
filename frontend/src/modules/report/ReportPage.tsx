import React, { useEffect, useState } from 'react'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { reportApi } from '../../api/report'
import { Download } from 'lucide-react'

const ReportPage: React.FC = () => {
  const [sales, setSales] = useState<any[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchSales = async () => {
    setLoading(true)
    try {
      const res = await reportApi.getSalesReport({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })
      setSales(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchSales() }, [])

  const exportCSV = () => {
    let csv = 'No Transaksi,Tanggal,Kasir,Pelanggan,Total,Pembayaran\n'
    sales.forEach((item: any) => {
      csv += `${item.no_transaksi},${new Date(item.tanggal).toLocaleDateString('id-ID')},${item.kasir},${item.pelanggan},${Number(item.total).toFixed(2)},${item.jenis_pembayaran}\n`
    })
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `laporan_penjualan_${startDate}_${endDate}.csv`
    a.click()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary font-orbitron tracking-[2px] uppercase mb-6">
        LAPORAN PENJUALAN
      </h1>
      <Card glow="cyan">
        <div className="flex flex-wrap gap-4 mb-6 items-end">
          <Input label="Tanggal Mulai" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <Input label="Tanggal Akhir" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <Button onClick={fetchSales}>FILTER</Button>
          <Button variant="secondary" onClick={exportCSV} disabled={sales.length === 0}>
            <Download className="w-4 h-4 mr-1" /> EXPORT CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="table-neon w-full">
            <thead>
              <tr>
                <th>No Transaksi</th>
                <th>Tanggal</th>
                <th>Kasir</th>
                <th>Pelanggan</th>
                <th>Total</th>
                <th>Pembayaran</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-4 text-text-dim">MEMUAT...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-4 text-text-dim">TIDAK ADA DATA</td></tr>
              ) : (
                sales.map((item, idx) => (
                  <tr key={idx}>
                    <td className="font-mono">{item.no_transaksi}</td>
                    <td>{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className="text-text-dim">{item.kasir}</td>
                    <td>{item.pelanggan}</td>
                    <td>Rp {Number(item.total).toLocaleString()}</td>
                    <td>{item.jenis_pembayaran}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default ReportPage