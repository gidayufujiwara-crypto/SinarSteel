import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { wmsApi } from '../../api/wms'
import { produkApi, supplierApi } from '../../api/master'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'

const PurchaseOrderForm: React.FC = () => {
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [items, setItems] = useState<{ produk_id: string; qty_order: number; harga_satuan: number }[]>([])
  const [catatan, setCatatan] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const [supRes, prodRes] = await Promise.all([
        supplierApi.getAll(),
        produkApi.getAll(),
      ])
      setSuppliers(supRes.data)
      setProducts(prodRes.data.filter((p: any) => p.is_active))
    }
    fetchData()
  }, [])

  const addItem = () => {
    setItems([...items, { produk_id: '', qty_order: 1, harga_satuan: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSupplier) { alert('Pilih supplier'); return }
    if (items.length === 0) { alert('Tambah setidaknya satu item'); return }
    const payload = {
      supplier_id: selectedSupplier,
      items: items.map(it => ({
        produk_id: it.produk_id,
        qty_order: it.qty_order,
        harga_satuan: it.harga_satuan,
      })),
      catatan,
    }
    setLoading(true)
    try {
      await wmsApi.createPO(payload)
      navigate('/wms/po')
    } catch (err: any) {
      console.error(err)
      alert(err.response?.data?.detail || 'Gagal membuat PO')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="BUAT PURCHASE ORDER" glow="cyan">
      <button onClick={() => navigate('/wms/po')} className="flex items-center gap-1 text-text-dim hover:text-neon-cyan mb-4">
        <ArrowLeft className="w-4 h-4" /> KEMBALI
      </button>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label className="text-xs font-semibold tracking-[1px] uppercase text-text-dim">Supplier</label>
          <select
            value={selectedSupplier}
            onChange={e => setSelectedSupplier(e.target.value)}
            className="input-neon w-full mt-1"
            required
          >
            <option value="">-- Pilih Supplier --</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
          </select>
        </div>
        <div className="border-t border-[rgba(0,245,255,0.15)] pt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Item</h3>
            <Button type="button" variant="secondary" onClick={addItem}>
              <Plus className="w-3 h-3 mr-1" /> TAMBAH ITEM
            </Button>
          </div>
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-end mb-2">
              <div className="flex-1">
                <label className="text-xs font-semibold tracking-[1px] uppercase text-text-dim">Produk</label>
                <select
                  value={item.produk_id}
                  onChange={e => updateItem(index, 'produk_id', e.target.value)}
                  className="input-neon w-full py-1 mt-1"
                  required
                >
                  <option value="">Pilih</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.nama} (Rp {p.harga_jual})</option>)}
                </select>
              </div>
              <div className="w-20">
                <label className="text-xs font-semibold tracking-[1px] uppercase text-text-dim">Qty</label>
                <Input
                  type="number"
                  min={1}
                  value={item.qty_order}
                  onChange={e => updateItem(index, 'qty_order', parseInt(e.target.value))}
                  required
                />
              </div>
              <div className="w-28">
                <label className="text-xs font-semibold tracking-[1px] uppercase text-text-dim">Harga</label>
                <Input
                  type="number"
                  step="0.01"
                  value={item.harga_satuan}
                  onChange={e => updateItem(index, 'harga_satuan', parseFloat(e.target.value))}
                  required
                />
              </div>
              <button type="button" onClick={() => removeItem(index)} className="text-[var(--neon-pink)] hover:text-red-400 mb-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <Input label="Catatan" value={catatan} onChange={e => setCatatan(e.target.value)} />
        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={loading}>SIMPAN PO</Button>
          <Button variant="secondary" type="button" onClick={() => navigate('/wms/po')}>BATAL</Button>
        </div>
      </form>
    </Card>
  )
}

export default PurchaseOrderForm