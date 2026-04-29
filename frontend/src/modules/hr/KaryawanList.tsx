import React, { useEffect, useState } from 'react'
import { hrApi } from '../../api/hr'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { Plus, Edit, Trash2 } from 'lucide-react'

const KaryawanList: React.FC = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    nik: '', nama: '', alamat: '', telepon: '', tanggal_masuk: '', jabatan: '',
    gaji_pokok: 0, no_rek: '', bank: '', status_aktif: true,
  })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await hrApi.getKaryawan()
      setData(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSave = async () => {
    if (editId) await hrApi.updateKaryawan(editId, form)
    else await hrApi.createKaryawan(form)
    setShowForm(false)
    setEditId(null)
    setForm({ nik: '', nama: '', alamat: '', telepon: '', tanggal_masuk: '', jabatan: '', gaji_pokok: 0, no_rek: '', bank: '', status_aktif: true })
    fetchData()
  }

  const handleEdit = (item: any) => {
    setEditId(item.id)
    setForm({
      nik: item.nik, nama: item.nama, alamat: item.alamat || '', telepon: item.telepon || '',
      tanggal_masuk: item.tanggal_masuk || '', jabatan: item.jabatan || '',
      gaji_pokok: item.gaji_pokok || 0, no_rek: item.no_rek || '', bank: item.bank || '', status_aktif: item.status_aktif !== false,
    })
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await hrApi.deleteKaryawan(deleteId)
    setDeleteId(null)
    fetchData()
  }

  return (
    <Card title="DAFTAR KARYAWAN" glow="cyan">
      <div className="flex justify-end mb-4">
        <Button onClick={() => {
          setShowForm(true);
          setEditId(null);
          setForm({ nik: '', nama: '', alamat: '', telepon: '', tanggal_masuk: '', jabatan: '', gaji_pokok: 0, no_rek: '', bank: '', status_aktif: true });
        }}>
          <Plus className="w-4 h-4 mr-1" /> TAMBAH
        </Button>
      </div>

      <table className="table-neon w-full">
        <thead>
          <tr>
            <th>NIK</th>
            <th>Nama</th>
            <th>Jabatan</th>
            <th>Gaji Pokok</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={5} className="text-center py-4 text-text-dim">MEMUAT...</td></tr>}
          {!loading && data.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-text-dim">TIDAK ADA DATA</td></tr>}
          {data.map(item => (
            <tr key={item.id}>
              <td className="font-mono">{item.nik}</td>
              <td>{item.nama}</td>
              <td>{item.jabatan || '-'}</td>
              <td>Rp {Number(item.gaji_pokok).toLocaleString()}</td>
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

      {/* Modal Form Karyawan – 2 kolom */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editId ? 'EDIT KARYAWAN' : 'TAMBAH KARYAWAN'}
        onConfirm={handleSave}
        confirmText="SIMPAN"
      >
        <div className="grid grid-cols-2 gap-3">
          <Input label="NIK" name="nik" value={form.nik} onChange={handleChange} required />
          <Input label="Nama" name="nama" value={form.nama} onChange={handleChange} required />
          <Input label="Telepon" name="telepon" value={form.telepon} onChange={handleChange} />
          <Input label="Jabatan" name="jabatan" value={form.jabatan} onChange={handleChange} />
          <Input label="Gaji Pokok" name="gaji_pokok" type="number" value={form.gaji_pokok} onChange={handleChange} />
          <Input label="Tgl Masuk" name="tanggal_masuk" type="date" value={form.tanggal_masuk} onChange={handleChange} />
        </div>
        <Input label="Alamat" name="alamat" value={form.alamat} onChange={handleChange} className="mt-3" />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Input label="No Rekening" name="no_rek" value={form.no_rek} onChange={handleChange} />
          <Input label="Bank" name="bank" value={form.bank} onChange={handleChange} />
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-text-dim cursor-pointer mt-3">
          <input type="checkbox" name="status_aktif" checked={form.status_aktif} onChange={handleChange} className="accent-[var(--neon-cyan)]" />
          AKTIF
        </label>
      </Modal>

      {/* Modal Delete */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="HAPUS KARYAWAN"
        onConfirm={handleDelete}
        confirmText="HAPUS"
        confirmVariant="danger"
      >
        Yakin ingin menghapus karyawan ini?
      </Modal>
    </Card>
  )
}

export default KaryawanList