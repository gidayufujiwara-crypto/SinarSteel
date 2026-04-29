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
    stok: '0', stok_minimum: 5, is_active: true, hpp_rata_rata: 0, markup_persen: 0,
  })
  const [kategori, setKategori] = useState<any[]>([])
  const [supplier, setSupplier] = useState<any[]>([])
  const [satuan, setSatuan] = useState<any[]>([])
  const [pelanggan, setPelanggan] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Quick-add state
  const [quickAddType, setQuickAddType] = useState<string | null>(null)
  const [quickAddNama, setQuickAddNama] = useState('')
  const [quickAddCode, setQuickAddCode] = useState('')

  // State untuk penambahan stok (edit)
  const [tambahStok, setTambahStok] = useState('0')
  const [markupInput, setMarkupInput] = useState('0')

  const isEdit = Boolean(id)

  useEffect(() => {
    const load = async () => {
      try {
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
            stok: d.stok?.toString() || '0', stok_minimum: d.stok_minimum ?? 5, is_active: d.is_active,
            hpp_rata_rata: d.hpp_rata_rata || 0, markup_persen: d.markup_persen || 0,
          })
          if (d.hpp_rata_rata > 0 && d.harga_jual > 0) {
            const margin = ((d.harga_jual - d.hpp_rata_rata) / d.hpp_rata_rata) * 100
            setMarkupInput(margin.toFixed(2))
          }
        }
      } catch (err) {
        console.error('Gagal memuat data master', err)
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
    setErrorMsg(null)
    setLoading(true)

    if (isEdit) {
      const stokTambahan = parseInt(tambahStok) || 0
      const hargaBeli = parseFloat(form.harga_beli) || 0
      const markup = parseFloat(markupInput) || 0

      if (stokTambahan <= 0) {
        setErrorMsg('Tambah stok harus lebih dari 0')
        setLoading(false)
        return
      }

      try {
        await produkApi.updateStok(id!, stokTambahan, hargaBeli, markup)
        navigate('/master/produk')
      } catch (err: any) {
        setErrorMsg(err.response?.data?.detail || 'Gagal update stok')
      } finally {
        setLoading(false)
      }
    } else {
      const payload = {
        sku: form.sku,
        nama: form.nama,
        deskripsi: form.deskripsi || null,
        barcode: form.barcode || null,
        kategori_id: form.kategori_id || null,
        supplier_id: form.supplier_id || null,
        satuan_id: form.satuan_id || null,
        harga_beli: parseFloat(form.harga_beli) || 0,
        harga_jual: parseFloat(form.harga_jual) || 0,
        stok: parseInt(form.stok) || 0,
        stok_minimum: parseInt(form.stok_minimum.toString()) || 5,
        is_active: form.is_active,
        markup_persen: parseFloat(markupInput) || 0,
      }

      try {
        await produkApi.create(payload)
        navigate('/master/produk')
      } catch (err: any) {
        setErrorMsg(err.response?.data?.detail || 'Gagal menyimpan produk')
      } finally {
        setLoading(false)
      }
    }
  }

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
      alert('Gagal menambah data')
    }
  }

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
    <Card title={isEdit ? 'EDIT PRODUK & TAMBAH STOK' : 'TAMBAH PRODUK'} glow="cyan">
      <button onClick={() => navigate('/master/produk')} className="flex items-center gap-1 text-text-dim hover:text-neon-cyan mb-4">
        <ArrowLeft className="w-4 h-4" /> KEMBALI
      </button>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">{errorMsg}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <Input label="SKU" name="sku" value={form.sku} onChange={handleChange} required disabled={isEdit} />
          <Input label="Barcode" name="barcode" value={form.barcode} onChange={handleChange} disabled={isEdit} />
        </div>
        <Input label="Nama Produk" name="nama" value={form.nama} onChange={handleChange} required disabled={isEdit} />

        <div className="grid grid-cols-3 gap-4">
          {renderDropdown('Kategori', 'kategori_id', form.kategori_id, kategori, 'kategori')}
          {renderDropdown('Supplier', 'supplier_id', form.supplier_id, supplier, 'supplier')}
          {renderDropdown('Satuan', 'satuan_id', form.satuan_id, satuan, 'satuan')}
        </div>

        {isEdit ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-text-dim">Stok Saat Ini</label>
                <div className="input-neon bg-transparent">{form.stok}</div>
              </div>
              <Input label="Tambah Stok" type="number" value={tambahStok} onChange={e => setTambahStok(e.target.value)} min="1" required />
            </div>
            <Input label="Harga Beli (restock)" name="harga_beli" type="number" step="0.01" value={form.harga_beli} onChange={handleChange} required />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-text-dim">HPP Rata‑rata Saat Ini</label>
                <div className="input-neon bg-transparent">Rp {Number(form.hpp_rata_rata).toLocaleString()}</div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-text-dim">Harga Jual Saat Ini</label>
                <div className="input-neon bg-transparent">Rp {Number(form.harga_jual).toLocaleString()}</div>
              </div>
            </div>
            <Input
              label="Markup (%) dari HPP baru"
              type="number"
              step="0.01"
              value={markupInput}
              onChange={e => setMarkupInput(e.target.value)}
            />
            <p className="text-xs text-text-dim">
              Harga jual baru akan dihitung otomatis: <strong>HPP baru × (1 + Markup/100)</strong>
            </p>
          </>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Harga Beli" name="harga_beli" type="number" step="0.01" value={form.harga_beli} onChange={handleChange} required />
              <Input label="Harga Jual" name="harga_jual" type="number" step="0.01" value={form.harga_jual} onChange={handleChange} required />
              <Input label="Stok" name="stok" type="number" step="1" value={form.stok} onChange={handleChange} required />
            </div>
            <Input label="Stok Minimum" name="stok_minimum" type="number" value={form.stok_minimum} onChange={handleChange} />
            <Input
              label="Markup (%) awal"
              type="number"
              step="0.01"
              value={markupInput}
              onChange={e => setMarkupInput(e.target.value)}
            />
          </>
        )}

        <label className="flex items-center gap-2 text-sm font-semibold text-text-dim cursor-pointer">
          <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="accent-[var(--neon-cyan)]" />
          AKTIF
        </label>

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={loading}>{isEdit ? 'UPDATE STOK' : 'SIMPAN'}</Button>
          <Button variant="secondary" type="button" onClick={() => navigate('/master/produk')}>BATAL</Button>
        </div>
      </form>

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