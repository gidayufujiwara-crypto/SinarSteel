import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { deliveryApi } from '../../api/delivery'
import { pelangganApi } from '../../api/master'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { ArrowLeft } from 'lucide-react'

const DeliveryOrderForm: React.FC = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    pelanggan_id: '', nama_penerima: '', alamat_pengiriman: '', kota: '', telepon: '', nominal_cod: 0,
  })
  const [loading, setLoading] = useState(false)
  const [pelanggan, setPelanggan] = useState<any[]>([])

  useEffect(() => {
    pelangganApi.getAll().then(res => setPelanggan(res.data))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await deliveryApi.createOrder({
        ...form,
        nominal_cod: form.nominal_cod || null,
        pelanggan_id: form.pelanggan_id || null,
      })
      navigate('/delivery/orders')
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  return (
    <Card title="BUAT ORDER PENGIRIMAN" glow="cyan">
      <button onClick={() => navigate('/delivery/orders')} className="flex items-center gap-1 text-text-dim hover:text-neon-cyan mb-4">
        <ArrowLeft className="w-4 h-4" /> KEMBALI
      </button>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="text-xs font-semibold tracking-[1px] uppercase text-text-dim">Pelanggan</label>
          <select name="pelanggan_id" value={form.pelanggan_id} onChange={handleChange} className="input-neon w-full mt-1" required>
            <option value="">-- Pilih Pelanggan --</option>
            {pelanggan.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
          </select>
        </div>
        <Input label="Nama Penerima" name="nama_penerima" value={form.nama_penerima} onChange={handleChange} required />
        <Input label="Alamat" name="alamat_pengiriman" value={form.alamat_pengiriman} onChange={handleChange} required />
        <Input label="Kota" name="kota" value={form.kota} onChange={handleChange} required />
        <Input label="Telepon" name="telepon" value={form.telepon} onChange={handleChange} />
        <Input label="Nominal COD (opsional)" type="number" name="nominal_cod" value={form.nominal_cod} onChange={handleChange} />
        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={loading}>SIMPAN</Button>
          <Button variant="secondary" type="button" onClick={() => navigate('/delivery/orders')}>BATAL</Button>
        </div>
      </form>
    </Card>
  )
}

export default DeliveryOrderForm