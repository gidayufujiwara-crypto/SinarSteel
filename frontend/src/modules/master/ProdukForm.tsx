import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { produkApi, kategoriApi, supplierApi, satuanApi, pelangganApi } from '../../api/master'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { ArrowLeft, Plus } from 'lucide-react'

const ProdukForm: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    sku: '', nama: '', deskripsi: '', barcode: '', kategori_id: '',
    supplier_id: '', satuan_id: '', harga_beli: '', harga_jual: '',
    stok: '0', stok_minimum: 5, is_active: true, hpp_rata_rata: 0,
  })
  const [kategori, setKategori] = useState<any[]>([])
  const [supplier, setSupplier] = useState<any[]>([])
  const [satuan, setSatuan] = useState<any[]>([])
  const [pelanggan, setPelanggan] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Quick-add state
  const [quickAddType, setQuickAddType] = useState<string | null>(null)
  const [quickAddNama, setQuickAddNama] = useState('')
  const [quickAddCode, setQuickAddCode] = useState('')  // for supplier/pelanggan kode

  useEffect(() => {
    const load = async () => {
      const [kRes, sRes, satRes, pRes] = await Promise.all([
        kategoriApi.getAll(), supplierApi.getAll(), satuanApi.getAll(), pelangganApi.getAll()
      ])
      setKategori(kRes.data)
      setSupplier(sRes.data)
      setSatuan(satRes.data)
      setPelanggan(pRes.data)
      if (id) {
        const res = await produkApi.getById(id)
        const d = res.data
        setForm({
          sku: d.sku, nama: d.nama, deskripsi: d.deskripsi || '', barcode: d.barcode || '',
          kategori_id: d.kategori_id || '', supplier_id: d.supplier_id || '', satuan_id: d.satuan_id || '',
          harga_beli: d.harga_beli?.toString() || '', harga_jual: d.harga_jual?.toString() || '',
          stok: d.stok?.toString() || '0', stok_minimum: d.stok_minimum ?? 5, is_active: d.is_active, hpp_rata_rata: d.hpp_rata_rata || 0,
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
      stok: parseInt(form.stok),
      stok_minimum: parseInt(form.stok_minimum.toString()),
      kategori_id: form.kategori_id || null,
      supplier_id: form.supplier_id || null,
      satuan_id: form.satuan_id || null,
    }
    delete (payload as any).hpp_rata_rata
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

  // Quick‑add logic
  const openQuickAdd = (type: string) => {
    setQuickAddType(type)
    setQuickAddNama('')
    setQuickAddCode('')
  }

  const handleQuickAdd = async () => {
    if (!quickAddNama) return
    try {
      if (quickAddType === 'kategori') {
        await kategoriApi.create({ nama: quickAddNama })
        const res = await kategoriApi.getAll()
        setKategori(res.data)
      } else if (quickAddType === 'satuan') {
        await satuanApi.create({ nama: quickAddNama })
        const res = await satuanApi.getAll()
        setSatuan(res.data)
      } else if (quickAddType === 'supplier') {
        await supplierApi.create({ kode: quickAddCode, nama: quickAddNama })
        const res = await supplierApi.getAll()
        setSupplier(res.data)
      } else if (quickAddType === 'pelanggan') {
        await pelangganApi.create({ kode: quickAddCode, nama: quickAddNama })
        const res = await pelangganApi.getAll()
        setPelanggan(res.data)
      }
      setQuickAddType(null)
    } catch (err) {
      console.error(err)
    }
  }

  // Helper: render dropdown with quick‑add button
  const renderDropdown = (label: string, name: string, value: string, options: any[], quickType: string) => (
    <div className="relative">
      <label className="text-xs font-semibold tracking-[1px] uppercase text-text-dim">{label}</label>
      <div className="flex gap-1 items-center">
        <select
          name={name}
          value={value}
          onChange={handleChange}
          className="input-neon w-full mt-1"
        >
          <option value="">-- Pilih --</option>
          {options.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.nama || opt.name}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => openQuickAdd(quickType)}
          className="p-1 text-neon-cyan hover:text-neon-cyan/80"
          title={`Tambah ${label}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

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
          {renderDropdown('Kategori', 'kategori_id', form.kategori_id, kategori, 'kategori')}
          {renderDropdown('Supplier', 'supplier_id', form.supplier_id, supplier, 'supplier')}
          {renderDropdown('Satuan', 'satuan_id', form.satuan_id, satuan, 'satuan')}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input label="Harga Beli" name="harga_beli" type="number" step="0.01" value={form.harga_beli} onChange={handleChange} required />
          <Input label="Harga Jual" name="harga_jual" type="number" step="0.01" value={form.harga_jual} onChange={handleChange} required />
          <Input label="Stok" name="stok" type="number" step="1" value={form.stok} onChange={handleChange} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Stok Minimum" name="stok_minimum" type="number" value={form.stok_minimum} onChange={handleChange} />
          {id && form.hpp_rata_rata > 0 && (
            <div className="flex items-end pb-1">
              <p className="text-xs text-text-dim">
                HPP Rata‑rata: <span className="text-[var(--neon-orange)]">Rp {Number(form.hpp_rata_rata).toLocaleString()}</span>
              </p>
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-text-dim cursor-pointer">
          <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="accent-[var(--neon-cyan)]" />
          AKTIF
        </label>

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={loading}>SIMPAN</Button>
          <Button variant="secondary" type="button" onClick={() => navigate('/master/produk')}>BATAL</Button>
        </div>
      </form>

      {/* Quick Add Modal */}
      <Modal
        open={!!quickAddType}
        onClose={() => setQuickAddType(null)}
        title={`TAMBAH ${quickAddType?.toUpperCase()}`}
        onConfirm={handleQuickAdd}
        confirmText="SIMPAN"
      >
        <div className="space-y-3">
          {(quickAddType === 'supplier' || quickAddType === 'pelanggan') && (
            <Input
              label="Kode"
              value={quickAddCode}
              onChange={e => setQuickAddCode(e.target.value)}
              required
            />
          )}
          <Input
            label="Nama"
            value={quickAddNama}
            onChange={e => setQuickAddNama(e.target.value)}
            required
            autoFocus
          />
        </div>
      </Modal>
    </Card>
  )
}

export default ProdukForm