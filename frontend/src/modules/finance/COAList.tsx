import React, { useEffect, useState } from 'react'
import { financeApi } from '../../api/finance'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { Plus } from 'lucide-react'

const COAList: React.FC = () => {
  const [coa, setCOA] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ kode: '', nama: '', tipe: 'aset', saldo_normal: 'debit' })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await financeApi.getCOA()
      setCOA(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async () => {
    try {
      await financeApi.createCOA(form)
      setShowForm(false)
      setForm({ kode: '', nama: '', tipe: 'aset', saldo_normal: 'debit' })
      fetchData()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal menyimpan')
    }
  }

  return (
    <Card title="CHART OF ACCOUNTS" glow="cyan">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-1" /> TAMBAH AKUN</Button>
      </div>
      <table className="table-neon w-full">
        <thead>
          <tr><th>Kode</th><th>Nama</th><th>Tipe</th><th>Saldo Normal</th></tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={4} className="text-center py-4 text-text-dim">MEMUAT...</td></tr>}
          {coa.map(item => (
            <tr key={item.id}>
              <td className="font-mono">{item.kode}</td>
              <td>{item.nama}</td>
              <td><span className={`tag ${item.tipe === 'aset' ? 'tag-cyan' : item.tipe === 'beban' ? 'tag-pink' : 'tag-green'}`}>{item.tipe}</span></td>
              <td>{item.saldo_normal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="TAMBAH AKUN" onConfirm={handleSave} confirmText="SIMPAN">
        <div className="space-y-3">
          <Input label="Kode" value={form.kode} onChange={e => setForm({ ...form, kode: e.target.value })} required />
          <Input label="Nama" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required />
          <div>
            <label className="text-xs font-semibold uppercase text-text-dim">Tipe</label>
            <select value={form.tipe} onChange={e => setForm({ ...form, tipe: e.target.value })} className="input-neon w-full mt-1">
              <option value="aset">Aset</option>
              <option value="liabilitas">Liabilitas</option>
              <option value="ekuitas">Ekuitas</option>
              <option value="pendapatan">Pendapatan</option>
              <option value="beban">Beban</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-text-dim">Saldo Normal</label>
            <select value={form.saldo_normal} onChange={e => setForm({ ...form, saldo_normal: e.target.value })} className="input-neon w-full mt-1">
              <option value="debit">Debit</option>
              <option value="kredit">Kredit</option>
            </select>
          </div>
        </div>
      </Modal>
    </Card>
  )
}

export default COAList