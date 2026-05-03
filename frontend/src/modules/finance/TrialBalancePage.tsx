import React, { useEffect, useState } from 'react'
import { financeApi } from '../../api/finance'
import Card from '../../components/ui/Card'

const TrialBalancePage: React.FC = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await financeApi.getTrialBalance()
      setData(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  return (
    <Card title="NERACA SALDO" glow="cyan">
      <table className="table-neon w-full">
        <thead>
          <tr><th>Kode</th><th>Nama Akun</th><th>Debit</th><th>Kredit</th><th>Saldo Debit</th><th>Saldo Kredit</th></tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={6} className="text-center py-4 text-text-dim">MEMUAT...</td></tr>}
          {!loading && data.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-text-dim">BELUM ADA DATA</td></tr>}
          {data.map(item => (
            <tr key={item.kode}>
              <td className="font-mono">{item.kode}</td>
              <td>{item.nama}</td>
              <td>Rp {Number(item.debit).toLocaleString()}</td>
              <td>Rp {Number(item.kredit).toLocaleString()}</td>
              <td>Rp {Number(item.saldo_debit).toLocaleString()}</td>
              <td>Rp {Number(item.saldo_kredit).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export default TrialBalancePage