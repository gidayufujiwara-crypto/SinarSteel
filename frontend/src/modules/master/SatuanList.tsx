import React, { useEffect, useState } from 'react'
import { satuanApi } from '../../api/master'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { Plus, Edit, Trash2 } from 'lucide-react'

const SatuanList: React.FC = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [nama, setNama] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try { const res = await satuanApi.getAll(); setData(res.data) } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async () => {
    try {
      if (editId) await satuanApi.update(editId, { nama })
      else await satuanApi.create({ nama })
      setShowForm(false)
      setNama('')
      setEditId(null)
      fetchData()
    } catch (err) { console.error(err) }
  }

  const handleEdit = (item: any) => {
    setEditId(item.id)
    setNama(item.nama)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await satuanApi.delete(deleteId)
    setDeleteId(null)
    fetchData()
  }

  return (
    <Card title="DAFTAR SATUAN" glow="cyan">
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setShowForm(true); setEditId(null); setNama('') }}>
          <Plus className="w-4 h-4 mr-1" /> TAMBAH
        </Button>
      </div>
      <table className="table-neon w-full">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={2} className="text-center py-4 text-text-dim">MEMUAT...</td></tr>}
          {!loading && data.length === 0 && <tr><td colSpan={2} className="text-center py-4 text-text-dim">TIDAK ADA DATA</td></tr>}
          {data.map(item => (
            <tr key={item.id}>
              <td>{item.nama}</td>
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
        <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'EDIT SATUAN' : 'TAMBAH SATUAN'} onConfirm={handleSave} confirmText="SIMPAN">
          <Input label="Nama" value={nama} onChange={e => setNama(e.target.value)} />
        </Modal>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="HAPUS SATUAN" onConfirm={handleDelete} confirmText="HAPUS" confirmVariant="danger">
        Yakin ingin menghapus satuan ini?
      </Modal>
    </Card>
  )
}

export default SatuanList