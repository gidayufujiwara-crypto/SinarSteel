import React, { useEffect, useState } from 'react'
import { financeApi } from '../../api/finance'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const ReportPage: React.FC = () => {
  const now = new Date()
  const [bulan, setBulan] = useState(now.getMonth() + 1)
  const [tahun, setTahun] = useState(now.getFullYear())
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await financeApi.getProfitLoss(bulan, tahun)
      setData(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  return (
    <Card title="LAPORAN LABA RUGI PER PRODUK" glow="cyan">
      <div className="flex gap-4 mb-4 items-center">
        <select value={bulan} onChange={e => setBulan(parseInt(e.target.value))} className="input-neon w-24">
          {Array.from({length:12},(_,i)=>i+1).map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <Input type="number" value={tahun} onChange={e => setTahun(parseInt(e.target.value))} className="w-24" />
        <Button onClick={fetchData}>TAMPILKAN</Button>
      </div>
      <table className="table-neon w-full">
        <thead>
          <tr><th>Produk</th><th>Pendapatan</th><th>HPP</th><th>Laba Kotor</th></tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={4} className="text-center py-4 text-text-dim">MEMUAT...</td></tr>}
          {!loading && data.length === 0 && <tr><td colSpan={4} className="text-center py-4 text-text-dim">BELUM ADA DATA</td></tr>}
          {data.map((item, idx) => (
            <tr key={idx}>
              <td>{item.nama_produk || '-'}</td>
              <td>Rp {Number(item.total_pendapatan || 0).toLocaleString()}</td>
              <td>Rp {Number(item.total_hpp || 0).toLocaleString()}</td>
              <td className={`font-bold ${Number(item.laba_kotor) >= 0 ? 'text-neon-green' : 'text-neon-pink'}`}>
                Rp {Number(item.laba_kotor || 0).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export default ReportPage