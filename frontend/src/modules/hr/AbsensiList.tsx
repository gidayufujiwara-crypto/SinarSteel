import React, { useEffect, useState } from 'react'
import { hrApi } from '../../api/hr'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'

const AbsensiList: React.FC = () => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [karyawanList, setKaryawanList] = useState<any[]>([])
  const [selectedKaryawan, setSelectedKaryawan] = useState('')
  const [bulan, setBulan] = useState(new Date().getMonth()+1)
  const [tahun, setTahun] = useState(new Date().getFullYear())

  useEffect(() => {
    hrApi.getKaryawan().then(res => setKaryawanList(res.data))
  }, [])

  const fetchAbsensi = async () => {
    if (!selectedKaryawan) return
    setLoading(true)
    try {
      const res = await hrApi.getAbsensi(selectedKaryawan, bulan, tahun)
      setData(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    fetchAbsensi()
  }, [selectedKaryawan, bulan, tahun])

  return (
    <Card title="DATA ABSENSI" glow="cyan">
      <div className="flex gap-4 mb-4 items-center">
        <select value={selectedKaryawan} onChange={e => setSelectedKaryawan(e.target.value)} className="input-neon w-48">
          <option value="">-- Pilih Karyawan --</option>
          {karyawanList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
        </select>
        <select value={bulan} onChange={e => setBulan(parseInt(e.target.value))} className="input-neon w-24">
          {Array.from({length:12},(_,i)=>i+1).map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <Input type="number" value={tahun} onChange={e => setTahun(parseInt(e.target.value))} className="w-24" />
      </div>
      <table className="table-neon w-full">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Jam Masuk</th>
            <th>Jam Pulang</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={4} className="text-center py-4 text-text-dim">MEMUAT...</td></tr>}
          {!loading && data.length === 0 && <tr><td colSpan={4} className="text-center py-4 text-text-dim">TIDAK ADA DATA</td></tr>}
          {data.map(item => (
            <tr key={item.id}>
              <td>{item.tanggal}</td>
              <td>{item.jam_masuk || '-'}</td>
              <td>{item.jam_pulang || '-'}</td>
              <td className={`tag ${item.status_hadir === 'hadir' ? 'tag-green' : item.status_hadir === 'terlambat' ? 'tag-orange' : 'tag-pink'}`}>
                {item.status_hadir}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export default AbsensiList