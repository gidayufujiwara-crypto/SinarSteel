import React, { useEffect, useState } from 'react'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { reportApi } from '../../api/report'
import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'

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

  const exportExcel = () => {
  const worksheet = XLSX.utils.json_to_sheet(
    sales.map((item: any) => ({
      'No Transaksi': item.no_transaksi,
      'Tanggal': new Date(item.tanggal).toLocaleDateString('id-ID'),
      'Kasir': item.kasir,
      'Pelanggan': item.pelanggan,
      'Total': Number(item.total),
      'Pembayaran': item.jenis_pembayaran,
    }))
  )
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Penjualan')
  XLSX.writeFile(workbook, `laporan_penjualan_${startDate}_${endDate}.xlsx`)
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
          <Button variant="secondary" onClick={exportExcel} disabled={sales.length === 0}>
            <Download className="w-4 h-4 mr-1" /> EXPORT EXCEL
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