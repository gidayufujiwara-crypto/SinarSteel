import React, { useEffect, useState } from 'react'
import { kategoriApi } from '../../api/master'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { Plus, Edit, Trash2 } from 'lucide-react'

const KategoriList: React.FC = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [nama, setNama] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await kategoriApi.getAll()
      setData(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async () => {
    try {
      if (editId) await kategoriApi.update(editId, { nama, deskripsi })
      else await kategoriApi.create({ nama, deskripsi })
      setShowForm(false)
      setNama('')
      setDeskripsi('')
      setEditId(null)
      fetchData()
    } catch (err) { console.error(err) }
  }

  const handleEdit = (item: any) => {
    setEditId(item.id)
    setNama(item.nama)
    setDeskripsi(item.deskripsi || '')
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await kategoriApi.delete(deleteId)
    setDeleteId(null)
    fetchData()
  }

  return (
    <Card title="DAFTAR KATEGORI" glow="cyan">
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setShowForm(true); setEditId(null); setNama(''); setDeskripsi('') }}>
          <Plus className="w-4 h-4 mr-1" /> TAMBAH
        </Button>
      </div>
      <table className="table-neon w-full">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Deskripsi</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={3} className="text-center py-4 text-text-dim">MEMUAT...</td></tr>}
          {!loading && data.length === 0 && <tr><td colSpan={3} className="text-center py-4 text-text-dim">TIDAK ADA DATA</td></tr>}
          {data.map(item => (
            <tr key={item.id}>
              <td>{item.nama}</td>
              <td className="text-text-dim">{item.deskripsi || '-'}</td>
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
        <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'EDIT KATEGORI' : 'TAMBAH KATEGORI'} onConfirm={handleSave} confirmText="SIMPAN">
          <Input label="Nama" value={nama} onChange={e => setNama(e.target.value)} className="mb-2" />
          <Input label="Deskripsi" value={deskripsi} onChange={e => setDeskripsi(e.target.value)} />
        </Modal>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="HAPUS KATEGORI" onConfirm={handleDelete} confirmText="HAPUS" confirmVariant="danger">
        Yakin ingin menghapus kategori ini?
      </Modal>
    </Card>
  )
}

export default KategoriList