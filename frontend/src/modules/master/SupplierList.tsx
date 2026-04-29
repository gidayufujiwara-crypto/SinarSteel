import React, { useEffect, useState } from 'react'
import { supplierApi } from '../../api/master'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

const SupplierList: React.FC = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ kode: '', nama: '', alamat: '', telepon: '', email: '' })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await supplierApi.getAll(search || undefined)
      setData(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [search])

  const handleSave = async () => {
    try {
      if (editId) await supplierApi.update(editId, form)
      else await supplierApi.create(form)
      setShowForm(false)
      setForm({ kode: '', nama: '', alamat: '', telepon: '', email: '' })
      setEditId(null)
      fetchData()
    } catch (err) { console.error(err) }
  }

  const handleEdit = (item: any) => {
    setEditId(item.id)
    setForm({ kode: item.kode, nama: item.nama, alamat: item.alamat || '', telepon: item.telepon || '', email: item.email || '' })
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await supplierApi.delete(deleteId)
    setDeleteId(null)
    fetchData()
  }

  return (
    <Card title="DAFTAR SUPPLIER" glow="cyan">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-text-dim" />
          <Input placeholder="Cari kode/nama..." value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
        </div>
        <Button onClick={() => { setShowForm(true); setEditId(null); setForm({ kode: '', nama: '', alamat: '', telepon: '', email: '' }) }}>
          <Plus className="w-4 h-4 mr-1" /> TAMBAH
        </Button>
      </div>
      <table className="table-neon w-full">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama</th>
            <th>Telepon</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={4} className="text-center py-4 text-text-dim">MEMUAT...</td></tr>}
          {!loading && data.length === 0 && <tr><td colSpan={4} className="text-center py-4 text-text-dim">TIDAK ADA DATA</td></tr>}
          {data.map(item => (
            <tr key={item.id}>
              <td className="font-mono">{item.kode}</td>
              <td>{item.nama}</td>
              <td>{item.telepon || '-'}</td>
              <td>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(item)} className="text-neon-cyan hover:text-neon-cyan/80"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteId(item.id)} className="text-[var(--neon-pink)] hover:text-[var(--neon-pink)]/80"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'EDIT SUPPLIER' : 'TAMBAH SUPPLIER'} onConfirm={handleSave} confirmText="SIMPAN">
          <div className="space-y-2">
            <Input label="Kode" value={form.kode} onChange={e => setForm({...form, kode: e.target.value})} />
            <Input label="Nama" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} />
            <Input label="Alamat" value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})} />
            <Input label="Telepon" value={form.telepon} onChange={e => setForm({...form, telepon: e.target.value})} />
            <Input label="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
        </Modal>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="HAPUS SUPPLIER" onConfirm={handleDelete} confirmText="HAPUS" confirmVariant="danger">
        Yakin ingin menghapus supplier ini?
      </Modal>
    </Card>
  )
}

export default SupplierList