import React, { useEffect, useState } from 'react'
import { hrApi } from '../../api/hr'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { Plus } from 'lucide-react'

const JadwalShiftList: React.FC = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [karyawanList, setKaryawanList] = useState<any[]>([])
  const [form, setForm] = useState({ karyawan_id: '', tanggal: '', shift_ke: 'pagi', jam_mulai: '08:00', jam_selesai: '16:00' })
  const [filterKaryawan, setFilterKaryawan] = useState('')

  const fetchJadwal = async () => {
    if (!filterKaryawan) return
    setLoading(true)
    try {
      const start = new Date().toISOString().slice(0,10)
      const end = new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0,10)
      const res = await hrApi.getJadwal(filterKaryawan, start, end)
      setData(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    hrApi.getKaryawan().then(res => setKaryawanList(res.data))
  }, [])

  useEffect(() => {
    fetchJadwal()
  }, [filterKaryawan])

  const handleSave = async () => {
    await hrApi.createJadwal(form)
    setShowForm(false)
    fetchJadwal()
  }

  return (
    <Card title="JADWAL SHIFT" glow="cyan">
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-2">
          <select
            value={filterKaryawan}
            onChange={e => setFilterKaryawan(e.target.value)}
            className="input-neon w-48"
          >
            <option value="">-- Pilih Karyawan --</option>
            {karyawanList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
        </div>
        <Button onClick={() => { setShowForm(true); setForm({ karyawan_id: filterKaryawan, tanggal: '', shift_ke: 'pagi', jam_mulai: '08:00', jam_selesai: '16:00' }) }}>
          <Plus className="w-4 h-4 mr-1" /> TAMBAH
        </Button>
      </div>
      <table className="table-neon w-full">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Shift</th>
            <th>Jam Mulai</th>
            <th>Jam Selesai</th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={4} className="text-center py-4 text-text-dim">MEMUAT...</td></tr>}
          {!loading && data.length === 0 && <tr><td colSpan={4} className="text-center py-4 text-text-dim">TIDAK ADA JADWAL</td></tr>}
          {data.map(item => (
            <tr key={item.id}>
              <td>{item.tanggal}</td>
              <td>{item.shift_ke}</td>
              <td>{item.jam_mulai}</td>
              <td>{item.jam_selesai}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="TAMBAH JADWAL" onConfirm={handleSave} confirmText="SIMPAN">
        <div className="space-y-2">
          <div>
            <label className="text-xs font-semibold tracking-[1px] uppercase text-text-dim">Karyawan</label>
            <select
              value={form.karyawan_id}
              onChange={e => setForm({...form, karyawan_id: e.target.value})}
              className="input-neon w-full mt-1"
              required
            >
              <option value="">Pilih</option>
              {karyawanList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
          <Input label="Tanggal" type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} />
          <div>
            <label className="text-xs font-semibold tracking-[1px] uppercase text-text-dim">Shift</label>
            <select value={form.shift_ke} onChange={e => setForm({...form, shift_ke: e.target.value})} className="input-neon w-full mt-1">
              <option value="pagi">Pagi</option>
              <option value="sore">Sore</option>
              <option value="malam">Malam</option>
            </select>
          </div>
          <Input label="Jam Mulai" type="time" value={form.jam_mulai} onChange={e => setForm({...form, jam_mulai: e.target.value})} />
          <Input label="Jam Selesai" type="time" value={form.jam_selesai} onChange={e => setForm({...form, jam_selesai: e.target.value})} />
        </div>
      </Modal>
    </Card>
  )
}

export default JadwalShiftList