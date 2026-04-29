import React, { useEffect, useState } from 'react'
import { kategoriApi, satuanApi } from '../../api/master'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { Plus, Edit, Trash2 } from 'lucide-react'

const KategoriSatuanList: React.FC = () => {
  const [kategori, setKategori] = useState<any[]>([])
  const [satuan, setSatuan] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Kategori state
  const [showKategoriForm, setShowKategoriForm] = useState(false)
  const [editKategoriId, setEditKategoriId] = useState<string | null>(null)
  const [kategoriNama, setKategoriNama] = useState('')
  const [kategoriDeskripsi, setKategoriDeskripsi] = useState('')
  const [deleteKategoriId, setDeleteKategoriId] = useState<string | null>(null)

  // Satuan state
  const [showSatuanForm, setShowSatuanForm] = useState(false)
  const [editSatuanId, setEditSatuanId] = useState<string | null>(null)
  const [satuanNama, setSatuanNama] = useState('')
  const [deleteSatuanId, setDeleteSatuanId] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [kRes, sRes] = await Promise.all([kategoriApi.getAll(), satuanApi.getAll()])
      setKategori(kRes.data)
      setSatuan(sRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // ---------- KATEGORI CRUD ----------
  const handleSaveKategori = async () => {
    if (!kategoriNama) return
    if (editKategoriId) {
      await kategoriApi.update(editKategoriId, { nama: kategoriNama, deskripsi: kategoriDeskripsi })
    } else {
      await kategoriApi.create({ nama: kategoriNama, deskripsi: kategoriDeskripsi })
    }
    setShowKategoriForm(false)
    setEditKategoriId(null)
    setKategoriNama('')
    setKategoriDeskripsi('')
    fetchData()
  }

  const handleEditKategori = (item: any) => {
    setEditKategoriId(item.id)
    setKategoriNama(item.nama)
    setKategoriDeskripsi(item.deskripsi || '')
    setShowKategoriForm(true)
  }

  const handleDeleteKategori = async () => {
    if (!deleteKategoriId) return
    await kategoriApi.delete(deleteKategoriId)
    setDeleteKategoriId(null)
    fetchData()
  }

  // ---------- SATUAN CRUD ----------
  const handleSaveSatuan = async () => {
    if (!satuanNama) return
    if (editSatuanId) {
      await satuanApi.update(editSatuanId, { nama: satuanNama })
    } else {
      await satuanApi.create({ nama: satuanNama })
    }
    setShowSatuanForm(false)
    setEditSatuanId(null)
    setSatuanNama('')
    fetchData()
  }

  const handleEditSatuan = (item: any) => {
    setEditSatuanId(item.id)
    setSatuanNama(item.nama)
    setShowSatuanForm(true)
  }

  const handleDeleteSatuan = async () => {
    if (!deleteSatuanId) return
    await satuanApi.delete(deleteSatuanId)
    setDeleteSatuanId(null)
    fetchData()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Kolom Kategori */}
      <Card title="KATEGORI" glow="cyan">
        <div className="flex justify-end mb-2">
          <Button onClick={() => { setShowKategoriForm(true); setEditKategoriId(null); setKategoriNama(''); setKategoriDeskripsi('') }}>
            <Plus className="w-4 h-4 mr-1" /> TAMBAH
          </Button>
        </div>
        <table className="table-neon w-full">
          <thead>
            <tr><th>Nama</th><th>Deskripsi</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {kategori.map(item => (
              <tr key={item.id}>
                <td>{item.nama}</td>
                <td className="text-text-dim">{item.deskripsi || '-'}</td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditKategori(item)} className="text-neon-cyan"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteKategoriId(item.id)} className="text-[var(--neon-pink)]"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Kolom Satuan */}
      <Card title="SATUAN" glow="cyan">
        <div className="flex justify-end mb-2">
          <Button onClick={() => { setShowSatuanForm(true); setEditSatuanId(null); setSatuanNama('') }}>
            <Plus className="w-4 h-4 mr-1" /> TAMBAH
          </Button>
        </div>
        <table className="table-neon w-full">
          <thead>
            <tr><th>Nama</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {satuan.map(item => (
              <tr key={item.id}>
                <td>{item.nama}</td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditSatuan(item)} className="text-neon-cyan"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteSatuanId(item.id)} className="text-[var(--neon-pink)]"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Modal Kategori */}
      <Modal open={showKategoriForm} onClose={() => setShowKategoriForm(false)} title={editKategoriId ? 'EDIT KATEGORI' : 'TAMBAH KATEGORI'} onConfirm={handleSaveKategori} confirmText="SIMPAN">
        <Input label="Nama" value={kategoriNama} onChange={e => setKategoriNama(e.target.value)} className="mb-2" />
        <Input label="Deskripsi" value={kategoriDeskripsi} onChange={e => setKategoriDeskripsi(e.target.value)} />
      </Modal>
      <Modal open={!!deleteKategoriId} onClose={() => setDeleteKategoriId(null)} title="HAPUS KATEGORI" onConfirm={handleDeleteKategori} confirmText="HAPUS" confirmVariant="danger">
        Yakin ingin menghapus kategori ini?
      </Modal>

      {/* Modal Satuan */}
      <Modal open={showSatuanForm} onClose={() => setShowSatuanForm(false)} title={editSatuanId ? 'EDIT SATUAN' : 'TAMBAH SATUAN'} onConfirm={handleSaveSatuan} confirmText="SIMPAN">
        <Input label="Nama" value={satuanNama} onChange={e => setSatuanNama(e.target.value)} />
      </Modal>
      <Modal open={!!deleteSatuanId} onClose={() => setDeleteSatuanId(null)} title="HAPUS SATUAN" onConfirm={handleDeleteSatuan} confirmText="HAPUS" confirmVariant="danger">
        Yakin ingin menghapus satuan ini?
      </Modal>
    </div>
  )
}

export default KategoriSatuanList