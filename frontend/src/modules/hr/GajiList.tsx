import React, { useEffect, useState } from 'react'
import { hrApi } from '../../api/hr'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'

const GajiList: React.FC = () => {
  const [gaji, setGaji] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [bulan, setBulan] = useState(new Date().getMonth()+1)
  const [tahun, setTahun] = useState(new Date().getFullYear())
  const [showHitung, setShowHitung] = useState(false)
  const [karyawanList, setKaryawanList] = useState<any[]>([])
  const [selectedKaryawan, setSelectedKaryawan] = useState('')
  const [jamLembur, setJamLembur] = useState(0)
  const [tarifLembur, setTarifLembur] = useState(0)

  useEffect(() => {
    hrApi.getKaryawan().then(res => setKaryawanList(res.data))
  }, [])

  const fetchGaji = async () => {
    setLoading(true)
    try {
      const res = await hrApi.getGajiList(bulan, tahun)
      setGaji(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchGaji() }, [bulan, tahun])

  const handleHitungGaji = async () => {
    if (!selectedKaryawan) return
    try {
      await hrApi.hitungGaji({
        karyawan_id: selectedKaryawan,
        bulan,
        tahun,
        jam_lembur: jamLembur,
        tarif_lembur: tarifLembur,
      })
      setShowHitung(false)
      setSelectedKaryawan('')
      setJamLembur(0)
      setTarifLembur(0)
      fetchGaji()
    } catch (err) { console.error(err) }
  }

  return (
    <Card title="PENGGAJIAN" glow="cyan">
      <div className="flex justify-between mb-4">
        <div className="flex gap-4 items-center">
          <select value={bulan} onChange={e => setBulan(parseInt(e.target.value))} className="input-neon w-24">
            {Array.from({length:12},(_,i)=>i+1).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <Input type="number" value={tahun} onChange={e => setTahun(parseInt(e.target.value))} className="w-24" />
        </div>
        <Button onClick={() => setShowHitung(true)}>HITUNG GAJI</Button>
      </div>
      <table className="table-neon w-full">
        <thead>
          <tr>
            <th>Karyawan</th>
            <th>Gaji Pokok</th>
            <th>Jam Lembur</th>
            <th>Tarif Lembur</th>
            <th>Total Lembur</th>
            <th>Potongan</th>
            <th>Total Gaji</th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={7} className="text-center py-4 text-text-dim">MEMUAT...</td></tr>}
          {!loading && gaji.length === 0 && <tr><td colSpan={7} className="text-center py-4 text-text-dim">BELUM ADA PENGGAJIAN</td></tr>}
          {gaji.map(item => (
            <tr key={item.id}>
              <td className="text-text-dim text-xs">{item.karyawan_id?.substring(0,8)}</td>
              <td>Rp {Number(item.gaji_pokok).toLocaleString()}</td>
              <td>{item.jam_lembur} jam</td>
              <td>Rp {Number(item.tarif_lembur).toLocaleString()}</td>
              <td>Rp {Number(item.total_lembur).toLocaleString()}</td>
              <td>Rp {Number(item.potongan).toLocaleString()}</td>
              <td className="text-neon-green font-bold">Rp {Number(item.total_gaji).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={showHitung} onClose={() => setShowHitung(false)} title="HITUNG GAJI" onConfirm={handleHitungGaji} confirmText="PROSES">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold tracking-[1px] uppercase text-text-dim">Karyawan</label>
            <select value={selectedKaryawan} onChange={e => setSelectedKaryawan(e.target.value)} className="input-neon w-full mt-1">
              <option value="">-- Pilih --</option>
              {karyawanList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
          <Input label="Jam Lembur" type="number" value={jamLembur} onChange={e => setJamLembur(parseInt(e.target.value)||0)} />
          <Input label="Tarif Lembur (Rp)" type="number" value={tarifLembur} onChange={e => setTarifLembur(parseFloat(e.target.value)||0)} />
        </div>
      </Modal>
    </Card>
  )
}

export default GajiList