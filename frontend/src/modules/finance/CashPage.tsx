import React, { useEffect, useState } from 'react'
import { financeApi } from '../../api/finance'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { Plus } from 'lucide-react'

const CashPage: React.FC = () => {
  const [cash, setCash] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ tanggal: new Date().toISOString().slice(0,10), tipe: 'pemasukan', kategori: '', jumlah: 0, keterangan: '' })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await financeApi.getCashList()
      setCash(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async () => {
    try {
      await financeApi.createCash(form)
      setShowForm(false)
      setForm({ tanggal: new Date().toISOString().slice(0,10), tipe: 'pemasukan', kategori: '', jumlah: 0, keterangan: '' })
      fetchData()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal menyimpan')
    }
  }

  return (
    <Card title="KAS & BIAYA" glow="cyan">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-1" /> CATAT TRANSAKSI</Button>
      </div>
      <table className="table-neon w-full">
        <thead>
          <tr><th>Tanggal</th><th>Tipe</th><th>Kategori</th><th>Jumlah</th><th>Keterangan</th></tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={5} className="text-center py-4 text-text-dim">MEMUAT...</td></tr>}
          {!loading && cash.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-text-dim">BELUM ADA DATA</td></tr>}
          {cash.map(item => (
            <tr key={item.id}>
              <td>{item.tanggal}</td>
              <td><span className={`tag ${item.tipe === 'pemasukan' ? 'tag-green' : 'tag-pink'}`}>{item.tipe}</span></td>
              <td>{item.kategori}</td>
              <td className="font-bold">Rp {Number(item.jumlah).toLocaleString()}</td>
              <td className="text-text-dim">{item.keterangan || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="CATAT TRANSAKSI KAS" onConfirm={handleSave} confirmText="SIMPAN">
        <div className="space-y-3">
          <Input label="Tanggal" type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} />
          <div>
            <label className="text-xs font-semibold uppercase text-text-dim">Tipe</label>
            <select value={form.tipe} onChange={e => setForm({...form, tipe: e.target.value})} className="input-neon w-full mt-1">
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </select>
          </div>
          <Input label="Kategori" value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value})} placeholder="Listrik, Gaji, Transport, dll." />
          <Input label="Jumlah" type="number" value={form.jumlah} onChange={e => setForm({...form, jumlah: parseFloat(e.target.value) || 0})} />
          <Input label="Keterangan" value={form.keterangan} onChange={e => setForm({...form, keterangan: e.target.value})} />
        </div>
      </Modal>
    </Card>
  )
}

export default CashPage