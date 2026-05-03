import React, { useEffect, useState } from 'react'
import { financeApi } from '../../api/finance'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const LedgerPage: React.FC = () => {
  const [coa, setCOA] = useState<any[]>([])
  const [selectedAccount, setSelectedAccount] = useState('')
  const [ledger, setLedger] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    financeApi.getCOA().then(res => setCOA(res.data))
  }, [])

  const fetchLedger = async () => {
    if (!selectedAccount) return
    setLoading(true)
    try {
      const res = await financeApi.getLedger(selectedAccount, {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })
      setLedger(res.data)
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  return (
    <Card title="BUKU BESAR" glow="cyan">
      <div className="flex gap-4 mb-4 items-end">
        <div>
          <label className="text-xs font-semibold uppercase text-text-dim">Akun</label>
          <select
            value={selectedAccount}
            onChange={e => setSelectedAccount(e.target.value)}
            className="input-neon w-48"
          >
            <option value="">-- Pilih Akun --</option>
            {coa.map(a => <option key={a.id} value={a.id}>{a.kode} {a.nama}</option>)}
          </select>
        </div>
        <Input label="Dari" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <Input label="Sampai" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <Button onClick={fetchLedger}>TAMPILKAN</Button>
      </div>
      <table className="table-neon w-full">
        <thead>
          <tr><th>Tanggal</th><th>No Jurnal</th><th>Keterangan</th><th>Debit</th><th>Kredit</th><th>Saldo</th></tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={6} className="text-center py-4 text-text-dim">MEMUAT...</td></tr>}
          {!loading && ledger.length === 0 && selectedAccount && <tr><td colSpan={6} className="text-center py-4 text-text-dim">TIDAK ADA MUTASI</td></tr>}
          {ledger.map((line, idx) => (
            <tr key={idx}>
              <td>{line.tanggal}</td>
              <td className="font-mono text-xs">{line.no_jurnal}</td>
              <td>{line.keterangan || '-'}</td>
              <td>Rp {Number(line.debit).toLocaleString()}</td>
              <td>Rp {Number(line.kredit).toLocaleString()}</td>
              <td className="font-bold">Rp {Number(line.saldo).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export default LedgerPage