import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { produkApi, kategoriApi, supplierApi, satuanApi } from '../../api/master'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { ArrowLeft } from 'lucide-react'

const ProdukForm: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    sku: '', nama: '', deskripsi: '', barcode: '', kategori_id: '',
    supplier_id: '', satuan_id: '', harga_beli: '', harga_jual: '', hpp_rata_rata: 0, stok_minimum: 5, is_active: true,
  })
  const [kategori, setKategori] = useState<any[]>([])
  const [supplier, setSupplier] = useState<any[]>([])
  const [satuan, setSatuan] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const [kRes, sRes, satRes] = await Promise.all([
        kategoriApi.getAll(), supplierApi.getAll(), satuanApi.getAll()
      ])
      setKategori(kRes.data)
      setSupplier(sRes.data)
      setSatuan(satRes.data)
      if (id) {
        const res = await produkApi.getById(id)
        const d = res.data
        setForm({
          sku: d.sku, nama: d.nama, deskripsi: d.deskripsi || '', barcode: d.barcode || '',
          kategori_id: d.kategori_id || '', supplier_id: d.supplier_id || '', satuan_id: d.satuan_id || '',
          harga_beli: d.harga_beli?.toString() || '', harga_jual: d.harga_jual?.toString() || '',
          hpp_rata_rata: d.hpp_rata_rata || 0, stok_minimum: d.stok_minimum ?? 5, is_active: d.is_active,
        })
      }
    }
    load()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      ...form,
      harga_beli: parseFloat(form.harga_beli),
      harga_jual: parseFloat(form.harga_jual),
      stok_minimum: parseInt(form.stok_minimum.toString()),
      kategori_id: form.kategori_id || null,
      supplier_id: form.supplier_id || null,
      satuan_id: form.satuan_id || null,
      hpp_rata_rata: undefined, // jangan kirim hpp_rata_rata karena readonly
    }
    try {
      if (id) {
        await produkApi.update(id, payload)
      } else {
        await produkApi.create(payload)
      }
      navigate('/master/produk')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title={id ? 'EDIT PRODUK' : 'TAMBAH PRODUK'} glow="cyan">
      <button onClick={() => navigate('/master/produk')} className="flex items-center gap-1 text-text-dim hover:text-neon-cyan mb-4">
        <ArrowLeft className="w-4 h-4" /> KEMBALI
      </button>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <Input label="SKU" name="sku" value={form.sku} onChange={handleChange} required />
          <Input label="Barcode" name="barcode" value={form.barcode} onChange={handleChange} />
        </div>
        <Input label="Nama Produk" name="nama" value={form.nama} onChange={handleChange} required />
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold tracking-[1px] uppercase text-text-dim">Kategori</label>
            <select name="kategori_id" value={form.kategori_id} onChange={handleChange} className="input-neon w-full mt-1">
              <option value="">-- Pilih --</option>
              {kategori.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold tracking-[1px] uppercase text-text-dim">Supplier</label>
            <select name="supplier_id" value={form.supplier_id} onChange={handleChange} className="input-neon w-full mt-1">
              <option value="">-- Pilih --</option>
              {supplier.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold tracking-[1px] uppercase text-text-dim">Satuan</label>
            <select name="satuan_id" value={form.satuan_id} onChange={handleChange} className="input-neon w-full mt-1">
              <option value="">-- Pilih --</option>
              {satuan.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input label="Harga Beli" name="harga_beli" type="number" step="0.01" value={form.harga_beli} onChange={handleChange} required />
            {id && form.hpp_rata_rata > 0 && (
              <p className="text-xs text-text-dim mt-1">
                HPP Rata‑rata saat ini: <span className="text-[var(--neon-orange)]">Rp {Number(form.hpp_rata_rata).toLocaleString()}</span>
              </p>
            )}
          </div>
          <Input label="Harga Jual" name="harga_jual" type="number" step="0.01" value={form.harga_jual} onChange={handleChange} required />
        </div>
        <Input label="Stok Minimum" name="stok_minimum" type="number" value={form.stok_minimum} onChange={handleChange} />
        <label className="flex items-center gap-2 text-sm font-semibold text-text-dim cursor-pointer">
          <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="accent-[var(--neon-cyan)]" />
          AKTIF
        </label>
        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={loading}>SIMPAN</Button>
          <Button variant="secondary" type="button" onClick={() => navigate('/master/produk')}>BATAL</Button>
        </div>
      </form>
    </Card>
  )
}

export default ProdukForm